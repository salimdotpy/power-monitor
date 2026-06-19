from flask import Flask, jsonify, flash, render_template, request, redirect
from flask_migrate import Migrate
from flask_cors import CORS
from models import db, Setting, PowerLogs
from config import Config
import re
from datetime import datetime
from flask_mailman import Mail, EmailMessage
from utlis import mail_template, format_duration
from sqlalchemy import text

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
mail = Mail(app)

migrate = Migrate(app, db)
CORS(app, supports_credentials=True, origins='*')

@app.route('/')
def index_route():
    pageTitle = "Power Monitor"
    return render_template('index.html', pageTitle=pageTitle)

@app.route("/settings", methods=['GET', 'POST'])
def settings_route():
    pageTitle = "Settings"
    settings = Setting.query.filter_by(id=1).first()
    settings = Setting.to_dict(settings) if settings else {}

    if request.method == "POST":
        email = request.form.get("email").strip()
        sendEmail = request.form.get("sendEmail", False, type=bool)
        mobile = request.form.get("mobile").strip()
        sendSms = request.form.get("sendSms", False, type=bool)
        # Validation checks
        for key, val in request.form.items():
            if key not in ['sendEmail', 'sendSms'] and not val:
                msg = ['Please fill out the form!', 'error']
        if not re.match(r'[^@]+@[^@]+\.[^@]+', email) or len(email) > 30:
            msg = ['Invalid email address!', 'error']
        elif not int(mobile) or len(mobile) != 11:
            msg = ['Invalid phone number!', 'error']
        else:
            settings = Setting.query.get(1)
            if settings:
                settings.email=email; settings.sendEmail=sendEmail; settings.mobile=mobile; settings.sendSms=sendSms
            else:
                settings = Setting(email=email, sendEmail=sendEmail, mobile=mobile, sendSms=sendSms)
                db.session.add(settings)
            try:
                db.session.commit()
                msg = ['Settings updated successfully!', 'success']
            except Exception as e:
                db.session.rollback()
                msg = ['Something went wrong, Please try again!', 'error']
        flash(msg[0], (msg[1]))
        return redirect(request.referrer)
    return render_template('settings.html', pageTitle=pageTitle, settings=settings)

@app.route("/logs", methods=['GET', 'POST'])
def logs_route():
    pageTitle = "Log records"
    logs = PowerLogs.query.all()
    return render_template('logs.html', pageTitle=pageTitle, logs=logs)

@app.route("/api/logs", methods=['GET', 'POST'])
def logs_api():
    logs = PowerLogs.query.order_by(PowerLogs.id.desc()).all()
    logs = [PowerLogs.to_dict(log) for log in logs]

    if request.method == "POST":
        data = request.get_json()
        status = data.get('status')
        now = datetime.now()
        lastLog = PowerLogs.query.order_by(PowerLogs.id.desc()).limit(1).first()
        try:
            # if lastLog and lastLog.status == status:
            #     status = not status
            if lastLog and lastLog.status == status:
                print(f'Duplicate state ignored: Power is already {'plugged in' if status else 'plugged out'}.')
                return jsonify({ 'success': False })
            if lastLog:
                lastStartTime = lastLog.startTime or now
                interval = now - lastStartTime
                interval = datetime.fromtimestamp(interval.total_seconds())
                # update prev log
                lastLog.endTime = now; lastLog.interval = interval
            # Insert new record with status and current startTime
            # endTime and interval remain blank/undefined until the next event
            db.session.add(PowerLogs(status=status, startTime=now))
            db.session.commit()
            return jsonify({ 'success': lastLog.status != status })
        except Exception as e:
            print(e, '==========')
            db.session.rollback()
            return jsonify({ 'success': False, 'error': f'{e}' })
    return jsonify({'logs': logs}), 200

@app.route("/api/send-mail", methods=['GET', 'POST'])
def send_mail_api():
    data = request.get_json()
    status = data.get('status')
    settings = Setting.query.filter_by(id=1).first()
    if not settings:
        return jsonify({ 'success': False })
    
    try:
        logs = PowerLogs.query.order_by(PowerLogs.id.desc()).limit(2).all()
        activeLog = logs[0]
        closedLog = logs[1] if len(logs)==2 else None
        text =  "Connected to Power" if status else "Disconnected from Power"
        duration = "N/A"
        if closedLog:
            # duration = closedLog.interval - datetime(1970, 1, 1)
            duration = closedLog.endTime - closedLog.startTime
            duration = format_duration(duration)
        icon = '🔌' if status else '🔋'
        email = settings.email
        name = email.split('@')[0] or 'admin'
        time = activeLog.startTime.strftime("%d/%m/%Y, %I:%M:%S %p")
        message = mail_template(text, icon, time, duration)
        send_msg = EmailMessage(subject=f'{text} Alert', body=message, to=[settings.email],)
        send_msg.content_subtype = "html"
        send_msg.send()
        print("Sent")
        return jsonify({ 'success': True })
    except Exception as e:
        print(f"Error sending mail {e}")
        return jsonify({ 'success': False })
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run()

"""
const sendStatusEmail = async (isCharging) => {
      try {
        const data = await getSettings();
        if (!data) return;
        // Fetch the last closed log and the new active log for the email body
        const logs = await db.powerLogs.orderBy('id').reverse().limit(2).toArray();
        const activeLog = logs[0]; // The log just inserted
        const closedLog = logs[1]; // The previous log that was just closed

        const statusText = isCharging ? "Connected to Power" : "Disconnected from Power";
        const durationText = closedLog ? formatDuration(closedLog.interval) : "N/A";
        const statusIcon = isCharging ? '🔌' : '🔋'
        const email = data?.email;
        const name = email?.split('@')[0] || 'admin';
        const templateParams = {
          status_text: statusText,
          time: new Date(activeLog.startTime).toLocaleString(),
          duration: durationText,
          status_icon: statusIcon,
          name,
          email,
        };

        // Send template out via EmailJS
        await emailjs.send('service_amru6ti', 'template_0kkr9gx', templateParams);
        console.log('Status email dispatched successfully.');
      } catch (error) {
        console.error('EmailJS failed to dispatch:', error);
      }
    };
"""
