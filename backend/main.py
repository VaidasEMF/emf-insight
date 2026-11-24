# =====================
# IMPORTS
# =====================

import os
import uuid
import traceback
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

from fastapi import (
    FastAPI,
    HTTPException,
    Request,
    Depends,
)

from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

from routes.pricing import router as pricing_router

from routes.admin_pricing import router as admin_pricing_router

from routes.admin_professionals import (
    router as admin_professionals_router,
)

import stripe

import engine
from engine.analysis.business.analysis import (
    build_business_analysis,
)

from db.database import SessionLocal
from services.professional_assessment_access import (
    get_professional_project_access,
    require_active_edit,
)
from storage import supabase

from models.user import User
from models.project import Project

from models.property import Property
from models.property_health_record import PropertyHealthRecord
from models.assessment import Assessment
from models.report_credit_ledger import ReportCreditLedger
from models.report import Report

from auth.entitlements import (
    is_professional_demo_active,
)

from models.project_version import (
    ProjectVersion,
)

from db.init_db import init_db

from routes.auth import (
    router as auth_router,
    get_current_user,
)

from routes.users import (
    router as users_router,
)

from routes.projects import (
    router as projects_router,
)

from routes.professional_requests import (
    router as professional_requests_router,
)

from routes.professional_profile import (
    router as professional_profile_router,
)

from routes.professional_demo import (
    router as professional_demo_router,
)

from routes.professional_demo_feedback import (
    router as professional_demo_feedback_router,
)

from routes.reports import (
    router as reports_router,
)

from routes.admin_users import router as admin_users_router

from routes.admin_payments import (
    router as admin_payments_router,
)


app = FastAPI()

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

app.mount(
    "/assets",
    StaticFiles(
        directory=str(
            Path(__file__).resolve().parent.parent / "frontend" / "assets"
        )
    ),
    name="assets",
)

app.mount(
    "/frontend",
    StaticFiles(
        directory=str(
            Path(__file__).resolve().parent.parent / "frontend"
        )
    ),
    name="frontend",
)

app.include_router(
    reports_router,
)

app.include_router(
    professional_requests_router,
)

app.include_router(
    professional_profile_router,
)

app.include_router(
    professional_demo_router,
)

app.include_router(
    professional_demo_feedback_router,
)

app.include_router(
    projects_router,
)

app.include_router(admin_users_router)

app.include_router(pricing_router)

app.include_router(admin_pricing_router)

app.include_router(
    admin_professionals_router
)

app.include_router(
    admin_payments_router
)

app.include_router(
    auth_router,
)

app.include_router(
    users_router,
)


stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")


# =====================
# PATH SETUP
# =====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")


# =====================
# CORS
# =====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.emfinsight.com",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# STRIPE CHECKOUT
# =====================

# Stripe Price IDs are configured in Render Environment Variables.
# Do not hardcode Stripe Price IDs in source code.
STRIPE_PRICE_IDS = {
    "EUR": {
        "single": os.getenv("STRIPE_EU_BUSINESS_SINGLE_PRICE_ID"),
        "pro": os.getenv("STRIPE_EU_BUSINESS_PRO_PRICE_ID"),
        "professional": os.getenv("STRIPE_EU_PROFESSIONAL_PRICE_ID"),
        "home_full_report": os.getenv("STRIPE_EU_HOME_FULL_REPORT_PRICE_ID"),
    },
    "USD": {
        "single": os.getenv("STRIPE_US_BUSINESS_SINGLE_PRICE_ID"),
        "pro": os.getenv("STRIPE_US_BUSINESS_PRO_PRICE_ID"),
        "professional": os.getenv("STRIPE_US_PROFESSIONAL_PRICE_ID"),
        "home_full_report": os.getenv("STRIPE_US_HOME_FULL_REPORT_PRICE_ID"),
    },
}

STRIPE_BRANDING_PRICE_IDS = {
    "EUR": {
        "monthly": os.getenv("STRIPE_EU_PROFESSIONAL_BRANDING_MONTHLY_PRICE_ID"),
        "annual": os.getenv("STRIPE_EU_PROFESSIONAL_BRANDING_YEARLY_PRICE_ID"),
    },
    "USD": {
        "monthly": os.getenv("STRIPE_US_PROFESSIONAL_BRANDING_MONTHLY_PRICE_ID"),
        "annual": os.getenv("STRIPE_US_PROFESSIONAL_BRANDING_YEARLY_PRICE_ID"),
    },
}

STRIPE_PRICE_IDS = {
    "EUR": {
        "single": os.getenv("STRIPE_EU_BUSINESS_SINGLE_PRICE_ID"),
        "pro": os.getenv("STRIPE_EU_BUSINESS_PRO_PRICE_ID"),
        "professional": os.getenv("STRIPE_EU_PROFESSIONAL_PRICE_ID"),
        "home_full_report": os.getenv("STRIPE_EU_HOME_FULL_REPORT_PRICE_ID"),

        # Home Wellness
        "home_simple_report": os.getenv("STRIPE_EU_HOME_SIMPLE_REPORT_ONE_TIME_PRICE_ID"),
        "home_measure_monthly": os.getenv("STRIPE_EU_HOME_MEASURE_MONTHLY_PRICE_ID"),
        "home_deeper_first": os.getenv("STRIPE_EU_HOME_DEEPER_ANALYSIS_FIRST_ONE_TIME_PRICE_ID"),
        "home_deeper_repeat": os.getenv("STRIPE_EU_HOME_DEEPER_ANALYSIS_REPEAT_ONE_TIME_PRICE_ID"),
    },
    "USD": {
        "single": os.getenv("STRIPE_US_BUSINESS_SINGLE_PRICE_ID"),
        "pro": os.getenv("STRIPE_US_BUSINESS_PRO_PRICE_ID"),
        "professional": os.getenv("STRIPE_US_PROFESSIONAL_PRICE_ID"),
        "home_full_report": os.getenv("STRIPE_US_HOME_FULL_REPORT_PRICE_ID"),

        # Home Wellness
        "home_simple_report": os.getenv("STRIPE_US_HOME_SIMPLE_REPORT_ONE_TIME_PRICE_ID"),
        "home_measure_monthly": os.getenv("STRIPE_US_HOME_MEASURE_MONTHLY_PRICE_ID"),
        "home_deeper_first": os.getenv("STRIPE_US_HOME_DEEPER_ANALYSIS_FIRST_ONE_TIME_PRICE_ID"),
        "home_deeper_repeat": os.getenv("STRIPE_US_HOME_DEEPER_ANALYSIS_REPEAT_ONE_TIME_PRICE_ID"),
    },
}

STRIPE_ALLOWED_PLANS = {
    "single": "Business Single",
    "pro": "Business Pro",
    "professional": "Professional",
    "home_full_report": "Full EMF Insight Report",

    "home_simple_report": "Simple Property EMF Report",
    "home_measure_monthly": "EMF Self-Assessment",
    "home_deeper_first": "Deeper EMF Analysis – First Assessment",
    "home_deeper_repeat": "Deeper EMF Analysis – Follow-up Assessment",
}

STRIPE_APP_URL = os.getenv("APP_BASE_URL", "https://app.emfinsight.com").rstrip("/")


def _ensure_stripe_events_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS stripe_events (
            event_id VARCHAR(255) PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))


def _ensure_home_entitlements_table(db):
    # Legacy user-level entitlement table.
    # Kept intact for backward compatibility during the project-level migration.
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS home_entitlements (
            user_id VARCHAR(255) PRIMARY KEY,
            full_report_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
            stripe_session_id VARCHAR(255),
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))


def _ensure_home_project_entitlements_table(db):
    # Canonical Home Premium Report entitlement:
    # one entitlement belongs to one Home Project.
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS home_project_entitlements (
            project_id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            full_report_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
            stripe_session_id VARCHAR(255),
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

def _ensure_home_wellness_entitlements_table(db):
    db.execute(text("""
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
    """))

    db.execute(text("""
        CREATE UNIQUE INDEX IF NOT EXISTS
        uq_home_wellness_entitlements_stripe_session_id
        ON home_wellness_entitlements (stripe_session_id)
    """))

    db.execute(text("""
        CREATE UNIQUE INDEX IF NOT EXISTS
        uq_home_wellness_entitlements_measure_subscription
        ON home_wellness_entitlements (stripe_subscription_id)
        WHERE entitlement_type = 'measure_monthly'
          AND stripe_subscription_id IS NOT NULL
    """))


def _ensure_home_wellness_transactions_table(db):
    db.execute(text("""
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
    """))

    db.execute(text("""
        ALTER TABLE home_wellness_transactions
        ADD COLUMN IF NOT EXISTS usage_status VARCHAR(30)
        NOT NULL DEFAULT 'not_used'
    """))

    db.execute(text("""
        ALTER TABLE home_wellness_transactions
        ADD COLUMN IF NOT EXISTS report_id INTEGER
    """))

    db.execute(text("""
        ALTER TABLE home_wellness_transactions
        ADD COLUMN IF NOT EXISTS used_at TIMESTAMP
    """))

def _ensure_user_admin_fields(db):

    db.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS account_status VARCHAR DEFAULT 'active'
    """))

    db.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS phone VARCHAR DEFAULT ''
    """))

    db.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS company_website VARCHAR DEFAULT ''
    """))

    db.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS branding_active BOOLEAN DEFAULT FALSE
    """))

    db.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS branding_plan VARCHAR DEFAULT ''
    """))

    db.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS branding_activated_at TIMESTAMP NULL
    """))

    db.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS branding_expires_at TIMESTAMP NULL
    """))

    db.execute(text("""
        UPDATE users
        SET account_status = 'active'
        WHERE account_status IS NULL
    """))

def _ensure_professional_requests_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS professional_requests (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            project_id VARCHAR(255),
            country VARCHAR(100),
            region VARCHAR(100),
            city VARCHAR(100),
            status VARCHAR(50) NOT NULL DEFAULT 'available',
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    db.execute(
    text("""
        ALTER TABLE professional_requests
        ADD COLUMN IF NOT EXISTS postal_code VARCHAR(30)
    """)
)

def _ensure_professional_contact_points_tables(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS professional_contact_points (
            user_id VARCHAR(255) PRIMARY KEY,
            balance INTEGER NOT NULL DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS professional_contact_point_ledger (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            transaction_type VARCHAR(50) NOT NULL,
            amount INTEGER NOT NULL,
            balance_after INTEGER NOT NULL,
            reference_type VARCHAR(100),
            reference_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS professional_request_contacts (
            id SERIAL PRIMARY KEY,
            request_id INTEGER NOT NULL,
            professional_user_id VARCHAR(255) NOT NULL,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            duration_days INTEGER NOT NULL DEFAULT 14
        )
    """))

    db.execute(text("""
        ALTER TABLE professional_request_contacts
        ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP
    """))

    db.execute(
        text("""
            CREATE TABLE IF NOT EXISTS professional_request_contact_feedback (
                request_id INTEGER PRIMARY KEY,
                contact_preference VARCHAR(50),
                contact_status VARCHAR(50) DEFAULT 'unknown',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
    )

    db.commit()

    db.execute(text("""
        ALTER TABLE professional_request_contacts
        ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 14
    """))

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS platform_settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value VARCHAR(255) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    db.execute(text("""
        INSERT INTO platform_settings (
            setting_key,
            setting_value
        )
        VALUES (
            'professional_contact_unlock_days',
            '14'
        )
        ON CONFLICT (setting_key) DO NOTHING
    """))

    db.execute(text("""
        INSERT INTO platform_settings (
            setting_key,
            setting_value
        )
        VALUES (
            'home_simple_report_access_days',
            '60'
        )
        ON CONFLICT (setting_key) DO NOTHING
    """))


def _ensure_professional_entitlements_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS professional_entitlements (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL UNIQUE,

            plan_code VARCHAR(50) NOT NULL,

            period_start TIMESTAMP,
            period_end TIMESTAMP,

            assessment_limit INTEGER NOT NULL DEFAULT 0,
            assessments_used INTEGER NOT NULL DEFAULT 0,

            contact_opportunity_limit INTEGER NOT NULL DEFAULT 0,
            contact_opportunities_used INTEGER NOT NULL DEFAULT 0,

            branding_included BOOLEAN NOT NULL DEFAULT FALSE,

            status VARCHAR(50) NOT NULL DEFAULT 'active',

            stripe_customer_id VARCHAR(255),
            stripe_subscription_id VARCHAR(255),

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # Business Report Usage
    db.execute(text("""
        ALTER TABLE professional_entitlements
        ADD COLUMN IF NOT EXISTS report_limit INTEGER NOT NULL DEFAULT 0
    """))

    db.execute(text("""
        ALTER TABLE professional_entitlements
        ADD COLUMN IF NOT EXISTS reports_used INTEGER NOT NULL DEFAULT 0
    """))

    db.execute(text("""
        ALTER TABLE professional_entitlements
        ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255)
    """))

    # Business Usage Ledger
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS business_usage_ledger (
            id BIGSERIAL PRIMARY KEY,

            user_id VARCHAR(255) NOT NULL,
            plan_code VARCHAR(50) NOT NULL,

            usage_type VARCHAR(50) NOT NULL,
            amount INTEGER NOT NULL DEFAULT 1,

            reference_type VARCHAR(50),
            reference_id VARCHAR(255),

            billing_period_start TIMESTAMP,
            billing_period_end TIMESTAMP,

            idempotency_key VARCHAR(255) NOT NULL UNIQUE,

            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT chk_business_usage_type
                CHECK (
                    usage_type IN (
                        'assessment',
                        'report',
                        'contact_opportunity'
                    )
                ),

            CONSTRAINT chk_business_usage_amount
                CHECK (amount > 0)
        )
    """))

    db.execute(text("""
        CREATE INDEX IF NOT EXISTS
        idx_business_usage_user
        ON business_usage_ledger(user_id)
    """))

    db.execute(text("""
        CREATE INDEX IF NOT EXISTS
        idx_business_usage_type
        ON business_usage_ledger(usage_type)
    """))

    db.execute(text("""
        CREATE INDEX IF NOT EXISTS
        idx_business_usage_created
        ON business_usage_ledger(created_at)
    """))

    db.execute(text("""
        CREATE INDEX IF NOT EXISTS
        idx_business_usage_reference
        ON business_usage_ledger(reference_type, reference_id)
    """))

 


def _claim_stripe_event(db, event_id):
    result = db.execute(
        text("""
            INSERT INTO stripe_events (event_id)
            VALUES (:event_id)
            ON CONFLICT (event_id) DO NOTHING
        """),
        {"event_id": event_id},
    )
    return result.rowcount == 1

# =====================
# INIT
# =====================
init_db()

db = SessionLocal()

try:
    _ensure_user_admin_fields(db)
    _ensure_professional_contact_points_tables(db)
    _ensure_professional_entitlements_table(db)
    db.commit()
finally:
    db.close()


@app.post("/create-checkout-session")
def create_checkout(
    body: dict,
    current_user=Depends(get_current_user),
):
    db = SessionLocal()

    try:
        plan = body.get("plan")
        currency = str(body.get("currency") or "EUR").upper()
        project_id = body.get("project_id")

        if plan not in STRIPE_ALLOWED_PLANS:
            raise HTTPException(
                400,
                "Invalid or unavailable plan",
            )

        if currency not in STRIPE_PRICE_IDS:
            raise HTTPException(
                400,
                "Unsupported currency",
            )

        price_id = STRIPE_PRICE_IDS[currency].get(plan)

        if not price_id:
            raise HTTPException(
                503,
                "Stripe price is not configured for this currency",
            )

        # Prevent duplicate Business subscriptions.
        # Single remains available as a separate one-time purchase.
        if plan in {"pro", "professional"}:
            current_entitlement = db.execute(
                text("""
                    SELECT
                        plan_code,
                        status,
                        stripe_subscription_id
                    FROM professional_entitlements
                    WHERE user_id = :user_id
                    FOR UPDATE
                """),
                {"user_id": str(current_user.id)},
            ).mappings().first()

            if (
                current_entitlement
                and current_entitlement["plan_code"] in (
                    "pro",
                    "professional",
                )
            ):
                stripe_subscription_id = (
                    current_entitlement["stripe_subscription_id"]
                )

                if stripe_subscription_id:
                    try:
                        existing_subscription = (
                            stripe.Subscription.retrieve(
                                stripe_subscription_id
                            )
                        )
                        existing_status = existing_subscription.get("status")

                    except Exception:
                        print(
                            "STRIPE SUBSCRIPTION STATUS CHECK FAILED",
                            stripe_subscription_id,
                        )
                        raise HTTPException(
                            503,
                            "Unable to verify your existing subscription. "
                            "Please try again later.",
                        )

                    if existing_status in (
                        "canceled",
                        "unpaid",
                        "incomplete_expired",
                    ):
                        db.execute(
                            text("""
                                UPDATE professional_entitlements
                                SET status = 'inactive',
                                    updated_at = CURRENT_TIMESTAMP
                                WHERE user_id = :user_id
                                  AND stripe_subscription_id = :subscription_id
                            """),
                            {
                                "user_id": str(current_user.id),
                                "subscription_id": stripe_subscription_id,
                            },
                        )
                        db.commit()

                    else:
                        if existing_status not in (
                            "active",
                            "trialing",
                            "past_due",
                        ):
                            raise HTTPException(
                                409,
                                "Your existing subscription has a pending "
                                "or unknown status. Please contact support.",
                            )

                        if current_entitlement["plan_code"] == "pro":
                            raise HTTPException(
                                409,
                                "You already have an active Pro subscription. "
                                "Use the Professional upgrade option.",
                            )

                        raise HTTPException(
                            409,
                            "You already have an active Professional subscription.",
                        )

                elif current_entitlement["status"] == "active":
                    raise HTTPException(
                        409,
                        "An active Business subscription already exists, "
                        "but its Stripe ID is missing. Please contact support.",
                    )
        # Business Stripe Customer management.
        # Reuse one Stripe Customer per user.
        if plan in {"single", "pro", "professional"}:
            entitlement = db.execute(
                text("""
                    SELECT stripe_customer_id
                    FROM professional_entitlements
                    WHERE user_id = :user_id
                    FOR UPDATE
                """),
                {"user_id": str(current_user.id)},
            ).mappings().first()

            if not entitlement:
                db.execute(
                    text("""
                        INSERT INTO professional_entitlements (
                            user_id,
                            plan_code,
                            status
                        )
                        VALUES (
                            :user_id,
                            'none',
                            'inactive'
                        )
                        ON CONFLICT (user_id) DO NOTHING
                    """),
                    {"user_id": str(current_user.id)},
                )

                entitlement = db.execute(
                    text("""
                        SELECT stripe_customer_id
                        FROM professional_entitlements
                        WHERE user_id = :user_id
                        FOR UPDATE
                    """),
                    {"user_id": str(current_user.id)},
                ).mappings().first()

            stripe_customer_id = (
                entitlement.get("stripe_customer_id")
                if entitlement else None
            )

            if not stripe_customer_id:
                customer = stripe.Customer.create(
                    email=current_user.email,
                    metadata={
                        "user_id": str(current_user.id),
                    },
                    idempotency_key=f"business_customer_user_{current_user.id}",
                )

                stripe_customer_id = customer.id

                db.execute(
                    text("""
                        UPDATE professional_entitlements
                        SET
                            stripe_customer_id = :customer_id,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE user_id = :user_id
                    """),
                    {
                        "customer_id": stripe_customer_id,
                        "user_id": str(current_user.id),
                    },
                )

            db.commit()


        # Home Full Report is project-scoped.
        # The authenticated user must own the Home Project being purchased.
        if plan in {
            "home_full_report",
            "home_simple_report",
            "home_deeper_first",
            "home_deeper_repeat",
            "home_measure_monthly",
        }:
            if not project_id:
                raise HTTPException(
                    400,
                    "Home project ID is required for the Full EMF Insight Report",
                )

            project = db.execute(
                text("""
                    SELECT id
                    FROM projects
                    WHERE id = :project_id
                      AND user_id = :user_id
                """),
                {
                    "project_id": str(project_id),
                    "user_id": str(current_user.id),
                },
            ).first()

            if not project:
                raise HTTPException(
                    404,
                    "Home project not found",
                )

        if plan == "home_deeper_repeat":
            first_purchase_exists = db.execute(
                text("""
                    SELECT EXISTS (
                        SELECT 1
                        FROM home_wellness_transactions
                        WHERE user_id = :user_id
                          AND project_id = :project_id
                          AND product_key = 'home_deeper_first'
                          AND status = 'completed'
                    )
                """),
                {
                    "user_id": str(current_user.id),
                    "project_id": str(project_id),
                },
            ).scalar()

            if not first_purchase_exists:
                raise HTTPException(
                    403,
                    "The first Deeper Analysis purchase is required before a Repeat purchase",
                )

        # Business Pro and Professional are recurring subscriptions.
        # Business Single and Home Full Report are one-time payments.
        mode = "subscription" if plan in {
            "pro",
            "professional",
            "home_measure_monthly",
        } else "payment"

        try:
            session = stripe.checkout.Session.create(
                line_items=[
                    {
                        "price": price_id,
                        "quantity": 1,
                    }
                ],
                mode=mode,
                customer=(
                    stripe_customer_id
                    if plan in {"single", "pro", "professional"}
                    else None
                ),
                success_url=f"{STRIPE_APP_URL}/success.html",
                cancel_url=f"{STRIPE_APP_URL}/dashboard.html#billing",
                metadata={
                    "user_id": str(current_user.id),
                    "plan": plan,
                    "currency": currency,
                    **(
                        {"project_id": str(project_id)}
                        if plan in {
                            "home_full_report",
                            "home_simple_report",
                            "home_deeper_first",
                            "home_deeper_repeat",
                            "home_measure_monthly",
                        }
                        else {}
                    ),
                },
                subscription_data={
                    "metadata": {
                        "user_id": str(current_user.id),
                        "plan": plan,
                        "currency": currency,
                        **(
                            {"project_id": str(project_id)}
                            if plan == "home_measure_monthly"
                            else {}
                        ),
                    }
                } if mode == "subscription" else None,
            )

        except Exception as exc:
            print("Stripe checkout error:", repr(exc))
            raise HTTPException(
                502,
                "Unable to create Stripe checkout session",
            )

        return {"url": session.url}

    finally:
        db.close()


@app.post("/business/upgrade-to-professional")
def upgrade_to_professional(
    current_user=Depends(get_current_user),
):
    db = SessionLocal()

    try:
        # Lock the user's entitlement row to prevent concurrent upgrades.
        entitlement = db.execute(
            text("""
                SELECT
                    plan_code,
                    status,
                    stripe_customer_id,
                    stripe_subscription_id
                FROM professional_entitlements
                WHERE user_id = :user_id
                FOR UPDATE
            """),
            {"user_id": str(current_user.id)},
        ).mappings().first()

        if not entitlement:
            raise HTTPException(404, "Business entitlement not found")

        if entitlement["plan_code"] == "professional":
            raise HTTPException(409, "Professional plan is already active")

        if entitlement["plan_code"] != "pro":
            raise HTTPException(409, "Only active Pro subscriptions can be upgraded")

        if entitlement["status"] != "active":
            raise HTTPException(409, "Pro subscription is not active")

        customer_id = entitlement["stripe_customer_id"]
        subscription_id = entitlement["stripe_subscription_id"]

        if not customer_id or not subscription_id:
            raise HTTPException(
                409,
                "Stripe Customer or Subscription is missing",
            )

        # Retrieve the existing Stripe subscription.
        subscription = stripe.Subscription.retrieve(
            subscription_id,
            expand=["items.data.price"],
        )

        subscription_data = (
            subscription.to_dict()
            if hasattr(subscription, "to_dict")
            else dict(subscription)
        )

        stripe_customer = subscription_data.get("customer")
        if isinstance(stripe_customer, dict):
            stripe_customer = stripe_customer.get("id")

        if stripe_customer != customer_id:
            raise HTTPException(
                409,
                "Stripe Customer does not match the Business account",
            )

        if subscription_data.get("status") != "active":
            raise HTTPException(
                409,
                "Stripe subscription is not active",
            )

        if subscription_data.get("cancel_at_period_end"):
            raise HTTPException(
                409,
                "Subscription is scheduled for cancellation",
            )

        if subscription_data.get("pending_update"):
            raise HTTPException(
                409,
                "A subscription update is already pending",
            )

        subscription_items = (
            (subscription_data.get("items") or {}).get("data") or []
        )

        if len(subscription_items) != 1:
            raise HTTPException(
                409,
                "Unexpected Stripe subscription item configuration",
            )

        item = subscription_items[0]
        price = item.get("price") or {}

        current_price_id = price.get("id")
        currency = str(price.get("currency") or "").upper()

        if currency not in STRIPE_PRICE_IDS:
            raise HTTPException(400, "Unsupported subscription currency")

        expected_pro_price = STRIPE_PRICE_IDS[currency].get("pro")
        professional_price = STRIPE_PRICE_IDS[currency].get("professional")

        if current_price_id != expected_pro_price:
            if current_price_id == professional_price:
                raise HTTPException(
                    409,
                    "Stripe subscription is already Professional",
                )

            raise HTTPException(
                409,
                "Current Stripe subscription price is not Business Pro",
            )

        if not professional_price:
            raise HTTPException(
                503,
                "Professional price is not configured",
            )

        # Update the existing subscription.
        # Do not create a second subscription.
        updated_subscription = stripe.Subscription.modify(
            subscription_id,
            items=[
                {
                    "id": item["id"],
                    "price": professional_price,
                }
            ],
            proration_behavior="always_invoice",
            payment_behavior="pending_if_incomplete",
            expand=["latest_invoice"],
        )

        updated_data = (
            updated_subscription.to_dict()
            if hasattr(updated_subscription, "to_dict")
            else dict(updated_subscription)
        )

        latest_invoice = updated_data.get("latest_invoice") or {}

        if isinstance(latest_invoice, str):
            latest_invoice = stripe.Invoice.retrieve(
                latest_invoice
            ).to_dict()

        invoice_id = latest_invoice.get("id")

        if not invoice_id:
            raise HTTPException(
                502,
                "Stripe did not return an upgrade invoice",
            )

        db.execute(text("""
            INSERT INTO stripe_invoice_allocations (
                invoice_id,
                user_id,
                plan_code,
                billing_reason,
                subscription_id
            )
            VALUES (
                :invoice_id,
                :user_id,
                'professional',
                'subscription_update',
                :subscription_id
            )
            ON CONFLICT (invoice_id) DO NOTHING
        """), {
            "invoice_id": invoice_id,
            "user_id": str(current_user.id),
            "subscription_id": subscription_id,
        })

        # Entitlements are NOT changed here.
        # The invoice.paid webhook activates Professional after payment.

        db.commit()

        print(
            "BUSINESS UPGRADE REQUESTED:",
            {
                "user_id": str(current_user.id),
                "subscription_id": subscription_id,
                "invoice_id": latest_invoice.get("id"),
                "invoice_status": latest_invoice.get("status"),
                "currency": currency,
            },
        )

        return {
            "status": "upgrade_requested",
            "invoice_status": latest_invoice.get("status"),
            "hosted_invoice_url": latest_invoice.get("hosted_invoice_url"),
            "message": "Professional upgrade submitted to Stripe.",
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()
        print("BUSINESS UPGRADE ERROR:", repr(exc))
        raise HTTPException(
            502,
            "Unable to upgrade Business subscription",
        )

    finally:
        db.close()


# =====================
# STRIPE BRANDING CHECKOUT
# =====================

@app.post("/create-branding-checkout-session")
def create_branding_checkout(
    body: dict,
    current_user=Depends(get_current_user),
):
    currency = str(body.get("currency") or "EUR").upper()
    billing_period = body.get("billing_period") or "monthly"

    if currency not in STRIPE_BRANDING_PRICE_IDS:
        raise HTTPException(
            400,
            "Unsupported currency",
        )

    if billing_period not in ("monthly", "annual"):
        raise HTTPException(
            400,
            "Invalid branding billing period",
        )

    price_id = STRIPE_BRANDING_PRICE_IDS[currency].get(
        billing_period
    )

    if not price_id:
        raise HTTPException(
            503,
            "Professional Branding price is not configured for this currency",
        )

    try:
        session = stripe.checkout.Session.create(
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=f"{STRIPE_APP_URL}/success.html",
            cancel_url=f"{STRIPE_APP_URL}/dashboard.html#billing",
            metadata={
                "user_id": str(current_user.id),
                "plan": "branding",
                "currency": currency,
                "billing_period": billing_period,
            },
            subscription_data={
                "metadata": {
                    "user_id": str(current_user.id),
                    "plan": "branding",
                    "currency": currency,
                    "billing_period": billing_period,
                }
            },
        )

    except Exception as exc:
        print(
            "Stripe branding checkout error:",
            repr(exc),
        )
        raise HTTPException(
            502,
            "Unable to create Professional Branding checkout session",
        )

    return {"url": session.url}

# =====================
# STRIPE WEBHOOK
# =====================

@app.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            endpoint_secret,
        )
    except Exception:
        raise HTTPException(400, "Invalid webhook")

    event_type = event["type"]
    event_id = event["id"]
    db = SessionLocal()

    try:
        # The event ID is stored with a primary key. If Stripe retries the
        # same delivery, the second delivery is ignored safely.
        _ensure_stripe_events_table(db)
        _ensure_home_entitlements_table(db)
        _ensure_home_project_entitlements_table(db)
        _ensure_home_wellness_entitlements_table(db)
        _ensure_home_wellness_transactions_table(db)
        _ensure_user_admin_fields(db)
        if not _claim_stripe_event(db, event_id):
            db.rollback()
            print("Stripe webhook already processed:", event_id)
            return {"status": "ok"}

        # =============================================================
        # INITIAL CHECKOUT
        # =============================================================
        if event_type in (
            "checkout.session.completed",
            "checkout.session.async_payment_succeeded",
        ):
            session = event["data"]["object"]
            session = session.to_dict()

            metadata = session.get("metadata") or {}

            user_id = metadata.get("user_id")
            plan = metadata.get("plan")

            # One-time Home products must be paid before granting access.
            home_one_time_plans = {
                "home_simple_report",
                "home_deeper_first",
                "home_deeper_repeat",
                "home_full_report",
            }

            if (
                plan in home_one_time_plans
                and session.get("payment_status") != "paid"
            ):
                print(
                    "HOME ONE-TIME PAYMENT NOT YET PAID:",
                    plan,
                    session.get("id"),
                    session.get("payment_status"),
                )
                db.commit()
                return {"status": "ok"}

            subscription_data = None

            if session.get("subscription"):
                subscription_data = stripe.Subscription.retrieve(
                    session["subscription"]
                )

            subscription_items = (
                subscription_data["items"]["data"]
                if subscription_data and "items" in subscription_data
                else []
            )

            first_item = subscription_items[0] if subscription_items else {}

            period_start_ts = (
                (
                    subscription_data["current_period_start"]
                    if subscription_data and "current_period_start" in subscription_data
                    else None
                )
                or (
                    first_item["current_period_start"]
                    if "current_period_start" in first_item
                    else None
                )
            )

            period_end_ts = (
                (
                    subscription_data["current_period_end"]
                    if subscription_data and "current_period_end" in subscription_data
                    else None
                )
                or (
                    first_item["current_period_end"]
                    if "current_period_end" in first_item
                    else None
                )
            )

            period_start = (
                datetime.fromtimestamp(period_start_ts, tz=timezone.utc)
                if period_start_ts else None
            )

            period_end = (
                datetime.fromtimestamp(period_end_ts, tz=timezone.utc)
                if period_end_ts else None
            )
            print(
                "BUSINESS SUBSCRIPTION DEBUG:",
                {
                    "plan": plan,
                    "subscription_id": session.get("subscription"),
                    "period_start": period_start.isoformat() if period_start else None,
                    "period_end": period_end.isoformat() if period_end else None,
                }
            )

            if not user_id or (
                plan not in STRIPE_ALLOWED_PLANS
                and plan != "branding"
            ):
                print("Stripe checkout webhook missing/invalid metadata")
                db.commit()
                return {"status": "ok"}

            connection = db.execute(
                text("SELECT current_database(), current_schema()")
            ).first()

            print("WEBHOOK DATABASE:", connection)
            print("WEBHOOK DB URL:", db.get_bind().url.render_as_string(hide_password=True))
            print("WEBHOOK USER ID:", repr(user_id))
            print("WEBHOOK USER MODEL TABLE:", User.__table__.fullname)

            user = db.query(User).filter(User.id == int(user_id)).first()

            if not user:
                print("Stripe webhook user not found:", user_id)
                db.commit()
                return {"status": "ok"}

            if plan == "branding":
                billing_period = metadata.get("billing_period")

                if billing_period not in ("monthly", "annual"):
                    print(
                        "Stripe Branding webhook invalid billing period:",
                        billing_period,
                    )
                    db.commit()
                    return {"status": "ok"}

                now = datetime.utcnow()

                if billing_period == "monthly":
                    expires_at = now + timedelta(days=30)
                else:
                    expires_at = now + timedelta(days=365)

                user.branding_active = True
                user.branding_plan = billing_period
                user.branding_activated_at = now
                user.branding_expires_at = expires_at

                db.commit()

                print(
                    "BRANDING ACTIVATED",
                    user.email,
                    billing_period,
                )

                return {"status": "ok"}

            if plan == "single":
                # One successful Business Single purchase = one Business credit.
                user.credits = (user.credits or 0) + 1

                db.execute(
                    text("""
                        INSERT INTO professional_entitlements (
                            user_id,
                            plan_code,
                            assessment_limit,
                            assessments_used,
                            contact_opportunity_limit,
                            contact_opportunities_used,
                            branding_included,
                            status,
                            report_limit,
                            reports_used
                        )
                        VALUES (
                            :user_id,
                            'single',
                            1,
                            0,
                            1,
                            0,
                            FALSE,
                            'active',
                            1,
                            0
                        )
                        ON CONFLICT (user_id) DO UPDATE SET
                            plan_code = 'single',
                            assessment_limit = 1,
                            contact_opportunity_limit = 1,
                            branding_included = FALSE,
                            status = 'active',
                            report_limit = 1,
                            updated_at = CURRENT_TIMESTAMP,
                            assessments_used = 0,
                            reports_used = 0,
                            contact_opportunities_used = 0
                        WHERE
                            professional_entitlements.status <> 'active'
                            OR professional_entitlements.plan_code NOT IN ('pro', 'professional')
                    """),
                    {
                        "user_id": str(user.id),
                    },
                )

                # Diagnostic: verify entitlement values immediately after UPSERT.
                entitlement_debug = db.execute(
                    text("""
                        SELECT
                            user_id,
                            plan_code,
                            assessment_limit,
                            assessments_used,
                            report_limit,
                            reports_used,
                            contact_opportunity_limit,
                            contact_opportunities_used,
                            status
                        FROM professional_entitlements
                        WHERE user_id = :user_id
                    """),
                    {
                        "user_id": str(user.id),
                    },
                ).mappings().first()

                print(
                    "SINGLE ENTITLEMENT AFTER UPSERT:",
                    dict(entitlement_debug or {})
                )

                db.add(
                    ReportCreditLedger(
                        user_id=user.id,
                        transaction_type="PURCHASE",
                        amount=1,
                        balance_after=user.credits,
                        reference_type="stripe_checkout",
                        reference_id=session.get("id"),
                    )
                )

            elif plan == "pro":
                # Initial Pro subscription:
                # 5 Assessments, 5 Reports, 3 Contact Opportunities.
                db.execute(
                    text("""
                        INSERT INTO professional_entitlements (
                            user_id,
                            plan_code,
                            assessment_limit,
                            assessments_used,
                            contact_opportunity_limit,
                            contact_opportunities_used,
                            branding_included,
                            status,
                            stripe_subscription_id,
                            period_start,
                            period_end,
                            report_limit,
                            reports_used
                        )
                        VALUES (
                            :user_id,
                            'pro',
                            5,
                            0,
                            3,
                            0,
                            FALSE,
                            'active',
                            :stripe_subscription_id,
                            :period_start,
                            :period_end,
                            5,
                            0
                        )
                        ON CONFLICT (user_id) DO UPDATE SET
                            plan_code = EXCLUDED.plan_code,
                            assessment_limit = EXCLUDED.assessment_limit,
                            assessments_used = 0,
                            contact_opportunity_limit = EXCLUDED.contact_opportunity_limit,
                            contact_opportunities_used = 0,
                            branding_included = FALSE,
                            status = 'active',
                            stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                            period_start = EXCLUDED.period_start,
                            period_end = EXCLUDED.period_end,
                            report_limit = EXCLUDED.report_limit,
                            reports_used = 0,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE
                            professional_entitlements.status <> 'active'
                            OR professional_entitlements.plan_code NOT IN (
                                'pro',
                                'professional'
                            )
                    """),
                    {
                        "user_id": str(user.id),
                        "stripe_subscription_id": session.get("subscription"),
                        "period_start": period_start,
                        "period_end": period_end,
                    },
                )

                # Update legacy user plan and credits only if this
                # Checkout actually activated the Pro entitlement.
                pro_activated = db.execute(
                    text("""
                        SELECT 1
                        FROM professional_entitlements
                        WHERE user_id = :user_id
                          AND plan_code = 'pro'
                          AND stripe_subscription_id = :subscription_id
                    """),
                    {
                        "user_id": str(user.id),
                        "subscription_id": session.get("subscription"),
                    },
                ).first()

                if pro_activated:
                    user.plan = "pro"
                    user.credits = 5

                    db.add(
                        ReportCreditLedger(
                            user_id=user.id,
                            transaction_type="ALLOCATION",
                            amount=5,
                            balance_after=user.credits,
                            reference_type="stripe_checkout",
                            reference_id=session.get("id"),
                        )
                    )

                pro_entitlement_debug = db.execute(
                    text("""
                        SELECT
                            user_id,
                            plan_code,
                            assessment_limit,
                            report_limit,
                            contact_opportunity_limit,
                            status,
                            stripe_subscription_id,
                            period_start,
                            period_end
                        FROM professional_entitlements
                        WHERE user_id = :user_id
                    """),
                    {"user_id": str(user.id)},
                ).mappings().first()

                print(
                    "PRO ENTITLEMENT AFTER CHECKOUT:",
                    dict(pro_entitlement_debug or {})
                )

            elif plan == "professional":
                # Initial Professional subscription:
                # 25 Assessments, 25 Reports, 10 Contact Opportunities,
                # and branding.

                db.execute(
                    text("""
                        INSERT INTO professional_entitlements (
                            user_id,
                            plan_code,
                            assessment_limit,
                            assessments_used,
                            contact_opportunity_limit,
                            contact_opportunities_used,
                            branding_included,
                            status,
                            stripe_subscription_id,
                            period_start,
                            period_end,
                            report_limit,
                            reports_used
                        )
                        VALUES (
                            :user_id,
                            'professional',
                            25,
                            0,
                            10,
                            0,
                            TRUE,
                            'active',
                            :stripe_subscription_id,
                            :period_start,
                            :period_end,
                            25,
                            0
                        )
                        ON CONFLICT (user_id) DO UPDATE SET
                            plan_code = EXCLUDED.plan_code,
                            assessment_limit = EXCLUDED.assessment_limit,
                            assessments_used = 0,
                            contact_opportunity_limit = EXCLUDED.contact_opportunity_limit,
                            contact_opportunities_used = 0,
                            branding_included = TRUE,
                            status = 'active',
                            stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                            period_start = EXCLUDED.period_start,
                            period_end = EXCLUDED.period_end,
                            report_limit = EXCLUDED.report_limit,
                            reports_used = 0,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE
                            professional_entitlements.status <> 'active'
                            OR professional_entitlements.plan_code NOT IN (
                                'pro',
                                'professional'
                            )
                    """),
                    {
                        "user_id": str(user.id),
                        "stripe_subscription_id": session.get("subscription"),
                        "period_start": period_start,
                        "period_end": period_end,
                    },
                )

                professional_activated = db.execute(
                    text("""
                        SELECT 1
                        FROM professional_entitlements
                        WHERE user_id = :user_id
                          AND plan_code = 'professional'
                          AND stripe_subscription_id = :subscription_id
                    """),
                    {
                        "user_id": str(user.id),
                        "subscription_id": session.get("subscription"),
                    },
                ).first()

                if professional_activated:
                    user.plan = "professional"

                professional_entitlement_debug = db.execute(
                    text("""
                        SELECT
                            user_id,
                            plan_code,
                            assessment_limit,
                            report_limit,
                            contact_opportunity_limit,
                            status,
                            stripe_subscription_id,
                            period_start,
                            period_end
                        FROM professional_entitlements
                        WHERE user_id = :user_id
                    """),
                    {"user_id": str(user.id)},
                ).mappings().first()

                print(
                    "PROFESSIONAL ENTITLEMENT AFTER CHECKOUT:",
                    dict(professional_entitlement_debug or {})
                )

            elif plan == "home_simple_report":
                project_id = metadata.get("project_id")
                stripe_session_id = session.get("id")

                if not project_id:
                    print(
                        "CRITICAL: Stripe Simple Report webhook missing project_id:",
                        stripe_session_id,
                    )
                    raise RuntimeError(
                        f"Simple Report payment has no project_id. "
                        f"Stripe session: {stripe_session_id}"
                    )

                project = db.execute(
                    text("""
                        SELECT id
                        FROM projects
                        WHERE id = :project_id
                          AND user_id = :user_id
                    """),
                    {
                        "project_id": str(project_id),
                        "user_id": str(user.id),
                    },
                ).first()

                if not project:
                    print(
                        "CRITICAL: Stripe Simple Report project not found or not owned:",
                        project_id,
                        user.id,
                    )
                    raise RuntimeError(
                        f"Simple Report project not found or not owned. "
                        f"Project: {project_id}, User: {user.id}"
                    )

                # Read the current Admin-configured access duration.
                setting = db.execute(
                    text("""
                        SELECT setting_value
                        FROM platform_settings
                        WHERE setting_key = 'home_simple_report_access_days'
                    """)
                ).first()

                access_days = int(setting[0]) if setting else 60

                now = datetime.utcnow()
                expires_at = now + timedelta(days=access_days)

               # Create project-scoped Simple Report entitlement.
                db.execute(
                    text("""
                        INSERT INTO home_wellness_entitlements (
                            user_id,
                            project_id,
                            entitlement_type,
                            status,
                            starts_at,
                            expires_at,
                            stripe_session_id
                        )
                        VALUES (
                            :user_id,
                            :project_id,
                            'simple_report',
                            'active',
                            :starts_at,
                            :expires_at,
                            :stripe_session_id
                        )
                        ON CONFLICT (stripe_session_id) DO NOTHING
                    """),
                    {
                        "user_id": str(user.id),
                        "project_id": str(project_id),
                        "starts_at": now,
                        "expires_at": expires_at,
                        "stripe_session_id": stripe_session_id,
                    },
                )

                # Record the successful one-time purchase.
                db.execute(
                    text("""
                        INSERT INTO home_wellness_transactions (
                            user_id,
                            project_id,
                            product_key,
                            stripe_session_id,
                            stripe_payment_intent_id,
                            amount,
                            currency,
                            status
                        )
                               VALUES (
            :user_id,
            :project_id,
            'home_simple_report',
            :stripe_session_id,
            :payment_intent_id,
            :amount,
            :currency,
            'completed'
        )
        ON CONFLICT (stripe_session_id) DO NOTHING
                    """),
                    {
                        "user_id": str(user.id),
                        "project_id": str(project_id),
                        "stripe_session_id": stripe_session_id,
                        "payment_intent_id": session.get("payment_intent"),
                        "amount": session.get("amount_total"),
                        "currency": session.get("currency"),
                    },
                )

                print(
                    "HOME SIMPLE REPORT ACTIVATED",
                    user.email,
                    project_id,
                    access_days,
                    "days",
                )


            elif plan == "home_deeper_first":
                project_id = metadata.get("project_id")
                stripe_session_id = session.get("id")

                if not project_id:
                    print(
                        "CRITICAL: Stripe Deeper Analysis webhook missing project_id:",
                        stripe_session_id,
                    )
                    raise RuntimeError(
                        f"Deeper Analysis payment has no project_id. "
                        f"Stripe session: {stripe_session_id}"
                    )

                # Verify project ownership.
                project = db.execute(
                    text("""
                        SELECT id
                        FROM projects
                        WHERE id = :project_id
                          AND user_id = :user_id
                    """),
                    {
                        "project_id": str(project_id),
                        "user_id": str(user.id),
                    },
                ).first()

                if not project:
                    print(
                        "CRITICAL: Stripe Deeper Analysis project not found or not owned:",
                        project_id,
                        user.id,
                    )
                    raise RuntimeError(
                        f"Deeper Analysis project not found or not owned. "
                        f"Project: {project_id}, User: {user.id}"
                    )

                now = datetime.utcnow()

                # Create project-scoped Deeper Analysis entitlement.
                # No expiration is assigned here.
                db.execute(
                    text("""
                        INSERT INTO home_wellness_entitlements (
                            user_id,
                            project_id,
                            entitlement_type,
                            status,
                            starts_at,
                            expires_at,
                            stripe_session_id
                        )
                        VALUES (
                            :user_id,
                            :project_id,
                            'deeper_analysis',
                            'active',
                            :starts_at,
                            NULL,
                            :stripe_session_id
                        )
                        ON CONFLICT (stripe_session_id) DO NOTHING
                    """),
                    {
                        "user_id": str(user.id),
                        "project_id": str(project_id),
                        "starts_at": now,
                        "stripe_session_id": stripe_session_id,
                    },
                )

                # Record the successful one-time purchase.
                db.execute(
                    text("""
                        INSERT INTO home_wellness_transactions (
                            user_id,
                            project_id,
                            product_key,
                            stripe_session_id,
                            stripe_payment_intent_id,
                            amount,
                            currency,
                            status
                        )
                        VALUES (
                            :user_id,
                            :project_id,
                            'home_deeper_first',
                            :stripe_session_id,
                            :payment_intent_id,
                            :amount,
                            :currency,
                            'completed'
                        )
                        ON CONFLICT (stripe_session_id) DO NOTHING
                    """),
                    {
                        "user_id": str(user.id),
                        "project_id": str(project_id),
                        "stripe_session_id": stripe_session_id,
                        "payment_intent_id": session.get("payment_intent"),
                        "amount": session.get("amount_total"),
                        "currency": session.get("currency"),
                    },
                )

                print(
                    "HOME DEEPER ANALYSIS ACTIVATED",
                    user.email,
                    project_id,
                    stripe_session_id,
                )

            elif plan == "home_deeper_repeat":
                project_id = metadata.get("project_id")
                stripe_session_id = session.get("id")

                if not project_id:
                    raise RuntimeError(
                        f"Deeper Repeat payment has no project_id. "
                        f"Stripe session: {stripe_session_id}"
                    )

                # Verify project ownership.
                project = db.execute(
                    text("""
                        SELECT id
                        FROM projects
                        WHERE id = :project_id
                          AND user_id = :user_id
                    """),
                    {
                        "project_id": str(project_id),
                        "user_id": str(user.id),
                    },
                ).first()

                if not project:
                    raise RuntimeError(
                        f"Deeper Repeat project not found or not owned. "
                        f"Project: {project_id}, User: {user.id}"
                    )

                # Record the successful repeat purchase.
                # No additional PHR entitlement is created.
                db.execute(
                    text("""
                        INSERT INTO home_wellness_transactions (
                            user_id,
                            project_id,
                            product_key,
                            stripe_session_id,
                            stripe_payment_intent_id,
                            amount,
                            currency,
                            status
                        )
                        VALUES (
                            :user_id,
                            :project_id,
                            'home_deeper_repeat',
                            :stripe_session_id,
                            :payment_intent_id,
                            :amount,
                            :currency,
                            'completed'
                        )
                        ON CONFLICT (stripe_session_id) DO NOTHING
                    """),
                    {
                        "user_id": str(user.id),
                        "project_id": str(project_id),
                        "stripe_session_id": stripe_session_id,
                        "payment_intent_id": session.get("payment_intent"),
                        "amount": session.get("amount_total"),
                        "currency": session.get("currency"),
                    },
                )

                print(
                    "HOME DEEPER REPEAT PURCHASE RECORDED",
                    user.email,
                    project_id,
                    stripe_session_id,
                )


            elif plan == "home_full_report":
                # Home Full Report is deliberately separate from Business credits
                # and is scoped to the purchased Home Project.
                project_id = metadata.get("project_id")

                if not project_id:
                    print(
                        "Stripe Home Full Report webhook missing project_id:",
                        session.get("id"),
                    )
                    db.commit()
                    return {"status": "ok"}

                project = db.execute(
                    text("""
                        SELECT id
                        FROM projects
                        WHERE id = :project_id
                          AND user_id = :user_id
                    """),
                    {
                        "project_id": str(project_id),
                        "user_id": str(user.id),
                    },
                ).first()

                if not project:
                    print(
                        "Stripe Home Full Report project not found or not owned:",
                        project_id,
                        user.id,
                    )
                    db.commit()
                    return {"status": "ok"}

                db.execute(
                    text("""
                        INSERT INTO home_project_entitlements
                            (
                                project_id,
                                user_id,
                                full_report_unlocked,
                                stripe_session_id
                            )
                        VALUES
                            (
                                :project_id,
                                :user_id,
                                TRUE,
                                :stripe_session_id
                            )
                        ON CONFLICT (project_id) DO UPDATE SET
                            user_id = EXCLUDED.user_id,
                            full_report_unlocked = TRUE,
                            stripe_session_id = EXCLUDED.stripe_session_id,
                            unlocked_at = CURRENT_TIMESTAMP
                    """),
                    {
                        "project_id": str(project_id),
                        "user_id": str(user.id),
                        "stripe_session_id": session.get("id"),
                    },
                )

            db.commit()

            print(
                "PAYMENT SUCCESS",
                user.email,
                plan,
                metadata.get("currency"),
            )

        # =============================================================
        # RECURRING BUSINESS PRO PAYMENT
        # =============================================================
        elif event_type == "invoice.paid":
            invoice = event["data"]["object"]

            subscription_id = invoice.get("subscription")

            # Stripe newer invoice structure:
            # subscription is stored under parent.subscription_details
            # when invoice.subscription is not populated.
            if not subscription_id:
                parent = invoice.get("parent") or {}
                subscription_details = parent.get("subscription_details") or {}
                subscription_id = subscription_details.get("subscription")

            if subscription_id:
                subscription = stripe.Subscription.retrieve(subscription_id)

                subscription_data = (
                    subscription.to_dict()
                    if hasattr(subscription, "to_dict")
                    else dict(subscription)
                )

                subscription_items = (
                    (subscription_data.get("items") or {}).get("data") or []
                )

                first_item = subscription_items[0] if subscription_items else {}

                period_start_ts = (
                    subscription_data.get("current_period_start")
                    or first_item.get("current_period_start")
                )

                period_end_ts = (
                    subscription_data.get("current_period_end")
                    or first_item.get("current_period_end")
                )

                period_start = (
                    datetime.fromtimestamp(period_start_ts, tz=timezone.utc)
                    if period_start_ts else None
                )

                period_end = (
                    datetime.fromtimestamp(period_end_ts, tz=timezone.utc)
                    if period_end_ts else None
                )

                print(
                    "STRIPE BILLING PERIOD DEBUG:",
                    {
                        "subscription_id": subscription_id,
                        "subscription_current_period_start": subscription_data.get("current_period_start"),
                        "subscription_current_period_end": subscription_data.get("current_period_end"),
                        "items": [
                            {
                                "current_period_start": item.get("current_period_start"),
                                "current_period_end": item.get("current_period_end"),
                            }
                            for item in subscription_items
                        ],
                        "invoice_period_start": invoice.get("period_start"),
                        "invoice_period_end": invoice.get("period_end"),
                    }
                )
                metadata = subscription_data.get("metadata") or {}

                invoice_id = invoice.get("id")
                user_id = metadata.get("user_id")
                plan = metadata.get("plan")

                # Determine Business plan from the actual Stripe Price ID.
                subscription_price_ids = set()
                subscription_currency = None

                for subscription_item in subscription_items:
                    price_object = subscription_item.get("price") or {}
                    if isinstance(price_object, dict):
                        item_price_id = price_object.get("id")
                        item_currency = price_object.get("currency")
                    else:
                        item_price_id = price_object
                        item_currency = None

                    if item_price_id:
                        subscription_price_ids.add(item_price_id)
                    if item_currency:
                        subscription_currency = str(item_currency).upper()

                invoice_currency = subscription_currency or ""
                configured_prices = STRIPE_PRICE_IDS.get(price_currency, {})

                if (
                    configured_prices.get("professional")
                    and configured_prices["professional"] in subscription_price_ids
                ):
                    plan = "professional"
                elif (
                    configured_prices.get("pro")
                    and configured_prices["pro"] in subscription_price_ids
                ):

                   plan = "pro"

                elif (
                    configured_prices.get("home_measure_monthly")
                    and configured_prices["home_measure_monthly"] in subscription_price_ids
                ):
                    plan = "home_measure_monthly"

                elif plan in ("pro", "professional"):
                    # Do not activate Business entitlements if Price ID is unknown.
                    plan = None

                # For Pro -> Professional upgrades, use the registered invoice
                # as the authoritative source of the Business user.
                upgrade_registration = None

                if (
                    invoice.get("billing_reason") == "subscription_update"
                    and plan == "professional"
                ):
                    if not invoice_id:
                        raise ValueError("Upgrade invoice ID is missing")

                    upgrade_registration = db.execute(text("""
                        SELECT user_id, plan_code, subscription_id
                        FROM stripe_invoice_allocations
                        WHERE invoice_id = :invoice_id
                        AND billing_reason = 'subscription_update'
                        AND plan_code = 'professional'
                        AND subscription_id = :subscription_id
                        FOR UPDATE
                    """), {
                        "invoice_id": invoice_id,
                        "subscription_id": subscription_id,
                    }).mappings().first()

                    if not upgrade_registration:
                        raise ValueError(
                            "Professional upgrade invoice registration not found"
                        )

                    user_id = upgrade_registration["user_id"]

                print(
                    "ADMIN INVOICE DEBUG:",
                    {
                        "invoice_id": invoice.get("id"),
                        "plan": plan,
                        "metadata": metadata,
                        "subscription_id": invoice.get("subscription"),
                    }
                )


                # Home Measure My Property subscription activation.
                # Only successfully paid subscription invoices qualify.
                if (
                    user_id
                    and plan == "home_measure_monthly"
                    and invoice.get("billing_reason") in (
                        "subscription_create",
                        "subscription_cycle",
                    )
                ):
                    project_id = metadata.get("project_id")

                    if not project_id:
                        raise ValueError(
                            "Home Measure Monthly subscription has no project_id"
                        )

                    if not subscription_id:
                        raise ValueError(
                            "Home Measure Monthly subscription ID is missing"
                        )

                    if not period_start or not period_end:
                        raise ValueError(
                            "Home Measure Monthly billing period is missing"
                        )

                    home_user_id = str(user_id)
                    home_project_id = str(project_id)

                    # Verify that the Home Project belongs to this user.
                    owned_project = db.execute(
                        text("""
                            SELECT id
                            FROM projects
                            WHERE id = :project_id
                              AND user_id = :user_id
                        """),
                        {
                            "project_id": home_project_id,
                            "user_id": home_user_id,
                        },
                    ).first()

                    if not owned_project:
                        raise ValueError(
                            "Home Measure Monthly project ownership validation failed"
                        )

                    # Do not activate access for a terminal subscription.
                    home_subscription_status = subscription_data.get("status")

                    if home_subscription_status not in ("active", "trialing"):
                        raise ValueError(
                            "Home Measure Monthly subscription is not active: "
                            f"{home_subscription_status}"
                        )

                    # One entitlement per Stripe subscription.
                    # Repeated paid invoices update the same entitlement.
                    home_entitlement = db.execute(
                        text("""
                            INSERT INTO home_wellness_entitlements (
                                user_id,
                                project_id,
                                entitlement_type,
                                status,
                                starts_at,
                                expires_at,
                                stripe_subscription_id,
                                current_period_start,
                                current_period_end,
                                cancel_at_period_end
                            )
                            VALUES (
                                :user_id,
                                :project_id,
                                'measure_monthly',
                                'active',
                                :period_start,
                                :period_end,
                                :subscription_id,
                                :period_start,
                                :period_end,
                                :cancel_at_period_end
                            )
                            ON CONFLICT (stripe_subscription_id)
                            WHERE entitlement_type = 'measure_monthly'
                              AND stripe_subscription_id IS NOT NULL
                            DO UPDATE SET
                                status = 'active',
                                starts_at = EXCLUDED.starts_at,
                                expires_at = EXCLUDED.expires_at,
                                current_period_start = EXCLUDED.current_period_start,
                                current_period_end = EXCLUDED.current_period_end,
                                cancel_at_period_end = EXCLUDED.cancel_at_period_end,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE
                                home_wellness_entitlements.user_id = EXCLUDED.user_id
                                AND home_wellness_entitlements.project_id = EXCLUDED.project_id
                            RETURNING id
                        """),
                        {
                            "user_id": home_user_id,
                            "project_id": home_project_id,
                            "period_start": period_start,
                            "period_end": period_end,
                            "subscription_id": subscription_id,
                            "cancel_at_period_end": bool(
                                subscription_data.get("cancel_at_period_end")
                            ),
                        },
                    ).scalar_one_or_none()

                    if home_entitlement is None:
                        raise ValueError(
                            "Home Measure Monthly entitlement conflict: "
                            "user or project mismatch"
                        )

                    print(
                        "HOME MEASURE MONTHLY ACTIVATED",
                        home_user_id,
                        home_project_id,
                        subscription_id,
                        period_end,
                    )


                if user_id and plan == "pro":
                    user = db.query(User).filter(User.id == user_id).first()

                    if user:
                        billing_reason = invoice.get("billing_reason")

                        if billing_reason == "subscription_cycle":
                            invoice_id = invoice.get("id")

                            if not invoice_id:
                                raise ValueError("Stripe invoice ID is missing")

                            allocation_result = db.execute(text("""
                                INSERT INTO report_credit_ledger (
                                    user_id,
                                    transaction_type,
                                    amount,
                                    balance_after,
                                    reference_type,
                                    reference_id,
                                    created_at
                                )
                                VALUES (
                                    :user_id,
                                    'ALLOCATION',
                                    5,
                                    5,
                                    'stripe_invoice',
                                    :invoice_id,
                                    CURRENT_TIMESTAMP
                                )
                                ON CONFLICT (reference_type, reference_id)
                                WHERE
                                    reference_type = 'stripe_invoice'
                                    AND transaction_type = 'ALLOCATION'
                                    AND reference_id IS NOT NULL
                                DO NOTHING
                                RETURNING id
                            """), {
                                "user_id": user.id,
                                "invoice_id": invoice_id,
                            })

                            allocation_id = allocation_result.scalar_one_or_none()

                            if allocation_id is not None:
                                result = db.execute(text("""
                                    UPDATE professional_entitlements
                                    SET
                                        plan_code = 'pro',
                                        assessment_limit = 5,
                                        assessments_used = 0,
                                        contact_opportunity_limit = 3,
                                        contact_opportunities_used = 0,
                                        branding_included = FALSE,
                                        status = 'active',
                                        stripe_subscription_id = :subscription_id,
                                        period_start = :period_start,
                                        period_end = :period_end,
                                        report_limit = 5,
                                        reports_used = 0,
                                        updated_at = CURRENT_TIMESTAMP
                                    WHERE
                                        user_id = :user_id
                                        AND stripe_subscription_id = :subscription_id
                                """), {
                                    "user_id": str(user.id),
                                    "subscription_id": subscription_id,
                                    "period_start": period_start,
                                    "period_end": period_end,
                                })

                                if result.rowcount == 1:
                                    user.plan = "pro"
                                    user.credits = 5

                                    print(
                                        "PRO MONTHLY RENEWAL",
                                        user.email,
                                        "5 credits",
                                    )
                                else:
                                    raise ValueError(
                                        "Pro entitlement renewal failed: subscription mismatch"
                                    )
                            else:
                                print(
                                    "PRO INVOICE ALREADY ALLOCATED",
                                    invoice_id,
                                )
                if user_id and plan == "professional":
                    user = db.query(User).filter(User.id == user_id).first()

                    if user:
                        billing_reason = invoice.get("billing_reason")
                        if billing_reason == "subscription_cycle":
                            invoice_id = invoice.get("id")

                            if not invoice_id:
                                raise ValueError("Stripe invoice ID is missing")
                            allocation_result = db.execute(text("""
                                INSERT INTO stripe_invoice_allocations (
                                    invoice_id,
                                    user_id,
                                    plan_code,
                                    billing_reason,
                                    subscription_id
                                )
                                VALUES (
                                    :invoice_id,
                                    :user_id,
                                    'professional',
                                    :billing_reason,
                                    :subscription_id
                                )
                                ON CONFLICT (invoice_id) DO NOTHING
                                RETURNING invoice_id
                            """), {
                                "invoice_id": invoice_id,
                                "user_id": str(user.id),
                                "billing_reason": billing_reason,
                                "subscription_id": subscription_id,
                            })

                            allocated_invoice_id = allocation_result.scalar_one_or_none()

                            if allocated_invoice_id is not None:
                                result = db.execute(text("""
                                    UPDATE professional_entitlements
                                    SET
                                        plan_code = 'professional',
                                        assessment_limit = 25,
                                        assessments_used = 0,
                                        contact_opportunity_limit = 10,
                                        contact_opportunities_used = 0,
                                        branding_included = TRUE,
                                        status = 'active',
                                        stripe_subscription_id = :subscription_id,
                                        period_start = :period_start,
                                        period_end = :period_end,
                                        report_limit = 25,
                                        reports_used = 0,
                                        updated_at = CURRENT_TIMESTAMP
                                    WHERE
                                        user_id = :user_id
                                        AND stripe_subscription_id = :subscription_id
                                """), {
                                    "user_id": str(user.id),
                                    "subscription_id": subscription_id,
                                    "period_start": period_start,
                                    "period_end": period_end,
                                })

                                if result.rowcount == 1:
                                    user.plan = "professional"

                                    print(
                                        "PROFESSIONAL MONTHLY RENEWAL",
                                        user.email,
                                        "25 assessments / 10 contact opportunities",
                                    )
                                else:
                                    raise ValueError(
                                        "Professional entitlement renewal failed: subscription mismatch"
                                    )
                            else:
                                existing_allocation = db.execute(text("""
                                    SELECT
                                        user_id,
                                        plan_code,
                                        billing_reason,
                                        subscription_id
                                    FROM stripe_invoice_allocations
                                    WHERE invoice_id = :invoice_id
                                    FOR UPDATE
                                """), {
                                    "invoice_id": invoice_id,
                                }).mappings().first()

                                if not existing_allocation:
                                    raise ValueError(
                                        "Professional invoice allocation conflict: record not found"
                                    )

                                if (
                                    str(existing_allocation["user_id"]) != str(user.id)
                                    or existing_allocation["plan_code"] != "professional"
                                    or existing_allocation["billing_reason"] != billing_reason
                                    or existing_allocation["subscription_id"] != subscription_id
                                ):
                                    raise ValueError(
                                        "Professional invoice allocation conflict: "
                                        "user, plan, billing reason or subscription mismatch"
                                    )

                                print(
                                    "PROFESSIONAL INVOICE ALREADY ALLOCATED",
                                    invoice_id,
                                )


                # Professional upgrade from Pro.
                # Preserve all usage counters during the upgrade.
                if user_id and plan == "professional":
                    if invoice.get("billing_reason") == "subscription_update":
                        user = db.query(User).filter(
                            User.id == user_id
                        ).first()
                        if not user:
                            raise ValueError(
                                "Professional upgrade failed: Business user not found"
                            )

                        if not upgrade_registration:
                            raise ValueError(
                                "Professional upgrade invoice registration not found"
                            )

                        result = db.execute(text("""
                            UPDATE professional_entitlements
                            SET
                                plan_code = 'professional',
                                assessment_limit = 25,
                                contact_opportunity_limit = 10,
                                branding_included = TRUE,
                                status = 'active',
                                stripe_subscription_id = :subscription_id,
                                period_start = :period_start,
                                period_end = :period_end,
                                report_limit = 25,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE
                                user_id = :user_id
                                AND stripe_subscription_id = :subscription_id
                                AND plan_code = 'pro'
                        """), {
                            "user_id": str(user.id),
                            "subscription_id": subscription_id,
                            "period_start": period_start,
                            "period_end": period_end,
                        })

                        if result.rowcount == 1:
                            user.plan = "professional"

                            print(
                                "PROFESSIONAL UPGRADE CONFIRMED",
                                user.email,
                                "Existing usage preserved",
                            )
                        else:
                            print(
                                "PROFESSIONAL UPGRADE ALREADY PROCESSED OR NOT ELIGIBLE",
                                invoice_id,
                            )
                if user_id and plan == "branding":
                    user = db.query(User).filter(User.id == user_id).first()

                    if user:
                        billing_reason = invoice.get("billing_reason")

                        if billing_reason == "subscription_cycle":
                            billing_period = metadata.get("billing_period")

                            if billing_period not in ("monthly", "annual"):
                                print(
                                    "BRANDING RENEWAL INVALID BILLING PERIOD",
                                    user.email,
                                    billing_period,
                                )
                            else:
                                now = datetime.utcnow()

                                if billing_period == "monthly":
                                    expires_at = now + timedelta(days=30)
                                else:
                                    expires_at = now + timedelta(days=365)

                                user.branding_active = True
                                user.branding_plan = billing_period
                                user.branding_activated_at = now
                                user.branding_expires_at = expires_at

                                print(
                                    "BRANDING RENEWAL",
                                    user.email,
                                    billing_period,
                                )

            db.commit()
        
        elif event_type in (
            "customer.subscription.updated",
            "customer.subscription.deleted",
            "invoice.payment_failed",
        ):
            event_object = event["data"]["object"]

            subscription_id = event_object.get("id")

            if event_type == "invoice.payment_failed":
                subscription_id = event_object.get("subscription")

                if not subscription_id:
                    parent = event_object.get("parent") or {}
                    details = parent.get("subscription_details") or {}
                    subscription_id = details.get("subscription")

                if subscription_id:
                    subscription = stripe.Subscription.retrieve(
                        subscription_id
                    )
                else:
                    subscription = None
            else:
                subscription = event_object

            if subscription:
                subscription_data = (
                    subscription.to_dict()
                    if hasattr(subscription, "to_dict")
                    else dict(subscription)
                )
                metadata = subscription_data.get("metadata") or {}

                user_id = metadata.get("user_id")
                plan = metadata.get("plan")

                subscription_items = (
                    (subscription_data.get("items") or {}).get("data") or []
                )

                # Determine Business plan from the actual Stripe Price ID.
                subscription_price_ids = set()
                subscription_currency = None

                for subscription_item in subscription_items:
                    price_object = subscription_item.get("price") or {}
                    if isinstance(price_object, dict):
                        item_price_id = price_object.get("id")
                        item_currency = price_object.get("currency")
                    else:
                        item_price_id = price_object
                        item_currency = None

                    if item_price_id:
                        subscription_price_ids.add(item_price_id)
                    if item_currency:
                        subscription_currency = str(item_currency).upper()

                price_currency = subscription_currency or ""
                configured_prices = STRIPE_PRICE_IDS.get(price_currency, {})

                if (
                    configured_prices.get("professional")
                    and configured_prices["professional"] in subscription_price_ids
                ):
                    plan = "professional"
                elif (
                    configured_prices.get("pro")
                    and configured_prices["pro"] in subscription_price_ids
                ):
                    plan = "pro"
                elif plan in ("pro", "professional"):
                    # Do not activate Business entitlements if Price ID is unknown.
                    plan = None

                # Determine the actual Business plan from the
                # current Stripe subscription price.
                invoice_currency = subscription_currency or str(
                    invoice_currency = subscription_currency or ""
                ).upper()

                current_price_ids = set()

                for item in subscription_items:
                    price_object = item.get("price") or {}
                    price_id = (
                        price_object.get("id")
                        if isinstance(price_object, dict)
                        else price_object
                    )

                    if price_id:
                        current_price_ids.add(price_id)

                configured_prices = STRIPE_PRICE_IDS.get(
                    invoice_currency, {}
                )

                if (
                    configured_prices.get("professional")
                    and configured_prices["professional"] in current_price_ids
                ):
                    plan = "professional"

                    # Synchronize metadata only after Stripe has
                    # confirmed the successful invoice payment.
                    if metadata.get("plan") != "professional":
                        stripe.Subscription.modify(
                            subscription_id,
                            metadata={
                                **metadata,
                                "plan": "professional",
                            },
                        )

                elif (
                    configured_prices.get("pro")
                    and configured_prices["pro"] in current_price_ids
                ):
                    plan = "pro"

                elif (
                    configured_prices.get("home_measure_monthly")
                    and configured_prices["home_measure_monthly"] in current_price_ids
                ):
                    plan = "home_measure_monthly"

                stripe_status = subscription_data.get("status")
                subscription_id = subscription_data.get("id") or subscription_id

                # Home Measure My Property subscription state.
                if user_id and plan == "home_measure_monthly":
                    stripe_period_start_ts = (
                        subscription_data.get("current_period_start")
                        or (
                            subscription_items[0].get("current_period_start")
                            if subscription_items else None
                        )
                    )

                    stripe_period_end_ts = (
                        subscription_data.get("current_period_end")
                        or (
                            subscription_items[0].get("current_period_end")
                            if subscription_items else None
                        )
                    )

                    home_period_start = (
                        datetime.fromtimestamp(
                            stripe_period_start_ts,
                            tz=timezone.utc,
                        )
                        if stripe_period_start_ts else None
                    )

                    home_period_end = (
                        datetime.fromtimestamp(
                            stripe_period_end_ts,
                            tz=timezone.utc,
                        )
                        if stripe_period_end_ts else None
                    )

                    if event_type == "customer.subscription.deleted":
                        home_status = "inactive"
                    elif stripe_status in (
                        "canceled",
                        "unpaid",
                        "incomplete_expired",
                    ):
                        home_status = "inactive"
                    elif stripe_status in ("active", "trialing"):
                        home_status = "active"
                    else:
                        home_status = None

                    if home_status:
                        db.execute(
                            text("""
                                UPDATE home_wellness_entitlements
                                SET
                                    status = :status,
                                    current_period_start = :period_start,
                                    current_period_end = :period_end,
                                    cancel_at_period_end = :cancel_at_period_end,
                                    updated_at = CURRENT_TIMESTAMP
                                WHERE
                                    user_id = :user_id
                                    AND stripe_subscription_id = :subscription_id
                                    AND entitlement_type = 'measure_monthly'
                            """),
                            {
                                "status": home_status,
                                "period_start": home_period_start,
                                "period_end": home_period_end,
                                "cancel_at_period_end": bool(
                                    subscription_data.get("cancel_at_period_end")
                                ),
                                "user_id": str(user_id),
                                "subscription_id": subscription_id,
                            },
                        )

                if user_id and plan in ("pro", "professional"):
                    # A failed invoice alone does not immediately revoke access.
                    # Only terminal Stripe subscription states deactivate it.
                    if event_type == "customer.subscription.deleted":
                        entitlement_status = "inactive"
                    elif stripe_status in (
                        "canceled",
                        "unpaid",
                        "incomplete_expired",
                    ):
                        entitlement_status = "inactive"
                    elif stripe_status in ("active", "trialing"):
                        entitlement_status = "active"
                    else:
                        entitlement_status = None

                    if entitlement_status:
                        db.execute(
                            text("""
                                UPDATE professional_entitlements
                                SET
                                    status = :status,
                                    updated_at = CURRENT_TIMESTAMP
                                WHERE user_id = :user_id
  AND stripe_subscription_id = :subscription_id
                            """),
                            {
                                "status": entitlement_status,
                                "user_id": str(user_id),
                                "subscription_id": subscription_id,
                            },
                        )

            db.commit()

        elif event_type == "checkout.session.async_payment_failed":
            session = event["data"]["object"]

            print(
                "HOME CHECKOUT ASYNC PAYMENT FAILED:",
                {
                    "session_id": session.get("id"),
                    "payment_status": session.get("payment_status"),
                    "metadata": session.get("metadata") or {},
                },
            )

            # No entitlement is created for an unsuccessful payment.
            db.commit()

        else:
            # We received a valid Stripe event that this V1 backend does not
            # currently need. Mark it processed so Stripe retries are harmless.
            db.commit()

        return {"status": "ok"}

    except Exception:
        db.rollback()
        print(traceback.format_exc())
        raise HTTPException(500, "Webhook processing failed")

    finally:
        db.close()


# =====================
# PROJECT SAVE (DB)
# =====================

@app.post("/project/save")
def save_project(
    body: dict,
    current_user=Depends(get_current_user),
):

    project_id = body.get("project_id")

    print(
        "\n🔥🔥🔥 PROJECT SAVE",
        "| REQUEST PROJECT ID:",
        project_id,
        "| USER ID:",
        current_user.id,
    )

    # =================================================
    # PROJECT ID IS REQUIRED
    # =================================================

    if project_id is None:
        raise HTTPException(
            status_code=400,
            detail="project_id is required",
        )

    try:
        project_id = int(project_id)

    except (
        ValueError,
        TypeError,
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid project_id",
        )

    # =================================================
    # DATA
    # =================================================

    data = body.get(
        "data",
        {},
    )

    if not isinstance(
        data,
        dict,
    ):
        raise HTTPException(
            status_code=400,
            detail="Project data must be an object",
        )

    floors = data.get(
        "floors",
        [],
    )

    if not isinstance(
        floors,
        list,
    ):
        floors = []

    # =================================================
    # FLOOR DEBUG
    # =================================================

    for floor_index, floor in enumerate(
        floors
    ):

        if not isinstance(
            floor,
            dict,
        ):
            continue

        print(
            "\n🔥 FLOOR:",
            floor_index,
            "| NAME:",
            floor.get(
                "name",
                "Unnamed",
            ),
        )

        # =====================
        # ZONES
        # =====================

        zones = floor.get(
            "zones",
            [],
        )

        print(
            "🔥 ZONE COUNT:",
            len(zones)
            if isinstance(
                zones,
                list,
            )
            else "NOT_LIST",
        )

        if isinstance(
            zones,
            list,
        ):

            for zone in zones:

                if not isinstance(
                    zone,
                    dict,
                ):
                    continue

                grid = zone.get(
                    "grid",
                    [],
                )

                print(
                    "🔥 ZONE:",
                    "| ID:",
                    zone.get("id"),
                    "| TYPE:",
                    zone.get("type"),
                    "| ROOM:",
                    zone.get("roomCode"),
                    "| GRID:",
                    len(grid)
                    if isinstance(
                        grid,
                        list,
                    )
                    else "NOT_LIST",
                )

        # =====================
        # SOURCES
        # =====================

        sources = floor.get(
            "sources",
            [],
        )

        print(
            "🔥 SOURCE COUNT:",
            len(sources)
            if isinstance(
                sources,
                list,
            )
            else "NOT_LIST",
        )

        if isinstance(
            sources,
            list,
        ):

            for source in sources:

                if not isinstance(
                    source,
                    dict,
                ):
                    continue

                print(
                    "🔥 SOURCE:",
                    "| ID:",
                    source.get("id"),
                    "| TYPE:",
                    source.get(
                        "type",
                        "unknown",
                    ),
                    "| FLOOR:",
                    source.get(
                        "floorIndex"
                    ),
                    "| X:",
                    source.get("x"),
                    "| Y:",
                    source.get("y"),
                )

    # =================================================
    # DATABASE
    # =================================================

    db = SessionLocal()

    try:

        # =================================================
        # FIND EXISTING PROJECT
        # =================================================
        project = (
            db.query(Project)
            .filter(Project.id == project_id)
            .first()
        )

        # =================================================
        # PROJECT MUST EXIST
        #
        # SAVE NEVER CREATES A PROJECT
        # =================================================

        if project is None:

            print(
                "❌ PROJECT SAVE FAILED:",
                "PROJECT NOT FOUND",
                project_id,
            )

            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        # =================================================
        # OWNERSHIP CHECK
        #
        # A user can only save their own project.
        # =================================================

        if project.user_id != current_user.id:

            print(
                "❌ PROJECT SAVE FORBIDDEN",
                "| PROJECT USER:",
                project.user_id,
                "| CURRENT USER:",
                current_user.id,
            )

            raise HTTPException(
                status_code=403,
                detail="Forbidden",
            )

        # =================================================
        # PROFESSIONAL ASSESSMENT ACCESS CONTROL
        # =================================================

        professional_access = get_professional_project_access(
            db=db,
            current_user=current_user,
            project_id=project.id,
        )

        if professional_access is not None:
            require_active_edit(professional_access)

        print(
            "🔥 PROJECT MODE: UPDATE"
        )

        print(
            "🔥 EXISTING PROJECT ID:",
            project.id,
        )

        print(
            "🔥 PROJECT OWNER:",
            project.user_id,
        )

        # TEMPORARY PROFESSIONAL PROJECT SAVE DIAGNOSTIC
        print(
            "\n[PROJECT SAVE IDENTITY CHECK]",
            {
                "request_project_id": project_id,
                "database_project_id": project.id,
                "database_project_name": project.name,
                "body_name": body.get("name"),
                "data_id": data.get("id"),
                "data_project_id": data.get("project_id"),
                "data_name": data.get("name"),
                "assessmentContext": data.get("assessmentContext"),
                "assessmentDatabaseId": data.get("assessmentDatabaseId"),
                "assessmentReference": data.get("assessmentReference"),
                "professionalRequestId": data.get("professionalRequestId"),
                "clientHomeProjectId": data.get("clientHomeProjectId"),
                "floor_count": len(floors),
                "floor_ids": [
                    f.get("id")
                    for f in floors
                    if isinstance(f, dict)
                ],
            },
        )

        # =================================================
        # CANONICAL PROJECT ID
        #
        # Database Project.id is the real identity.
        # =================================================

        data["project_id"] = project.id

        # =================================================
        # UPDATE PROJECT DATA
        # =================================================

        project.data = data

        # =================================================
        # OPTIONAL PROJECT NAME
        # =================================================

        project_name = body.get(
            "name"
        )

        if project_name:

            project.name = project_name

       
    

        # =================================================
        # SAVE VERSION IN SAME TRANSACTION
        # =================================================

        version = ProjectVersion(
            project_id=project.id,
            data=project.data,
        )

        db.add(
            version
        )

        # =================================================
        # COMMIT
        # =================================================
        db.commit()

        # =================================================
        # REFRESH PROJECT
        # =================================================

        db.refresh(
            project
        )

       
        saved_floors = (
            project.data.get(
                "floors",
                [],
            )
            if isinstance(
                project.data,
                dict,
            )
            else []
        )

        for floor_index, floor in enumerate(
            saved_floors
        ):

            if not isinstance(
                floor,
                dict,
            ):
                continue

            saved_zones = floor.get(
                "zones",
                [],
            )

            saved_sources = floor.get(
                "sources",
                [],
            )

            saved_rooms = floor.get(
                "rooms",
                [],
            )

            print(
                "🔥 SAVED FLOOR:",
                floor_index,
                "| NAME:",
                floor.get("name"),
                "| ZONES:",
                len(saved_zones)
                if isinstance(
                    saved_zones,
                    list,
                )
                else "NOT_LIST",
                "| SOURCES:",
                len(saved_sources)
                if isinstance(
                    saved_sources,
                    list,
                )
                else "NOT_LIST",
                "| ROOMS:",
                len(saved_rooms)
                if isinstance(
                    saved_rooms,
                    list,
                )
                else "NOT_LIST",
            )

        # =================================================
        # RESPONSE
        # =================================================

        return {
            "status": "ok",
            "project_id": project.id,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as err:

        db.rollback()

        print(
            "🔥🔥🔥 PROJECT SAVE ERROR:",
            err,
        )

        raise

    finally:

        db.close()


@app.get("/business-analysis/{project_id}")
def get_business_analysis(
    project_id: int,
    current_user=Depends(get_current_user),
):
    db = SessionLocal()

    try:
        project_row = (
            db.query(Project)
            .filter(
                Project.id == project_id,
                Project.user_id == current_user.id,
            )
            .first()
        )

        if not project_row:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        project = project_row.data

        analysis = build_business_analysis(
            project,
            "session_1",
            "session_2",
        )

        analysis["project_id"] = project_id

        return analysis

    finally:
        db.close()


# =====================
# GENERATE PDF
# =====================
@app.post("/generate-pdf")
def generate_pdf(
    data: dict,
    current_user=Depends(get_current_user),
):

    print("\n=== GENERATE PDF ===")

    db = SessionLocal()

    try:

        # =====================
        # 🔥 INPUTS
        # =====================

        pid = data.get("project_id")

        sessionA = data.get("sessionA") or "session_1"

        sessionB = data.get("sessionB") or "session_2"

        workspace = data.get("workspace") or "business"

        report_type = data.get("report_type") or "full"

        plan = "premium"

        # =====================
        # 🔥 VALIDATION
        # =====================

        if not pid:

            raise HTTPException(400, "Missing project_id")

        # =====================
        # 🔥 LOAD PROJECT
        # =====================


        project_row = (
            db.query(Project)
            .filter(
                Project.id == pid,
                Project.user_id == current_user.id,
            )
            .first()
        )
        if not project_row:
            raise HTTPException(404, "Project not found")

        # =====================
        # PROFESSIONAL ASSESSMENT ACCESS CONTROL
        # =====================

        professional_access = get_professional_project_access(
            db=db,
            current_user=current_user,
            project_id=project_row.id,
        )

        if professional_access is not None:
            require_active_edit(professional_access)

        # =====================
        # AUTHENTICATED USER
        # =====================

        user = current_user

        # =====================
        # 🔥 PROJECT DATA
        # =====================

        print("\n==========  RAW PROJECT ==========")
        print(type(project_row.data))
        print(project_row.data)
        print("=================================\n")


        project = project_row.data


        # =====================
        # WORKSPACE
        # =====================

        is_home_project = (
            workspace == "home"
            or project.get("assessmentContext") == "home"
            or project.get("type") == "home"
        )

        if is_home_project:
            workspace = "home"

        project["meta"] = {
            "company": "EMF Insight",
            "report_id": project.get("project_id"),
            "generated_at": datetime.now().strftime("%Y-%m-%d"),
            "version": "PHI Premium v1.0",
            "page": 1,
            "total_pages": 0,
        }



        for i, floor in enumerate(project.get("floors", [])):


            for zone in floor.get("zones", []):
                print(
                    "\nZONE:", zone.get("id"),
                    "\nkeys:", list(zone.keys()),
                    "\ngrid:", len(zone.get("grid", [])),
                    "\ngridDetail:", len(zone.get("gridDetail", [])),
                    "\nmeasurements:", len(zone.get("measurements", [])),
                )


        floors = project.get("floors", [])


        if floors:
            floor = floors[0]




        floors = project.get("floors", [])


        if floors:
            floor = floors[0]

            rooms = floor.get("rooms", [])




            for room in rooms:

                print(
                    "ROOM:",
                    room.get("name"),
                )

                print(
                    "KEYS:",
                    list(room.keys()),
                )

                print(
                    "ROOM:",
                    room,
                )

            print("========================================")

            if rooms:
                print("FIRST ROOM:", rooms[0]["id"])

                print(
                    "FIRST ROOM POLYGON POINTS:"
                )

                for p in rooms[0].get(
                    "polygon",
                    []
                ):

                    print(
                        "X:",
                        p.get("x"),
                        "Y:",
                        p.get("y"),
                    )



        floors = project.get("floors", [])



        if floors:

            floor = floors[0]



            # ---------- ROOM ----------
            if floor.get("rooms"):

                room = floor["rooms"][0]

                print("\nFIRST ROOM ID:", room.get("id"))

                poly = room.get("polygon", [])

                print("ROOM POLYGON COUNT:", len(poly))

                for i, p in enumerate(poly[:5]):
                    print(f"ROOM P{i}: ({p['x']:.3f}, {p['y']:.3f})")

            # ---------- ZONE ----------
            if floor.get("zones"):

                zone = floor["zones"][0]



                poly = zone.get("polygon", [])


                for i, p in enumerate(poly[:5]):
                    print(f"ZONE P{i}: ({p['x']:.3f}, {p['y']:.3f})")

                grid = zone.get("grid", [])



                if grid:

                    gp = grid[0]





        # ==================================================
        # 🔥 PROJECT SOURCE DEBUG
        # ==================================================

        project_indoor_sources = project.get(
            "indoorSources",
            []
        )

        project_outdoor_sources = project.get(
            "outdoorSources",
            []
        )

        project_sources = project.get(
            "sources",
            []
        )



        for source in (
            project_sources
            + project_indoor_sources
            + project_outdoor_sources
        ):

            if not isinstance(
                source,
                dict,
            ):
                continue



        for i, floor in enumerate(
            project.get(
                "floors",
                []
            )
        ):


            for s in floor.get(
                "sources",
                []
            ):

                print(
                    "SOURCE:",
                    s.get("type"),
                    s.get("id"),
                )



            print(
                f"FLOOR {i} OUTDOOR:",
                len(
                    floor.get(
                        "outdoorSources",
                        []
                    )
                )
            )

        # =====================
        # 🔥 VALIDATE DATA
        # =====================

        if workspace != "home":

            try:
                pts_before = engine.collect_points(
                    project,
                    sessionA,
                )
            except IndexError:
                pts_before = []

            if pts_before:

                print(
                    "FIRST POINT:",
                    pts_before[0],
                )

            if not pts_before:

                raise HTTPException(
                    400,
                    "No measurement data found",
                )

        # =====================
        # 🔥 CREDIT CHECK
        # =====================

        is_preview = False

        active_demo = is_professional_demo_active(
            user,
            db,
        )

        if user.is_admin:

            # Admin has unrestricted PDF access.
            pass

        elif workspace == "home":

            if report_type == "simple":

                entitlement = db.execute(
                    text("""
                        SELECT 1
                        FROM home_wellness_entitlements
                        WHERE project_id = :project_id
                        AND user_id = :user_id
                        AND entitlement_type = 'simple_report'
                        AND status = 'active'
                        AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP)
                        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                        LIMIT 1
                    """),
                    {
                        "project_id": str(project_row.id),
                        "user_id": str(user.id),
                    },
                ).first()

                if not entitlement:
                    raise HTTPException(
                        status_code=403,
                        detail="Active Simple Report purchase required for this Home project.",
                    )

            elif report_type == "full":

                entitlement = db.execute(
                    text("""
                        SELECT full_report_unlocked
                        FROM home_project_entitlements
                        WHERE project_id = :project_id
                        AND user_id = :user_id
                    """),
                    {
                        "project_id": str(project_row.id),
                        "user_id": str(user.id),
                    },
                ).scalar()

                if not entitlement:
                    raise HTTPException(
                        status_code=403,
                        detail="Full EMF Insight Report purchase required for this Home project.",
                    )

            else:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid Home report type.",
                )

        elif active_demo:
            pass

        elif user.plan == "professional":
            paid_professional = db.execute(
                text("""
                    SELECT 1
                    FROM professional_entitlements
                    WHERE user_id = :user_id
                      AND plan_code = 'professional'
                      AND status = 'active'
                    LIMIT 1
                """),
                {"user_id": str(user.id)},
            ).first()

            if not paid_professional:
                is_preview = True

        elif user.plan == "premium":

            pass

        elif getattr(user, "credits", 0) > 0:

            pass

        else:

            is_preview = True

                    # ==================================================
        # HOME SIMPLE REPORT — REUSE EXISTING PDF
        # ==================================================

        if workspace == "home" and report_type == "simple" and not is_preview:

            existing_transaction = db.execute(
                text("""
                    SELECT report_id
                    FROM home_wellness_transactions
                    WHERE user_id = :user_id
                      AND project_id = :project_id
                      AND product_key = 'home_simple_report'
                      AND status = 'completed'
                      AND report_id IS NOT NULL
                    ORDER BY id DESC
                    LIMIT 1
                """),
                {
                    "user_id": str(current_user.id),
                    "project_id": str(project_row.id),
                },
            ).first()

            if existing_transaction and existing_transaction.report_id:

                existing_report = (
                    db.query(Report)
                    .filter(
                        Report.id == existing_transaction.report_id,
                        Report.project_id == project_row.id,
                        Report.workspace == "home",
                        Report.preview == 0,
                    )
                    .first()
                )

                if not existing_report:
                    raise HTTPException(
                        status_code=409,
                        detail="Existing Simple Report record was not found.",
                    )

                print(
                    "HOME SIMPLE REPORT REUSED",
                    "| PROJECT:",
                    project_row.id,
                    "| REPORT:",
                    existing_report.id,
                )

                return {
                    "status": "ok",
                    "existing_report": True,
                    "report_id": existing_report.id,
                    "preview": False,
                }

        # =====================
        # BUILD PDF
        # =====================

        pdf_path = engine.build_pdf(
            project, sessionA, sessionB, pid,
            plan=plan,
            preview=is_preview,
            user=user,
            workspace=workspace,
            report_type=report_type,
        )

        if (
            workspace != "home"
            and not is_preview
            and not active_demo
            and user.plan not in ("premium", "professional")
        ):

            user.credits -= 1

            db.add(
                ReportCreditLedger(
                    user_id=user.id,
                    transaction_type="USAGE",
                    amount=-1,
                    balance_after=user.credits,
                    reference_type="business_report",
                    reference_id=str(project_row.id),
                )
            )

        # =====================
        # 🔥 SAVE REPORT
        # =====================

                # =====================
        # STORE HOME PDF IN SUPABASE
        # =====================

        if workspace == "home":
            storage_path = (
                f"{pid}/{uuid.uuid4().hex}_{report_type}.pdf"
            )

            with open(pdf_path, "rb") as pdf_file:
                supabase.storage.from_("reports").upload(
                    storage_path,
                    pdf_file,
                    file_options={
                        "content-type": "application/pdf",
                        "upsert": "true",
                    },
                )

            pdf_path = f"supabase://reports/{storage_path}"

                    # =====================
        # PROPERTY / PHR / ASSESSMENT LINKS
        # =====================

        project_data = project_row.data or {}

        property_record = None
        health_record = None
        assessment_record = None

        property_uid = project_data.get("propertyId")
        phr_uid = project_data.get("propertyHealthRecordId")
        assessment_uid = project_data.get("assessmentId")

        if property_uid:
            property_record = (
                db.query(Property)
                .filter(Property.property_uid == property_uid)
                .first()
            )

        if phr_uid and property_record:
            health_record = (
                db.query(PropertyHealthRecord)
                .filter(
                    PropertyHealthRecord.phr_uid == phr_uid,
                    PropertyHealthRecord.property_id == property_record.id,
                )
                .first()
            )

        if assessment_uid and property_record and health_record:
            assessment_record = (
                db.query(Assessment)
                .filter(
                    Assessment.assessment_uid == assessment_uid,
                    Assessment.property_id == property_record.id,
                    Assessment.property_health_record_id == health_record.id,
                )
                .first()
            )

        report = Report(
            pdf_path=pdf_path,
            preview=1 if is_preview else 0,
            project_id=project_row.id,
            workspace=workspace,

            property_id=property_record.id if property_record else None,
            property_health_record_id=(
                health_record.id if health_record else None
            ),
            assessment_id=(
                assessment_record.id if assessment_record else None
            ),

            report_type=report_type,
        )


        db.add(report)

        db.commit()

        db.refresh(report)

        if (
            workspace == "home"
            and report_type == "simple"
            and not is_preview
        ):
            db.execute(
                text("""
                    UPDATE home_wellness_transactions
                    SET
                        usage_status = 'used',
                        report_id = :report_id,
                        used_at = CURRENT_TIMESTAMP
                    WHERE user_id = :user_id
                      AND project_id = :project_id
                      AND product_key = 'home_simple_report'
                      AND status = 'completed'
                      AND usage_status = 'not_used'
                """),
                {
                    "report_id": report.id,
                    "user_id": str(current_user.id),
                    "project_id": str(pid),
                },
            )
            db.commit()

        # =====================
        # 🔥 RESPONSE
        # =====================

        filename = os.path.basename(pdf_path)

        return {
            "status": "ok",
            "pdf_url": f"/output/{filename}",
            "report_id": report.id,
            "preview": is_preview,
        }

    except HTTPException:

        raise

    except Exception as e:
        print("SUPABASE REPORT DOWNLOAD ERROR:", repr(e))
        raise HTTPException(404, "PDF file missing")

    finally:

        db.close()
