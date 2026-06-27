import os
from dotenv import load_dotenv

# Determine environment
env = load_dotenv(".env.development")

# Load local .env only in development
if not env:
    load_dotenv("/home/poms/mysite/.env.production")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_POOL_RECYCLE = 299
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Debugging
    DEBUG = env
    THREADED = True

    # Mail settings
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = (
        os.getenv("MAIL_DEFAULT_SENDER_NAME", "Power Monitor"),
        os.getenv("MAIL_DEFAULT_SENDER_EMAIL", "salimdotpy@gmail.com"),
    )
