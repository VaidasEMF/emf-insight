from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

import stripe

from db.database import SessionLocal
from routes.auth import get_current_user
from models.user import User


router = APIRouter(
    prefix="/admin",
    tags=["admin-payments"],
)


def require_admin(
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user


@router.get("/payments")
def get_admin_payments(
    current_user: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        payments = []

        # ============================================================
        # HOME FULL REPORT PAYMENTS
        # ============================================================

        home_rows = db.execute(
            text("""
                SELECT
                    e.project_id,
                    e.user_id,
                    e.full_report_unlocked,
                    e.stripe_session_id,
                    e.unlocked_at,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.country,
                    u.city
                FROM home_project_entitlements e
                LEFT JOIN users u
                    ON CAST(u.id AS VARCHAR) = e.user_id
                WHERE e.stripe_session_id IS NOT NULL
                ORDER BY e.unlocked_at DESC
            """)
        ).mappings().all()

        for row in home_rows:
            session_id = row["stripe_session_id"]

            amount = None
            currency = None
            payment_status = "unknown"
            stripe_created = None

            if session_id:
                try:
                    session = stripe.checkout.Session.retrieve(
                        session_id
                    )

                    amount_total = session.get("amount_total")

                    if amount_total is not None:
                        amount = amount_total / 100

                    currency = (
                        str(session.get("currency") or "")
                        .upper()
                        or None
                    )

                    payment_status = (
                        session.get("payment_status")
                        or session.get("status")
                        or "unknown"
                    )

                    created = session.get("created")

                    if created:
                        from datetime import datetime, timezone

                        stripe_created = datetime.fromtimestamp(
                            created,
                            tz=timezone.utc,
                        ).isoformat()

                except Exception as exc:
                    print(
                        "Admin payment Stripe lookup failed:",
                        session_id,
                        repr(exc),
                    )

            payments.append(
                {
                    "date": stripe_created or row["unlocked_at"],
                    "user_id": row["user_id"],
                    "email": row["email"],
                    "first_name": row["first_name"],
                    "last_name": row["last_name"],
                    "country": row["country"],
                    "city": row["city"],
                    "product": "Full EMF Insight Report",
                    "plan": "home_full_report",
                    "project_id": row["project_id"],
                    "amount": amount,
                    "currency": currency,
                    "status": payment_status,
                    "stripe_session_id": session_id,
                    "source": "home_project_entitlement",
                }
            )

        # ============================================================
        # BUSINESS CREDIT PAYMENTS
        # ============================================================

        ledger_rows = db.execute(
            text("""
                SELECT
                    l.id,
                    l.user_id,
                    l.transaction_type,
                    l.amount,
                    l.balance_after,
                    l.reference_type,
                    l.reference_id,
                    l.created_at,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.country,
                    u.city
                FROM report_credit_ledger l
                LEFT JOIN users u
                    ON u.id = l.user_id
                WHERE l.reference_type IN (
                    'stripe_checkout',
                    'stripe_invoice'
                )
                ORDER BY l.created_at DESC
            """)
        ).mappings().all()

        for row in ledger_rows:
            reference_id = row["reference_id"]

            amount = None
            currency = None
            payment_status = "unknown"
            product = "Business Payment"

            if row["amount"] == 1:
                product = "Business Single Report"

            elif row["amount"] == 5:
                product = "Business Pro"

            if reference_id:
                try:
                    if row["reference_type"] == "stripe_checkout":
                        session = stripe.checkout.Session.retrieve(
                            reference_id
                        )

                        amount_total = session.get("amount_total")

                        if amount_total is not None:
                            amount = amount_total / 100

                        currency = (
                            str(session.get("currency") or "")
                            .upper()
                            or None
                        )

                        payment_status = (
                            session.get("payment_status")
                            or session.get("status")
                            or "unknown"
                        )

                    elif row["reference_type"] == "stripe_invoice":
                        invoice = stripe.Invoice.retrieve(
                            reference_id
                        )

                        amount_paid = invoice.get("amount_paid")

                        if amount_paid is not None:
                            amount = amount_paid / 100

                        currency = (
                            str(invoice.get("currency") or "")
                            .upper()
                            or None
                        )

                        payment_status = (
                            invoice.get("status")
                            or "unknown"
                        )

                except Exception as exc:
                    print(
                        "Admin business payment Stripe lookup failed:",
                        reference_id,
                        repr(exc),
                    )

            payments.append(
                {
                    "date": row["created_at"],
                    "user_id": row["user_id"],
                    "email": row["email"],
                    "first_name": row["first_name"],
                    "last_name": row["last_name"],
                    "country": row["country"],
                    "city": row["city"],
                    "product": product,
                    "plan": (
                        "business_single"
                        if row["amount"] == 1
                        else "business_pro"
                        if row["amount"] == 5
                        else None
                    ),
                    "project_id": None,
                    "amount": amount,
                    "currency": currency,
                    "status": payment_status,
                    "stripe_session_id": reference_id,
                    "source": "report_credit_ledger",
                }
            )

        # ============================================================
        # NEWEST FIRST
        # ============================================================

        payments.sort(
            key=lambda item: str(item.get("date") or ""),
            reverse=True,
        )

        return payments

    finally:
        db.close()

@router.get("/payments/debug")
def debug_admin_payments(
    current_user: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        rows = db.execute(
            text("""
                SELECT
                    project_id,
                    user_id,
                    full_report_unlocked,
                    stripe_session_id,
                    unlocked_at
                FROM home_project_entitlements
                ORDER BY unlocked_at DESC
            """)
        ).mappings().all()

        return [dict(row) for row in rows]

    finally:
        db.close()