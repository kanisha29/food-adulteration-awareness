import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SECRET_KEY = os.environ.get("SECRET_KEY", "change-this-secret-in-production")
DB_PATH = os.path.join(BASE_DIR, "database", "food_awareness.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB
TOKEN_MAX_AGE = 60 * 60 * 24 * 7  # 7 days
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
DISCLAIMER = ("These checks are for awareness and educational purposes only. They do not confirm "
              "adulteration. Laboratory testing may be required for definitive confirmation.")
