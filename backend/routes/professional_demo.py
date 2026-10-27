from datetime import datetime, timedelta
import json
import os
import secrets
import urllib.error
import urllib.request

from fastapi import APIRouter, Depends, HTTPException, Form
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from db.database import SessionLocal
from models.user import User
from auth.passwords import hash_password, verify_password
from auth.jwt import create_access_token
from routes.auth import get_current_user


router = APIRouter(
    prefix="/professional-demo",
    tags=["professional-demo"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class DemoCreateRequest(BaseModel):
    duration_days: int = 7
    request_feedback: bool = True

class DemoManagementRequest(BaseModel):
    action: str
    days: int | None = None
    expires_at: datetime | None = None

# =====================
# ADMIN - LIST DEMO LINKS
# =====================

@router.get("/admin/list")
def list_professional_demos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    now = datetime.utcnow()

    rows = db.execute(
        text(
            """
            SELECT
                d.id,
                d.token,
                d.status,
                d.duration_days,
                d.request_feedback,
                d.sent_to,
                d.sent_at,
                d.user_id,
                d.created_at,
                d.activated_at,
                d.expires_at,
                u.first_name,
                u.last_name,
                u.email,
                p.company_name
            FROM professional_demo_links d
            LEFT JOIN users u
                ON CAST(u.id AS VARCHAR) = d.user_id
            LEFT JOIN professional_profiles p
                ON CAST(p.user_id AS VARCHAR) = d.user_id
            ORDER BY d.created_at DESC
            """
        )
    ).mappings().all()

    result = []

    for row in rows:
        item = dict(row)
        expires_at = item.get("expires_at")

        # Automatically mark expired active demos.
        if (
            item["status"] == "active"
            and expires_at is not None
            and expires_at <= now
        ):
            item["status"] = "expired"

            db.execute(
                text(
                    """
                    UPDATE professional_demo_links
                    SET status = 'expired'
                    WHERE id = :id
                    """
                ),
                {"id": item["id"]},
            )

        # Calculate remaining days only for demos with a future expiry.
        if expires_at is not None and expires_at > now:
            item["days_remaining"] = max(
                0,
                (expires_at - now).days,
            )
        else:
            item["days_remaining"] = 0

        # Canonical public Demo URL.
        item["demo_url"] = (
            f"https://app.emfinsight.com/professional-demo/"
            f"{item['token']}"
        )

        # Determine actual feedback state.
        feedback = db.execute(
            text(
                """
                SELECT id
                FROM professional_demo_feedback
                WHERE demo_id = :demo_id
                ORDER BY created_at DESC
                LIMIT 1
                """
            ),
            {"demo_id": item["id"]},
        ).first()

        if feedback:
            item["feedback_status"] = "submitted"
        elif item["request_feedback"]:
            item["feedback_status"] = "requested"
        else:
            item["feedback_status"] = "not_requested"

        result.append(item)

    db.commit()

    return result


# =====================
# ADMIN — CREATE DEMO LINK
# =====================

@router.post("/admin/create")
def create_professional_demo(
    data: DemoCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    if data.duration_days < 1 or data.duration_days > 365:
        raise HTTPException(
            status_code=400,
            detail="Demo duration must be between 1 and 365 days",
        )

    token = secrets.token_urlsafe(32)

    result = db.execute(
        text(
            """
            INSERT INTO professional_demo_links (
                token,
                status,
                duration_days,
                request_feedback
            )
            VALUES (
                :token,
                'available',
                :duration_days,
                :request_feedback
            )
            RETURNING id, token, status, duration_days, request_feedback, created_at
            """
        ),
        {
            "token": token,
            "duration_days": data.duration_days,
            "request_feedback": data.request_feedback,
        },
    )

    demo = result.mappings().first()
    db.commit()

    return {
        "id": demo["id"],
        "token": demo["token"],
        "status": demo["status"],
        "duration_days": demo["duration_days"],
        "request_feedback": demo["request_feedback"],
        "created_at": demo["created_at"],
        "demo_url": f"/professional-demo/{demo['token']}",
    }

# =====================
# ADMIN — MANAGE DEMO
# =====================

@router.patch("/admin/{demo_id}")
def manage_professional_demo(
    demo_id: int,
    data: DemoManagementRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    demo = db.execute(
        text(
            """
SELECT
    id,
    status,
    duration_days,
    user_id,
    activated_at,
    expires_at
FROM professional_demo_links
WHERE id = :id

            """
        ),
        {
            "id": demo_id,
        },
    ).mappings().first()

    if not demo:
        raise HTTPException(
            status_code=404,
            detail="Demo link not found",
        )

    action = data.action.strip().lower()
    now = datetime.utcnow()
    if action == "extend":
        if demo["status"] != "active":
            raise HTTPException(
                status_code=400,
                detail="Only an active Demo can be extended.",
            )

        if not demo["user_id"]:
            raise HTTPException(
                status_code=400,
                detail="Cannot extend Demo: no user is linked to this Demo.",
            )

        professional = (
            db.query(User)
            .filter(User.id == int(demo["user_id"]))
            .first()
        )

        if not professional:
            raise HTTPException(
                status_code=400,
                detail="Cannot extend Demo: linked user does not exist.",
            )

        if not data.days or data.days < 1 or data.days > 365:
            raise HTTPException(
                status_code=400,
                detail="Extension must be between 1 and 365 days.",
            )

        base_date = demo["expires_at"]

        if base_date is None or base_date < now:
            base_date = now

        new_expiry = base_date + timedelta(days=data.days)
        result = db.execute(
            text("""
                UPDATE professional_demo_links
                SET
                    expires_at = :expires_at,
                    duration_days = duration_days + :days
                WHERE id = :id
                  AND status = 'active'
                  AND user_id IS NOT NULL
            """),
            {
                "id": demo_id,
                "expires_at": new_expiry,
                "days": data.days,
            },
        )

        if result.rowcount != 1:
            raise HTTPException(
                status_code=409,
                detail="Demo status changed. Refresh and try again.",
            )


    elif action == "set_expiry":
        if data.expires_at is None:
            raise HTTPException(
                status_code=400,
                detail="expires_at is required.",
            )

        if data.expires_at <= now:
            raise HTTPException(
                status_code=400,
                detail="Expiry must be in the future.",
            )

        if demo["status"] != "active" or not demo["user_id"]:
            raise HTTPException(
                status_code=400,
                detail="Only an active Demo linked to a user can have its expiry changed.",
            )

        professional = (
            db.query(User)
            .filter(User.id == int(demo["user_id"]))
            .first()
        )

        if not professional:
            raise HTTPException(
                status_code=400,
                detail="Cannot change expiry: linked user does not exist.",
            )
        result = db.execute(
            text("""
                UPDATE professional_demo_links
                SET expires_at = :expires_at
                WHERE id = :id
                  AND status = 'active'
                  AND user_id IS NOT NULL
            """),
            {
                "id": demo_id,
                "expires_at": data.expires_at,
            },
        )

        if result.rowcount != 1:
            raise HTTPException(
                status_code=409,
                detail="Demo status changed. Refresh and try again.",
            )


    elif action == "revoke":
        if demo["status"] != "active":
            raise HTTPException(
                status_code=400,
                detail="Only an active Demo can be revoked.",
            )
        result = db.execute(
            text("""
                UPDATE professional_demo_links
                SET status = 'revoked'
                WHERE id = :id
                  AND status = 'active'
            """),
            {"id": demo_id},
        )

        if result.rowcount != 1:
            raise HTTPException(
                status_code=409,
                detail="Demo status changed. Refresh and try again.",
            )


    elif action == "reactivate":
        if demo["status"] != "revoked":
            raise HTTPException(
                status_code=400,
                detail="Only a revoked Demo can be reactivated.",
            )

        if not demo["user_id"] or not demo["activated_at"]:
            raise HTTPException(
                status_code=400,
                detail="Cannot reactivate Demo: no previous activation is linked to a user.",
            )

        professional = (
            db.query(User)
            .filter(User.id == int(demo["user_id"]))
            .first()
        )

        if not professional:
            raise HTTPException(
                status_code=400,
                detail="Cannot reactivate Demo: linked user does not exist.",
            )

        days = data.days or demo["duration_days"] or 7

        if days < 1 or days > 365:
            raise HTTPException(
                status_code=400,
                detail="Reactivation must be between 1 and 365 days.",
            )

        new_expiry = now + timedelta(days=days)

        result = db.execute(
            text("""
                UPDATE professional_demo_links
                SET
                    status = 'active',
                    expires_at = :expires_at,
                    duration_days = :duration_days
                WHERE id = :id
                  AND status = 'revoked'
                  AND user_id IS NOT NULL
                  AND activated_at IS NOT NULL
            """),
            {
                "id": demo_id,
                "expires_at": new_expiry,
                "duration_days": days,
            },
        )

        if result.rowcount != 1:
            raise HTTPException(
                status_code=409,
                detail="Demo status changed. Refresh and try again.",
            )

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid Demo management action.",
        )


    db.commit()

    updated = db.execute(
        text(
            """
            SELECT
                id,
                token,
                status,
                duration_days,
                user_id,
                created_at,
                activated_at,
                expires_at
            FROM professional_demo_links
            WHERE id = :id
            """
        ),
        {
            "id": demo_id,
        },
    ).mappings().first()

    return dict(updated)

# =====================
# ADMIN — DELETE DEMO LINK
# =====================

@router.delete("/admin/{demo_id}")
def delete_professional_demo(
    demo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    demo = db.execute(
        text(
            """
            SELECT
                id,
                status
            FROM professional_demo_links
            WHERE id = :id
            """
        ),
        {"id": demo_id},
    ).mappings().first()

    if not demo:
        raise HTTPException(
            status_code=404,
            detail="Demo link not found",
        )

    if demo["status"] != "available":
        raise HTTPException(
            status_code=400,
            detail="Only unused available Demo links can be deleted",
        )

    db.execute(
        text(
            """
            DELETE FROM professional_demo_links
            WHERE id = :id
              AND status = 'available'
            """
        ),
        {"id": demo_id},
    )

    db.commit()

    return {
        "status": "deleted",
        "demo_id": demo_id,
    }

# =====================
# ADMIN — SEND DEMO LINK
# =====================

class DemoSendRequest(BaseModel):
    recipient_email: str
    message: str = ""


@router.post("/admin/{demo_id}/send")
def send_professional_demo(
    demo_id: int,
    data: DemoSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    recipient_email = data.recipient_email.strip()

    if not recipient_email or "@" not in recipient_email:
        raise HTTPException(
            status_code=400,
            detail="Valid recipient email is required",
        )

    demo = db.execute(
        text(
            """
            SELECT
                id,
                token,
                status
            FROM professional_demo_links
            WHERE id = :id
            """
        ),
        {"id": demo_id},
    ).mappings().first()

    if not demo:
        raise HTTPException(
            status_code=404,
            detail="Demo link not found",
        )

    if demo["status"] not in ("available", "active"):
        raise HTTPException(
            status_code=400,
            detail="This Demo link cannot be sent",
        )

    demo_url = f"https://app.emfinsight.com/professional-demo/{demo['token']}"

    message = data.message.strip()

    if not message:
        message = (
            "You have been invited to try EMF Insight Professional Demo. "
            "Use the link below to activate your 7-day Demo access."
        )

    html_content = f"""
    <html>
        <body>
            <p>{message}</p>
            <p>
                <a href="{demo_url}">Open EMF Insight Professional Demo</a>
            </p>
            <p>{demo_url}</p>
        </body>
    </html>
    """

    brevo_api_key = os.getenv("BREVO_API_KEY")

   
    if not brevo_api_key:
        raise HTTPException(
            status_code=500,
            detail="BREVO_API_KEY is not configured.",
        )

    payload = {
        "sender": {
            "name": "EMF Insight",
            "email": "info@emfinsight.com",
        },
        "to": [
            {
                "email": recipient_email,
            }
        ],
        "subject": "EMF Insight Professional Demo",
        "htmlContent": html_content,
    }

    request = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "accept": "application/json",
            "api-key": brevo_api_key,
            "content-type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            response_body = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        try:
            error_body = exc.read().decode("utf-8")
        except Exception:
            error_body = ""

        raise HTTPException(
            status_code=502,
            detail=f"Brevo email failed: {error_body or exc.reason}",
        )
    except urllib.error.URLError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Brevo email failed: {exc.reason}",
        )

    sent_at = datetime.utcnow()

    db.execute(
        text(
            """
            UPDATE professional_demo_links
            SET
                sent_to = :sent_to,
                sent_at = :sent_at
            WHERE id = :id
            """
        ),
        {
            "id": demo_id,
            "sent_to": recipient_email,
            "sent_at": sent_at,
        },
    )

    db.commit()

    return {
        "status": "sent",
        "demo_id": demo_id,
        "recipient_email": recipient_email,
        "sent_at": sent_at,
        "demo_url": demo_url,
        "brevo_response": response_body,
    }

# =====================
# PUBLIC — CHECK DEMO LINK
# =====================

@router.get("/{token}")
def get_professional_demo(
    token: str,
    db: Session = Depends(get_db),
):
    demo = db.execute(
        text(
            """
            SELECT
                id,
                status,
                created_at,
                activated_at,
                expires_at,
                user_id
            FROM professional_demo_links
            WHERE token = :token
            """
        ),
        {
            "token": token,
        },
    ).mappings().first()

    if not demo:
        raise HTTPException(
            status_code=404,
            detail="Demo link not found",
        )

    if (
        demo["status"] == "active"
        and demo["expires_at"] is not None
        and demo["expires_at"] <= datetime.utcnow()
    ):
        db.execute(
            text(
                """
                UPDATE professional_demo_links
                SET status = 'expired'
                WHERE id = :id
                """
            ),
            {
                "id": demo["id"],
            },
        )
        db.commit()

        demo = dict(demo)
        demo["status"] = "expired"

    return {
        "valid": demo["status"] in ("available", "active"),
        "status": demo["status"],
        "created_at": demo["created_at"],
        "activated_at": demo["activated_at"],
        "expires_at": demo["expires_at"],
        "user_id": str(demo["user_id"]) if demo["user_id"] is not None else None,
    }


# =====================
# PUBLIC — ACTIVATE DEMO
# =====================


@router.post("/{token}/activate")
def activate_professional_demo(
    token: str,
    first_name: str = Form(),
    last_name: str = Form(),
    email: str = Form(),
    password: str = Form(),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()

    try:
        # --------------------------------------------------
        # 1. LOCK DEMO LINK — prevent concurrent activation
        # --------------------------------------------------
        demo = db.execute(
            text("""
                SELECT
                    id,
                    status,
                    duration_days,
                    expires_at
                FROM professional_demo_links
                WHERE token = :token
                FOR UPDATE
            """),
            {"token": token},
        ).mappings().first()

        if not demo:
            raise HTTPException(
                status_code=404,
                detail="Demo link not found",
            )

        if demo["status"] != "available":
            raise HTTPException(
                status_code=400,
                detail="Demo link is no longer available",
            )

        duration_days = int(demo["duration_days"] or 0)

        if not 1 <= duration_days <= 365:
            raise HTTPException(
                status_code=400,
                detail="Invalid Demo duration",
            )

        expires_at = now + timedelta(days=duration_days)

        # --------------------------------------------------
        # 2. FIND EXISTING ACCOUNT
        # --------------------------------------------------
        normalized_email = email.strip().lower()

        if not normalized_email:
            raise HTTPException(
                status_code=400,
                detail="Email is required",
            )

        professional = (
            db.query(User)
            .filter(User.email == normalized_email)
            .with_for_update()
            .first()
        )

        if professional:
            # Existing account: verify its password.
            if (
                not professional.hashed_password
                or not verify_password(
                    password,
                    professional.hashed_password,
                )
            ):
                raise HTTPException(
                    status_code=401,
                    detail="Invalid email or password",
                )

        else:
            # --------------------------------------------------
            # 3. CREATE ACCOUNT ONLY IF IT DOES NOT EXIST
            # --------------------------------------------------
            professional = User(
                first_name=first_name.strip(),
                last_name=last_name.strip(),
                email=normalized_email,
                hashed_password=hash_password(password),
                credits=0,
                plan="free",
                role="professional",
            )

            db.add(professional)
            db.flush()

        # --------------------------------------------------
        # 4. CREATE PROFESSIONAL PROFILE IF MISSING
        # --------------------------------------------------
        db.execute(
            text("""
                INSERT INTO professional_profiles (
                    user_id,
                    first_name,
                    last_name,
                    professional_email,
                    availability_status,
                    verification_status
                )
                VALUES (
                    :user_id,
                    :first_name,
                    :last_name,
                    :professional_email,
                    'unavailable',
                    'not_requested'
                )
                ON CONFLICT (user_id) DO NOTHING
            """),
            {
                "user_id": str(professional.id),
                "first_name": (
                    professional.first_name or first_name.strip()
                ),
                "last_name": (
                    professional.last_name or last_name.strip()
                ),
                "professional_email": professional.email,
            },
        )

        # IMPORTANT:
        # Do not create a permanent paid professional_entitlements
        # record for a temporary Demo. Demo validity is tracked by
        # professional_demo_links and expires_at.
        #
        # Do not overwrite any existing paid entitlements.

        # --------------------------------------------------
        # 5. ACTIVATE DEMO — only if the link is still available
        # --------------------------------------------------
        updated = db.execute(
            text("""
                UPDATE professional_demo_links
                SET
                    status = 'active',
                    user_id = :user_id,
                    activated_at = :activated_at,
                    expires_at = :expires_at
                WHERE id = :demo_id
                  AND status = 'available'
            """),
            {
                "user_id": str(professional.id),
                "activated_at": now,
                "expires_at": expires_at,
                "demo_id": demo["id"],
            },
        )

        if updated.rowcount != 1:
            raise HTTPException(
                status_code=409,
                detail="Demo link has already been activated",
            )

        db.commit()
        db.refresh(professional)

        access_token = create_access_token(
            {"sub": str(professional.id)}
        )

        return {
            "message": "Professional Demo activated",
            "access_token": access_token,
            "token_type": "bearer",
            "role": professional.role,
            "demo_status": "active",
            "demo_expires_at": expires_at,
        }

    except Exception:
        db.rollback()
        raise
