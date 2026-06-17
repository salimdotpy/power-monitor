from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class PowerLogs(db.Model):
    __tablename__ = "power_logs"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    status = db.Column(db.Boolean, default=True)
    startTime = db.Column(db.DateTime, default=datetime.utcnow)
    interval = db.Column(db.DateTime)
    endTime = db.Column(db.DateTime, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'status': self.status,
            'startTime': self.startTime.isoformat() if self.startTime else None,
            'interval': self.interval.isoformat() if self.interval else None,
            'endTime': self.endTime.isoformat() if self.endTime else None,
        }

class Setting(db.Model):
    __tablename__ = "settings"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    sendEmail = db.Column(db.Boolean, default=True)
    mobile = db.Column(db.String(100), unique=True, nullable=False)
    sendSms = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id':self.id,
            'email': self.email,
            'sendEmail': self.sendEmail,
            'mobile': self.mobile,
            'sendSms': self.sendSms,
        }