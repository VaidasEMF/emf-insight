from pathlib import Path
import os

from dotenv import load_dotenv


# ==================================================
# ENVIRONMENT
# ==================================================

BASE_DIR = Path(__file__).resolve().parent

ENVIRONMENT = os.getenv("EMF_ENV", "production").lower()

if ENVIRONMENT == "staging":
    ENV_FILE = BASE_DIR / ".env.staging"
elif ENVIRONMENT == "production":
    ENV_FILE = BASE_DIR / ".env"
else:
    raise RuntimeError(
        f"Unsupported EMF_ENV: {ENVIRONMENT}"
    )

if not ENV_FILE.exists():
    raise RuntimeError(
        f"Environment file not found: {ENV_FILE}"
    )

load_dotenv(ENV_FILE)


# ==================================================
# JWT
# ==================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY"
)

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is not configured in backend/.env"
    )


# ==================================================
# DATABASE
# ==================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./app.db",
)

# ==================================================
# SUPABASE STORAGE
# ==================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is not configured in backend/.env"
    )

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "SUPABASE_SERVICE_ROLE_KEY is not configured in backend/.env"
    )