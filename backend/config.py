from pathlib import Path
import os

from dotenv import load_dotenv


# ==================================================
# ENVIRONMENT
# ==================================================

BASE_DIR = Path(__file__).resolve().parent

ENVIRONMENT = os.getenv("EMF_ENV", "production").strip().lower()

if ENVIRONMENT == "staging":
    ENV_FILE = BASE_DIR / ".env.staging"

    if not ENV_FILE.is_file():
        raise RuntimeError(
            f"Staging environment file not found: {ENV_FILE}"
        )

    load_dotenv(ENV_FILE, override=False)

elif ENVIRONMENT == "production":
    ENV_FILE = BASE_DIR / ".env"

    # Production on Render uses Environment Variables.
    # Local production may additionally use a .env file.
    if ENV_FILE.is_file():
        load_dotenv(ENV_FILE, override=False)

else:
    raise RuntimeError(
        f"Unsupported EMF_ENV: {ENVIRONMENT}"
    )

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