from flask import Flask, render_template
from flask_cors import CORS
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, supports_credentials=True, origins='*')

@app.route('/')
def index_route():
    return render_template('index.html', pageTitle="Power Monitor")

@app.route("/settings", methods=['GET', 'POST'])
def settings_route():
    return render_template('settings.html', pageTitle="Settings")

@app.route("/logs", methods=['GET', 'POST'])
def logs_route():
    return render_template('logs.html', pageTitle="Log records")

if __name__ == '__main__':
    app.run(debug=True)
