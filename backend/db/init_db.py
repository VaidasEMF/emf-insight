from sqlalchemy import text

from .database import engine
from .base import Base

# IMPORT MODELS
from models.user import User
from models.project import Project
from models.report import Report


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
