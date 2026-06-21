import os
from dotenv import load_dotenv
import base64
import tempfile

# Determine environment
env = load_dotenv(".env.development")

# Load local .env only in development
if not env:
    load_dotenv("/home/poms/mysite/.env.production")

ca_b64 = os.getenv("AIVEN_CA_CERT_BASE64")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    if ca_b64:
        cert_data = base64.b64decode(ca_b64)

        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=".pem",
            delete=False
        ) as f:
            f.write(cert_data)
            ca_path = f.name

        SQLALCHEMY_ENGINE_OPTIONS = {
            "connect_args": {
                "ssl": {
                    "ca": ca_path
                }
            }
        }
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
