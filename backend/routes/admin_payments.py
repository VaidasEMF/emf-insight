from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

import stripe

from db.database import SessionLocal
from routes.auth import get_current_user
from models.user import User

from datetime import datetime, timezone


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


def stripe_dashboard_url(object_type, object_id, livemode):
    if not object_id:
        return None

    mode = "" if livemode else "/test"

    paths = {
        "checkout_session": f"{mode}/checkout/sessions/{object_id}",
        "invoice": f"{mode}/invoices/{object_id}",
        "payment_intent": f"{mode}/payments/{object_id}",
        "subscription": f"{mode}/subscriptions/{object_id}",
    }

    path = paths.get(object_type)

    if not path:
        return None

    return f"https://dashboard.stripe.com{path}"


def stripe_object_dict(obj):
    if obj is None:
        return {}

    try:
        return obj.to_dict()
    except Exception:
        pass

    try:
        return dict(obj)
    except Exception:
        return {}

@router.get("/payments")
def get_admin_payments(
    current_user: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        payments = []

        # =========================================================
        # LOAD USERS
        # =========================================================

        users = {}

        user_rows = db.execute(
            text("""
                SELECT
                    id,
                    email,
                    first_name,
                    last_name,
                    country,
                    city
                FROM users
            """)
        ).mappings().all()

        print(
            "ADMIN PAYMENTS USERS:",
            [
                {
                    "id": row["id"],
                    "email": row["email"],
                    "first_name": row["first_name"],
                    "last_name": row["last_name"],
                }
                for row in user_rows
                if str(row["id"]) == "18"
            ]
        )

        for row in user_rows:
            users[str(row["id"])] = dict(row)

        # =========================================================
        # LOAD HOME PROJECTS
        # =========================================================

        projects = {}

        project_rows = db.execute(
            text("""
                SELECT
                    id,
                    user_id
                FROM projects
            """)
        ).mappings().all()

        for row in project_rows:
            projects[str(row["id"])] = dict(row)

        # =========================================================
        # STRIPE CHECKOUT SESSIONS
        # =========================================================

        try:
            sessions = stripe.checkout.Session.list(
                limit=100
            ).data
        except Exception as exc:
            print(
                "Admin payments Stripe Checkout lookup failed:",
                repr(exc)
            )
            sessions = []

        for session_obj in sessions:

            session = stripe_object_dict(session_obj)

            print(
                "ADMIN STRIPE SESSION:",
                session.get("id"),
                "livemode=",
                session.get("livemode"),
                "dashboard_url=",
                stripe_dashboard_url(
                    "checkout_session",
                    session.get("id"),
                    bool(session.get("livemode")),
                ),
            )

            metadata = (
                session.get("metadata")
                or {}
            )

            # Stripe metadata can sometimes be a StripeObject.
            if not isinstance(metadata, dict):
                try:
                    metadata = dict(metadata)
                except Exception:
                    metadata = {}

            plan = (
                metadata.get("plan")
                or ""
            )

            # Only EMF Insight products.
            if plan not in {
                "home_full_report",
                "single",
                "pro",
            }:
                continue

            user_id = (
                metadata.get("user_id")
                or ""
            )

            project_id = (
                metadata.get("project_id")
                or None
            )

            user = users.get(
                str(user_id)
            ) or {}

            if not user and user_id:
                try:
                    user_row = db.execute(
                        text("""
                            SELECT
                                id,
                                email,
                                first_name,
                                last_name,
                                country,
                                city
                            FROM users
                            WHERE id = :user_id
                            LIMIT 1
                        """),
                        {
                            "user_id": int(user_id),
                        },
                    ).mappings().first()

                    if user_row:
                        user = dict(user_row)

                except Exception as exc:
                    print(
                        "Admin payment user lookup failed:",
                        user_id,
                        repr(exc)
                    )

            amount_total = (
                session.get("amount_total")
            )

            amount = (
                amount_total / 100
                if amount_total is not None
                else None
            )

            currency = (
                str(
                    session.get("currency")
                    or metadata.get("currency")
                    or ""
                ).upper()
                or None
            )

            checkout_status = (
                session.get("status")
                or ""
            )

            payment_status = (
                session.get("payment_status")
                or ""
            )

            # -----------------------------------------------------
            # NORMALIZE STATUS
            # -----------------------------------------------------

            normalized_status = "pending"

            if payment_status == "paid":
                normalized_status = "paid"

            elif checkout_status == "expired":
                normalized_status = "expired"

            else:
                payment_intent_id = (
                    session.get("payment_intent")
                )

                if payment_intent_id:

                    try:
                        payment_intent_obj = (
                            stripe.PaymentIntent.retrieve(
                                payment_intent_id
                            )
                        )

                        payment_intent = stripe_object_dict(
                            payment_intent_obj
                        )

                        intent_status = (
                            payment_intent.get("status")
                            or ""
                        )

                        if intent_status in {
                            "succeeded"
                        }:
                            normalized_status = "paid"

                        elif intent_status in {
                            "requires_payment_method",
                            "canceled",
                        }:
                            normalized_status = "failed"

                        elif intent_status in {
                            "requires_action",
                            "processing",
                            "requires_confirmation",
                            "requires_capture",
                        }:
                            normalized_status = "pending"

                    except Exception as exc:
                        print(
                            "Admin payment intent lookup failed:",
                            payment_intent_id,
                            repr(exc)
                        )

            # -----------------------------------------------------
            # SOURCE
            # -----------------------------------------------------

            if plan == "home_full_report":
                source = "Home"
                product = "Full EMF Insight Report"
            elif plan == "single":
                source = "Business"
                product = "Business Single Report"
            elif plan == "pro":
                source = "Business"
                product = "Business Pro"
            else:
                source = "—"
                product = plan or "Unknown"

            # -----------------------------------------------------
            # CREATED
            # -----------------------------------------------------

            created = session.get("created")

            date_value = None

            if created:
                try:
                    date_value = datetime.fromtimestamp(
                        created,
                        tz=timezone.utc
                    ).isoformat()
                except Exception:
                    date_value = None

            payments.append({
                "date": date_value,
                "user_id": user_id or None,
                "email": user.get("email"),
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "country": user.get("country"),
                "city": user.get("city"),

                "source": source,
                "source_type": (
                    "home"
                    if source == "Home"
                    else "business"
                ),

                "project_id": project_id,

                "product": product,
                "plan": plan,

                "amount": amount,
                "currency": currency,

                "status": normalized_status,

                # Stripe objects
                "stripe_session_id": session.get("id"),
                "source_id": session.get("id"),

                "stripe_payment_intent_id": (
                    session.get("payment_intent")
                    if session.get("payment_intent")
                    else None
                ),

                "stripe_subscription_id": (
                    session.get("subscription")
                    if session.get("subscription")
                    else None
                ),

                "stripe_object_type": (
                    "payment_intent"
                    if session.get("payment_intent")
                    else (
                        "subscription"
                        if session.get("subscription")
                        else "checkout_session"
                    )
                ),

                "stripe_object_id": (
                    session.get("payment_intent")
                    if session.get("payment_intent")
                    else (
                        session.get("subscription")
                        if session.get("subscription")
                        else session.get("id")
                    )
                ),

                "stripe_livemode": bool(
                    session.get("livemode")
                ),

                "stripe_dashboard_url": stripe_dashboard_url(
                    (
                        "payment_intent"
                        if session.get("payment_intent")
                        else (
                            "subscription"
                            if session.get("subscription")
                            else "checkout_session"
                        )
                    ),
                    (
                        session.get("payment_intent")
                        if session.get("payment_intent")
                        else (
                            session.get("subscription")
                            if session.get("subscription")
                            else session.get("id")
                        )
                    ),
                    bool(
                        session.get("livemode")
                    ),
                ),

                "payment_source": "stripe_checkout",

                "checkout_status": checkout_status,
                "payment_status": payment_status,

                "subscription_id": (
                    session.get("subscription")
                ),
            })

        # =========================================================
        # STRIPE INVOICES
        # =========================================================

        try:
            invoices = stripe.Invoice.list(
                limit=100
            ).data
        except Exception as exc:
            print(
                "Admin payments Stripe Invoice lookup failed:",
                repr(exc)
            )
            invoices = []

        # Existing Checkout sessions.
        # Used to prevent the initial Pro subscription payment
        # from appearing twice as Checkout + Invoice.
        checkout_subscription_ids = {
            str(payment.get("subscription_id"))
            for payment in payments
            if payment.get("subscription_id")
        }

        for invoice_obj in invoices:

            invoice = stripe_object_dict(
                invoice_obj
            )

            metadata = (
                invoice.get("metadata")
                or {}
            )

            if not isinstance(metadata, dict):
                try:
                    metadata = dict(metadata)
                except Exception:
                    metadata = {}

            user_id = (
                metadata.get("user_id")
                or ""
            )

            plan = (
                metadata.get("plan")
                or ""
            )

            subscription_id = (
                invoice.get("subscription")
            )

            # -----------------------------------------------------
            # Skip the first Pro invoice if it belongs to a
            # subscription already represented by Checkout.
            # Later recurring invoices are still shown.
            # -----------------------------------------------------

            billing_reason = (
                invoice.get("billing_reason")
                or ""
            )

            if (
                plan == "pro"
                and subscription_id
                and str(subscription_id)
                in checkout_subscription_ids
                and billing_reason
                in {
                    "subscription_create",
                    "subscription_cycle",
                }
            ):
                # Only skip subscription_create.
                if billing_reason == "subscription_create":
                    continue

            user = users.get(
                str(user_id)
            ) or {}

            if not user and user_id:
                try:
                    user_row = db.execute(
                        text("""
                            SELECT
                                id,
                                email,
                                first_name,
                                last_name,
                                country,
                                city
                            FROM users
                            WHERE id = :user_id
                            LIMIT 1
                        """),
                        {
                            "user_id": int(user_id),
                        },
                    ).mappings().first()

                    if user_row:
                        user = dict(user_row)

                except Exception as exc:
                    print(
                        "Admin payment user lookup failed:",
                        user_id,
                        repr(exc)
                    )

            amount_paid = (
                invoice.get("amount_paid")
            )

            amount_due = (
                invoice.get("amount_due")
            )

            amount_value = (
                amount_paid
                if amount_paid is not None
                else amount_due
            )

            amount = (
                amount_value / 100
                if amount_value is not None
                else None
            )

            currency = (
                str(
                    invoice.get("currency")
                    or metadata.get("currency")
                    or ""
                ).upper()
                or None
            )

            invoice_status = (
                invoice.get("status")
                or ""
            )

            paid = (
                invoice.get("paid")
                is True
            )

            if paid or invoice_status == "paid":
                normalized_status = "paid"

            elif invoice_status in {
                "uncollectible"
            }:
                normalized_status = "failed"

            elif invoice_status in {
                "void"
            }:
                normalized_status = "expired"

            else:
                normalized_status = "pending"

            source = "Business"
            product = "Business Pro"

            created = (
                invoice.get("created")
            )

            date_value = None

            if created:
                try:
                    date_value = datetime.fromtimestamp(
                        created,
                        tz=timezone.utc
                    ).isoformat()
                except Exception:
                    date_value = None

            payments.append({
                "date": date_value,

                "user_id": user_id or None,
                "email": user.get("email"),
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "country": user.get("country"),
                "city": user.get("city"),

                "source": source,
                "source_type": "business",

                "project_id": None,

                "product": product,
                "plan": plan or "pro",

                "amount": amount,
                "currency": currency,

                "status": normalized_status,

                # Stripe objects
                "stripe_session_id": None,
                "source_id": invoice.get("id"),

                "stripe_payment_intent_id": (
                    invoice.get("payment_intent")
                    if invoice.get("payment_intent")
                    else None
                ),

                "stripe_subscription_id": (
                    invoice.get("subscription")
                    if invoice.get("subscription")
                    else None
                ),

                "stripe_object_type": (
                    "payment_intent"
                    if invoice.get("payment_intent")
                    else "invoice"
                ),

                "stripe_object_id": (
                    invoice.get("payment_intent")
                    if invoice.get("payment_intent")
                    else invoice.get("id")
                ),

                "stripe_livemode": bool(
                    invoice.get("livemode")
                ),

                "stripe_dashboard_url": stripe_dashboard_url(
                    (
                        "payment_intent"
                        if invoice.get("payment_intent")
                        else "invoice"
                    ),
                    (
                        invoice.get("payment_intent")
                        if invoice.get("payment_intent")
                        else invoice.get("id")
                    ),
                    bool(
                        invoice.get("livemode")
                    ),
                ),

                "payment_source": "stripe_invoice",

                "checkout_status": None,

                "payment_status": invoice_status,

                "subscription_id": subscription_id,
            })

        # =========================================================
        # SORT
        # =========================================================

        payments.sort(
            key=lambda item: (
                item.get("date")
                or ""
            ),
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
        result = {
            "home_project_entitlements": [],
            "stripe_checkout_sessions": [],
            "stripe_invoices": [],
        }

        # ============================================================
        # HOME ENTITLEMENTS
        # ============================================================

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

        result["home_project_entitlements"] = [
            dict(row)
            for row in rows
        ]

        # ============================================================
        # STRIPE CHECKOUT SESSIONS
        # ============================================================

        try:
            sessions = stripe.checkout.Session.list(
                limit=100,
            )

            for session in sessions.data:
                metadata = getattr(session, "metadata", None)

                if isinstance(metadata, dict):
                    plan = metadata["plan"] if "plan" in metadata else None
                else:
                    plan = getattr(metadata, "plan", None)

                if plan not in {
                    "home_full_report",
                    "single",
                    "pro",
                }:
                    continue

                result["stripe_checkout_sessions"].append(
                    {
                        "id": session.id,
                        "status": getattr(
                            session,
                            "status",
                            None,
                        ),
                        "payment_status": getattr(
                            session,
                            "payment_status",
                            None,
                        ),
                        "amount_total": getattr(
                            session,
                            "amount_total",
                            None,
                        ),
                        "currency": getattr(
                            session,
                            "currency",
                            None,
                        ),
                        "metadata": {
                            "plan": getattr(metadata, "plan", None),
                            "user_id": getattr(metadata, "user_id", None),
                            "project_id": getattr(metadata, "project_id", None),
                        },
                    }
                )

        except Exception as exc:
            result["stripe_checkout_sessions"] = {
                "error": repr(exc)
            }

                # ============================================================
        # STRIPE INVOICES
        # ============================================================

        try:
            invoices = stripe.Invoice.list(
                limit=100,
            )

            for invoice in invoices.data:
                metadata = (
                    getattr(invoice, "metadata", None)
                    or {}
                )

                plan = getattr(metadata, "plan", None)

                if plan not in {
                    "home_full_report",
                    "single",
                    "pro",
                }:
                    continue

                result["stripe_invoices"].append(
                    {
                        "id": invoice.id,
                        "status": getattr(
                            invoice,
                            "status",
                            None,
                        ),
                        "amount_paid": getattr(
                            invoice,
                            "amount_paid",
                            None,
                        ),
                        "currency": getattr(
                            invoice,
                            "currency",
                            None,
                        ),
                        "metadata": dict(metadata),
                        "created": getattr(
                            invoice,
                            "created",
                            None,
                        ),
                    }
                )

        except Exception as exc:
            result["stripe_invoices"] = {
                "error": repr(exc)
            }

        return result

    finally:
        db.close()