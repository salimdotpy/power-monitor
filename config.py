import os
from dotenv import load_dotenv

# Determine environment
env = load_dotenv(".env.development")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

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
