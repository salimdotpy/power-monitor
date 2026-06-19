import os

# Determine environment
env = os.getenv("FLASK_ENV", "development")

# Load local .env only in development
if env == "development":
    from dotenv import load_dotenv
    load_dotenv(".env.development")
else:
    from dotenv import load_dotenv
    load_dotenv(".env.production")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_POOL_RECYCLE = 299
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Debugging
    DEBUG = env == "development"
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
