import os

from sqlalchemy import text

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
    # PROFESSIONAL REQUESTS
    # ==================================================

    if engine.dialect.name == "postgresql":

        with engine.begin() as connection:

            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS professional_requests (
                        id SERIAL PRIMARY KEY,
                        user_id VARCHAR(255) NOT NULL,
                        project_id VARCHAR(255),
                        country VARCHAR(100),
                        region VARCHAR(100),
                        city VARCHAR(100),
                        status VARCHAR(50) NOT NULL DEFAULT 'open',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )

            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS home_entitlements (
                        user_id VARCHAR(255) PRIMARY KEY,
                        full_report_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
                        stripe_session_id VARCHAR(255),
                        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
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

            pricing_count = connection.execute(
                text(
                    """
                    SELECT COUNT(*)
                    FROM pricing
                    """
                )
            ).scalar()

            if pricing_count == 0:

                connection.execute(
                    text(
                        """
                        INSERT INTO pricing
                            (
                                region,
                                currency,
                                product_key,
                                name,
                                price,
                                billing,
                                credits,
                                available
                            )
                        VALUES
                            (
                                'EU',
                                'EUR',
                                'HOME_FULL_REPORT',
                                'Full EMF Insight Report',
                                9,
                                'one_time',
                                0,
                                TRUE
                            ),
                            (
                                'EU',
                                'EUR',
                                'BUSINESS_SINGLE',
                                'Single Report',
                                9,
                                'one_time',
                                1,
                                TRUE
                            ),
                            (
                                'EU',
                                'EUR',
                                'BUSINESS_PRO',
                                'Pro',
                                19,
                                'monthly',
                                5,
                                TRUE
                            ),
                            (
                                'EU',
                                'EUR',
                                'BUSINESS_PREMIUM',
                                'Premium',
                                NULL,
                                'monthly',
                                NULL,
                                FALSE
                            ),
                            (
                                'US',
                                'USD',
                                'HOME_FULL_REPORT',
                                'Full EMF Insight Report',
                                9,
                                'one_time',
                                0,
                                TRUE
                            ),
                            (
                                'US',
                                'USD',
                                'BUSINESS_SINGLE',
                                'Single Report',
                                9,
                                'one_time',
                                1,
                                TRUE
                            ),
                            (
                                'US',
                                'USD',
                                'BUSINESS_PRO',
                                'Pro',
                                19,
                                'monthly',
                                5,
                                TRUE
                            ),
                            (
                                'US',
                                'USD',
                                'BUSINESS_PREMIUM',
                                'Premium',
                                NULL,
                                'monthly',
                                NULL,
                                FALSE
                            )
                        """
                    )
                )
