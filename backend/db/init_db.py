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
from models.notification import Notification
from models.project_version import ProjectVersion

from models.property import Property
from models.property_health_record import PropertyHealthRecord
from models.assessment import Assessment
from models.home_deeper_analysis import HomeDeeperAnalysis
from models.measurement_cycle import MeasurementCycle
from models.measurement_cycle_floor import MeasurementCycleFloor
from models.measurement_cycle_data import MeasurementCycleData

def init_db():

    Base.metadata.create_all(
        bind=engine,
    )

        # ==================================================
    # PROPERTY REFERENCE NUMBERS
    # ==================================================

    if engine.dialect.name == "postgresql":
        with engine.begin() as connection:

            connection.execute(text("""
                ALTER TABLE properties
                ADD COLUMN IF NOT EXISTS property_reference VARCHAR(30)
            """))

            connection.execute(text("""
                ALTER TABLE property_health_records
                ADD COLUMN IF NOT EXISTS phr_reference VARCHAR(30)
            """))

    if engine.dialect.name == "postgresql":
        with engine.begin() as connection:

            # ==========================================
            # HOME DEEPER ANALYSIS → PHR / CYCLE LINKS
            # ==========================================

            existing_columns = set(
                connection.execute(text("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = current_schema()
                      AND table_name = 'home_deeper_analyses'
                """)).scalars().all()
            )

            required_columns = {
                "property_id",
                "property_health_record_id",
                "measurement_cycle_id",
                "measurement_cycle_number",
                "coverage_percent",
            }

            missing_columns = required_columns - existing_columns

            if missing_columns:

                connection.execute(text("""
                    ALTER TABLE home_deeper_analyses
                    ADD COLUMN IF NOT EXISTS property_id INTEGER
                    REFERENCES properties(id)
                """))

                connection.execute(text("""
                    ALTER TABLE home_deeper_analyses
                    ADD COLUMN IF NOT EXISTS property_health_record_id INTEGER
                    REFERENCES property_health_records(id)
                """))

                connection.execute(text("""
                    ALTER TABLE home_deeper_analyses
                    ADD COLUMN IF NOT EXISTS measurement_cycle_id INTEGER
                    REFERENCES measurement_cycles(id)
                """))

                connection.execute(text("""
                    ALTER TABLE home_deeper_analyses
                    ADD COLUMN IF NOT EXISTS measurement_cycle_number INTEGER
                """))

                connection.execute(text("""
                    ALTER TABLE home_deeper_analyses
                    ADD COLUMN IF NOT EXISTS coverage_percent INTEGER
                """))

            # ==========================================
            # CREATE ONLY MISSING INDEXES
            # ==========================================

            existing_indexes = set(
                connection.execute(text("""
                    SELECT indexname
                    FROM pg_indexes
                    WHERE schemaname = current_schema()
                      AND tablename = 'home_deeper_analyses'
                """)).scalars().all()
            )

            required_indexes = {
                "ix_home_deeper_analyses_property_id": "property_id",
                "ix_home_deeper_analyses_property_health_record_id": "property_health_record_id",
                "ix_home_deeper_analyses_measurement_cycle_id": "measurement_cycle_id",
            }

            for index_name, column_name in required_indexes.items():
                if index_name not in existing_indexes:
                    connection.execute(text(f"""
                        CREATE INDEX {index_name}
                        ON home_deeper_analyses ({column_name})
                    """))

            # ==========================================
            # REPORTS

            # ==========================================

            connection.execute(text("""
                ALTER TABLE reports
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP
                NOT NULL DEFAULT CURRENT_TIMESTAMP
            """))

            connection.execute(text("""
                ALTER TABLE reports
                ADD COLUMN IF NOT EXISTS workspace VARCHAR(20)
                NOT NULL DEFAULT 'business'
            """))

            connection.execute(text("""
                ALTER TABLE reports
                ADD COLUMN IF NOT EXISTS property_id INTEGER
                REFERENCES properties(id)
            """))

            connection.execute(text("""
                ALTER TABLE reports
                ADD COLUMN IF NOT EXISTS property_health_record_id INTEGER
                REFERENCES property_health_records(id)
            """))

            connection.execute(text("""
                ALTER TABLE reports
                ADD COLUMN IF NOT EXISTS assessment_id INTEGER
                REFERENCES assessments(id)
            """))

            connection.execute(text("""
                ALTER TABLE reports
                ADD COLUMN IF NOT EXISTS report_type VARCHAR(50)
            """))

            # ==========================================
            # PROJECTS
            # ==========================================

            connection.execute(text("""
                ALTER TABLE projects
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP
                NOT NULL DEFAULT CURRENT_TIMESTAMP
            """))

            connection.execute(text("""
                ALTER TABLE projects
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
                NOT NULL DEFAULT CURRENT_TIMESTAMP
            """))

            # ==========================================
            # PROJECT -> PROPERTY RELATION
            # ==========================================

            connection.execute(text("""
                ALTER TABLE projects
                ADD COLUMN IF NOT EXISTS property_id INTEGER
            """))

            connection.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'fk_projects_property_id'
                    ) THEN
                        ALTER TABLE projects
                        ADD CONSTRAINT fk_projects_property_id
                        FOREIGN KEY (property_id)
                        REFERENCES properties(id);
                    END IF;
                END
                $$
            """))

            connection.execute(text("""
                CREATE INDEX IF NOT EXISTS ix_projects_property_id
                ON projects(property_id)
            """))

            connection.execute(text("""
                UPDATE projects p
                SET property_id = pr.id
                FROM properties pr
                WHERE p.data->>'type' = 'home'
                  AND p.data->>'propertyId' = pr.property_uid
                  AND p.property_id IS NULL
            """))

     # ==================================================
    # PROFESSIONAL REQUESTS
    # ==================================================

    if engine.dialect.name == "postgresql":

        with engine.begin() as connection:

            # =====================
            # ACCOUNT NOTIFICATIONS
            # =====================

            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS notifications (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        message TEXT NOT NULL,
                        type VARCHAR(50) NOT NULL DEFAULT 'info',
                        is_read BOOLEAN NOT NULL DEFAULT FALSE,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )

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
                        status VARCHAR(50) NOT NULL DEFAULT 'available',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )

            # =====================
            # PROFESSIONAL ASSESSMENT LINK
            # =====================

            connection.execute(text("""
                ALTER TABLE assessments
                ADD COLUMN IF NOT EXISTS professional_request_id INTEGER
            """))

            # ==========================================
            # PROFESSIONAL REQUEST CONTACTS
            # ==========================================

            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS professional_request_contacts (
                    id SERIAL PRIMARY KEY,
                    request_id INTEGER NOT NULL,
                    professional_user_id VARCHAR(255) NOT NULL,
                    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    duration_days INTEGER NOT NULL DEFAULT 14
                )
            """))

            # =====================
            # ASSESSMENT ↔ UNLOCK LINK
            # =====================

            connection.execute(text("""
                ALTER TABLE assessments
                ADD COLUMN IF NOT EXISTS professional_request_contact_id INTEGER
            """))

            connection.execute(text("""
                CREATE INDEX IF NOT EXISTS
                ix_assessments_professional_request_contact_id
                ON assessments (professional_request_contact_id)
            """))

            connection.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'fk_assessments_professional_request_contact_id'
                    ) THEN
                        ALTER TABLE assessments
                        ADD CONSTRAINT fk_assessments_professional_request_contact_id
                        FOREIGN KEY (professional_request_contact_id)
                        REFERENCES professional_request_contacts(id)
                        ON DELETE RESTRICT;
                    END IF;
                END
                $$;
            """))

            connection.execute(text("""
                ALTER TABLE assessments
                ADD COLUMN IF NOT EXISTS client_project_id INTEGER
            """))

            connection.execute(text("""
                CREATE INDEX IF NOT EXISTS
                ix_assessments_client_project_id
                ON assessments (client_project_id)
            """))

            connection.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'fk_assessments_client_project_id'
                    ) THEN
                        ALTER TABLE assessments
                        ADD CONSTRAINT fk_assessments_client_project_id
                        FOREIGN KEY (client_project_id)
                        REFERENCES projects(id)
                        ON DELETE SET NULL;
                    END IF;
                END
                $$;
            """))

            connection.execute(text("""
                ALTER TABLE assessments
                ADD COLUMN IF NOT EXISTS display_reference VARCHAR(50)
            """))

            connection.execute(text("""
                CREATE UNIQUE INDEX IF NOT EXISTS
                uq_assessments_display_reference
                ON assessments (display_reference)
                WHERE display_reference IS NOT NULL
            """))

            connection.execute(text("""
                DROP INDEX IF EXISTS uq_assessments_professional_request_id
            """))

            connection.execute(text("""
                DROP INDEX IF EXISTS uq_assessments_request_professional
            """))

            connection.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'fk_assessments_professional_request_id'
                    ) THEN
                        ALTER TABLE assessments
                        ADD CONSTRAINT fk_assessments_professional_request_id
                        FOREIGN KEY (professional_request_id)
                        REFERENCES professional_requests(id)
                        ON DELETE SET NULL;
                    END IF;
                END
                $$;
            """))

            connection.execute(text("""
                ALTER TABLE assessments
                ADD COLUMN IF NOT EXISTS professional_user_id VARCHAR(255)
            """))

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

            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS home_project_entitlements (
                        project_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255) NOT NULL,
                        full_report_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
                        stripe_session_id VARCHAR(255),
                        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
)
                
            # =====================
            # HOME WELLNESS ENTITLEMENTS
            # =====================

            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS home_wellness_entitlements (
                        id BIGSERIAL PRIMARY KEY,
                        user_id VARCHAR(255) NOT NULL,
                        project_id VARCHAR(255),
                        entitlement_type VARCHAR(50) NOT NULL,
                        status VARCHAR(30) NOT NULL DEFAULT 'active',
                        starts_at TIMESTAMP,
                        expires_at TIMESTAMP,
                        stripe_subscription_id VARCHAR(255),
                        stripe_session_id VARCHAR(255),
                        current_period_start TIMESTAMP,
                        current_period_end TIMESTAMP,
                        cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )

            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS home_wellness_transactions (
                        id BIGSERIAL PRIMARY KEY,
                        user_id VARCHAR(255) NOT NULL,
                        project_id VARCHAR(255) NOT NULL,
                        product_key VARCHAR(100) NOT NULL,
                        stripe_session_id VARCHAR(255) NOT NULL UNIQUE,
                        stripe_payment_intent_id VARCHAR(255),
                        amount INTEGER,
                        currency VARCHAR(10),
                        status VARCHAR(30) NOT NULL DEFAULT 'completed',
                        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )

            connection.execute(
                text("""
                    ALTER TABLE home_wellness_transactions
                    ADD COLUMN IF NOT EXISTS usage_status VARCHAR(30)
                    NOT NULL DEFAULT 'not_used'
                """)
            )

            connection.execute(
                text("""
                    ALTER TABLE home_wellness_transactions
                    ADD COLUMN IF NOT EXISTS report_id INTEGER
                """)
            )

            connection.execute(
                text("""
                    ALTER TABLE home_wellness_transactions
                    ADD COLUMN IF NOT EXISTS used_at TIMESTAMP
                """)
            )

            # =====================
            # USER LOCATION
            # =====================

            connection.execute(
                text("""
                    ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS country VARCHAR(100)
                """)
            )

            connection.execute(
                text("""
                    ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS city VARCHAR(100)
                """)
            )


            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS
                    account_status VARCHAR(20)
                    NOT NULL DEFAULT 'active'
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
                                39,
                                'monthly',
                                5,
                                TRUE
                            ),

                            (
                                'EU',
                                'EUR',
                                'PROFESSIONAL',
                                'Professional',
                                79,
                                'monthly',
                                25,
                                TRUE
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
                                39,
                                'monthly',
                                5,
                                TRUE
                            ),

                            (
                                'US',
                                'USD',
                                'PROFESSIONAL',
                                'Professional',
                                79,
                                'monthly',
                                25,
                                TRUE
                            )
                        """
                    )
                )

            # Ensure Home Simple Report pricing exists for both regions.
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
                    SELECT
                        'EU',
                        'EUR',
                        'HOME_SIMPLE_REPORT',
                        'Simple Property EMF Report',
                        15,
                        'one_time',
                        0,
                        TRUE
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM pricing
                        WHERE region = 'EU'
                          AND currency = 'EUR'
                          AND product_key = 'HOME_SIMPLE_REPORT'
                    )
                    """
                )
            )

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
                    SELECT
                        'US',
                        'USD',
                        'HOME_SIMPLE_REPORT',
                        'Simple Property EMF Report',
                        15,
                        'one_time',
                        0,
                        TRUE
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM pricing
                        WHERE region = 'US'
                          AND currency = 'USD'
                          AND product_key = 'HOME_SIMPLE_REPORT'
                    )
                    """
                )
            )

            # Ensure Home Measure Monthly pricing exists for both regions.
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
                    SELECT
                        'EU',
                        'EUR',
                        'HOME_MEASURE_MONTHLY',
                        'Measure My Property',
                        19,
                        'monthly',
                        0,
                        TRUE
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM pricing
                        WHERE region = 'EU'
                          AND currency = 'EUR'
                          AND product_key = 'HOME_MEASURE_MONTHLY'
                    )
                    """
                )
            )

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
                    SELECT
                        'US',
                        'USD',
                        'HOME_MEASURE_MONTHLY',
                        'Measure My Property',
                        19,
                        'monthly',
                        0,
                        TRUE
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM pricing
                        WHERE region = 'US'
                          AND currency = 'USD'
                          AND product_key = 'HOME_MEASURE_MONTHLY'
                    )
                    """
                )
            )

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
                    SELECT
                        'US',
                        'USD',
                        'HOME_DEEPER_ANALYSIS_FIRST',
                        'Deeper Understanding',
                        49,
                        'one_time',
                        0,
                        TRUE
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM pricing
                        WHERE region = 'US'
                          AND currency = 'USD'
                          AND product_key = 'HOME_DEEPER_ANALYSIS_FIRST'
                    )
                    """
                )
            )

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
                    SELECT
                        'EU',
                        'EUR',
                        'HOME_DEEPER_ANALYSIS_FIRST',
                        'Deeper Understanding',
                        49,
                        'one_time',
                        0,
                        TRUE
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM pricing
                        WHERE region = 'EU'
                          AND currency = 'EUR'
                          AND product_key = 'HOME_DEEPER_ANALYSIS_FIRST'
                    )
                    """
                )
            )


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
                    SELECT
                        'EU',
                        'EUR',
                        'HOME_DEEPER_ANALYSIS_REPEAT',
                        'Deeper Understanding – Repeat Analysis',
                        29,
                        'one_time',
                        0,
                        TRUE
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM pricing
                        WHERE region = 'EU'
                          AND currency = 'EUR'
                          AND product_key = 'HOME_DEEPER_ANALYSIS_REPEAT'
                    )
                    """
                )
            )


            # ==========================================
            # BACKFILL PROPERTY REFERENCE NUMBERS
            # ==========================================

            connection.execute(text("""
                UPDATE properties
                SET property_reference =
                    'PROP-' ||
                    EXTRACT(YEAR FROM created_at)::INTEGER::TEXT ||
                    '-' ||
                    LPAD(id::TEXT, 6, '0')
                WHERE property_reference IS NULL
            """))

            # ==========================================
            # BACKFILL PHR REFERENCE NUMBERS
            # ==========================================

            connection.execute(text("""
                UPDATE property_health_records
                SET phr_reference =
                    'PHR-' ||
                    EXTRACT(YEAR FROM created_at)::INTEGER::TEXT ||
                    '-' ||
                    LPAD(id::TEXT, 6, '0')
                WHERE phr_reference IS NULL
            """))
