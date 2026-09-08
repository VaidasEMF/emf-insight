import os

from sqlalchemy import text

from auth.passwords import hash_password

from .database import engine
from .base import Base

# IMPORT MODELS
from models.user import User
from models.project import Project
from models.report import Report
from models.pricing import Pricing


def init_db():

    Base.metadata.create_all(
        bind=engine,
    )

    # ==================================================
    # DATABASE MIGRATIONS
    # ==================================================

    if engine.dialect.name == "postgresql":

        with engine.begin() as connection:

            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS first_name VARCHAR DEFAULT ''
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS last_name VARCHAR DEFAULT ''
                    """
                )
            )

            admin_email = os.getenv("ADMIN_EMAIL")
            reset_password = os.getenv("ADMIN_RESET_PASSWORD")

            if admin_email:

                connection.execute(
                    text(
                        """
                        UPDATE users
                        SET is_admin = TRUE
                        WHERE email = :email
                        """
                    ),
                    {
                        "email": admin_email,
                    },
                )

            if admin_email and reset_password:

                hashed_password = hash_password(
                    reset_password
                )

                connection.execute(
                    text(
                        """
                        UPDATE users
                        SET is_admin = TRUE,
                            hashed_password = :hashed_password
                        WHERE email = :email
                        """
                    ),
                    {
                        "email": admin_email,
                        "hashed_password": hashed_password,
                    },
                )

            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP
                    """
                )
            )
