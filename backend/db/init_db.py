import os

from sqlalchemy import text

from .database import engine
from .base import Base

# IMPORT MODELS
from models.user import User
from models.project import Project
from models.report import Report
from models.pricing import Pricing
from models.report_credit_ledger import ReportCreditLedger


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
                        postal_code VARCHAR(30),
                        requested_service VARCHAR(100),
                        status VARCHAR(50) NOT NULL DEFAULT 'open',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )

            connection.execute(text("""
                ALTER TABLE professional_requests
                ADD COLUMN IF NOT EXISTS postal_code VARCHAR(30)
            """))

            connection.execute(text("""
                ALTER TABLE professional_requests
                ADD COLUMN IF NOT EXISTS requested_service VARCHAR(100)
            """))

            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS professional_profiles (
                        id SERIAL PRIMARY KEY,
                        user_id VARCHAR(255) NOT NULL UNIQUE,
                        first_name VARCHAR(100),
                        last_name VARCHAR(100),
                        company_name VARCHAR(200),
                        professional_email VARCHAR(255),
                        professional_phone VARCHAR(50),
                        phone_country_code VARCHAR(10),
                        country_code VARCHAR(2),
                        country VARCHAR(100),
                        city VARCHAR(100),
                        postal_code VARCHAR(30),
                        availability_status VARCHAR(50) NOT NULL DEFAULT 'unavailable',
                        verification_status VARCHAR(50) NOT NULL DEFAULT 'not_requested',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )


            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS professional_service_areas (
                        id SERIAL PRIMARY KEY,
                        professional_profile_id INTEGER NOT NULL,
                        country VARCHAR(100) NOT NULL,
                        region VARCHAR(100),
                        city VARCHAR(100),
                        postal_code VARCHAR(30),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )

            # =====================
            # PROFESSIONAL PROFILE COLUMNS
            # =====================

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_profiles
                    ADD COLUMN IF NOT EXISTS country_code VARCHAR(2)
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_profiles
                    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_profiles
                    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_profiles
                    ADD COLUMN IF NOT EXISTS company_name VARCHAR(200)
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_profiles
                    ADD COLUMN IF NOT EXISTS professional_email VARCHAR(255)
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_profiles
                    ADD COLUMN IF NOT EXISTS professional_phone VARCHAR(50)
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_profiles
                    ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(10)
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_profiles
                    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50)
                    NOT NULL DEFAULT 'pending'
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_requests
                    ADD COLUMN IF NOT EXISTS country_code VARCHAR(2)
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
    # PROFESSIONAL DEMO LINKS
    # ==================================================

    if engine.dialect.name == "postgresql":

       with engine.begin() as connection:

            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS professional_demo_links (
                        id SERIAL PRIMARY KEY,
                        token VARCHAR(255) NOT NULL UNIQUE,
                        status VARCHAR(30) NOT NULL DEFAULT 'available',
                        duration_days INTEGER NOT NULL DEFAULT 7,
                        user_id VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        activated_at TIMESTAMP,
                        expires_at TIMESTAMP
                    )
                    """
                )
            )

            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS professional_demo_feedback (
                        id SERIAL PRIMARY KEY,
                        demo_id INTEGER NOT NULL,
                        user_id VARCHAR(255) NOT NULL,

                        overall_rating INTEGER,
                        business_survey_rating INTEGER,
                        measurements_rating INTEGER,
                        results_rating INTEGER,
                        pdf_rating INTEGER,

                        confusing_text TEXT,
                        missing_features TEXT,
                        bugs_text TEXT,
                        improvements_text TEXT,

                        professional_use BOOLEAN,
                        recommendation_score INTEGER,

                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_demo_links
                    ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 7
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_demo_links
                    ADD COLUMN IF NOT EXISTS request_feedback BOOLEAN NOT NULL DEFAULT TRUE
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_demo_links
                    ADD COLUMN IF NOT EXISTS sent_to VARCHAR(255)
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE professional_demo_links
                    ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP
                    """
                )
            )

            connection.execute(
                text("""
                    ALTER TABLE professional_demo_feedback
                    ADD COLUMN IF NOT EXISTS experience_level TEXT
                """)
            )

            connection.execute(
                text("""
                    ALTER TABLE professional_demo_feedback
                    ADD COLUMN IF NOT EXISTS experience_years TEXT
                """)
            )

            connection.execute(
                text("""
                    ALTER TABLE professional_demo_feedback
                    ADD COLUMN IF NOT EXISTS background_text TEXT
                """)
            )

            connection.execute(
                text("""
                    ALTER TABLE professional_demo_feedback
                    ADD COLUMN IF NOT EXISTS home_projects_clarity TEXT
                """)
            )

            connection.execute(
                text("""
                    ALTER TABLE professional_demo_feedback
                    ADD COLUMN IF NOT EXISTS home_projects_clarity_text TEXT
                """)
            )

            connection.execute(
                text("""
                    ALTER TABLE professional_demo_feedback
                    ADD COLUMN IF NOT EXISTS work_type TEXT
                """)
            )

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
                    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'
                    """
                )
            )

            connection.execute(
                text(
                    """
                    UPDATE users
                    SET role = 'professional'
                    WHERE role = 'user'
                      AND EXISTS (
                          SELECT 1
                          FROM professional_profiles
                          WHERE professional_profiles.user_id = CAST(users.id AS VARCHAR)
                      )
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
