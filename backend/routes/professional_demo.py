from datetime import datetime, timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from db.database import SessionLocal
from models.user import User
from auth.passwords import hash_password
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

        if expires_at is not None and expires_at > now:
            item["days_remaining"] = max(0, (expires_at - now).days)
        else:
            item["days_remaining"] = 0

        item["demo_url"] = f"/professional-demo/{item['token']}"
        item["feedback_status"] = "pending"
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
                duration_days
            )
            VALUES (
                :token,
                'available',
                :duration_days
            )
            RETURNING id, token, status, duration_days, created_at
            """
        ),
        {
            "token": token,
            "duration_days": data.duration_days,
        },
    )

    demo = result.mappings().first()
    db.commit()

    return {
        "id": demo["id"],
        "token": demo["token"],
        "status": demo["status"],
        "duration_days": demo["duration_days"],
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
        if not data.days or data.days < 1 or data.days > 365:
            raise HTTPException(
                status_code=400,
                detail="Extension must be between 1 and 365 days",
            )

        base_date = demo["expires_at"]

        if base_date is None or base_date < now:
            base_date = now

        new_expiry = base_date + timedelta(
            days=data.days
        )

        db.execute(
            text(
                """
                UPDATE professional_demo_links
                SET
                    expires_at = :expires_at,
                    duration_days = duration_days + :days,
                    status = 'active'
                WHERE id = :id
                """
            ),
            {
                "id": demo_id,
                "expires_at": new_expiry,
                "days": data.days,
            },
        )

    elif action == "set_expiry":
        if data.expires_at is None:
            raise HTTPException(
                status_code=400,
                detail="expires_at is required",
            )

        if data.expires_at <= now:
            raise HTTPException(
                status_code=400,
                detail="Expiry must be in the future",
            )

        db.execute(
            text(
                """
                UPDATE professional_demo_links
                SET
                    expires_at = :expires_at,
                    status = 'active'
                WHERE id = :id
                """
            ),
            {
                "id": demo_id,
                "expires_at": data.expires_at,
            },
        )

    elif action == "revoke":
        db.execute(
            text(
                """
                UPDATE professional_demo_links
                SET status = 'revoked'
                WHERE id = :id
                """
            ),
            {
                "id": demo_id,
            },
        )

    elif action == "reactivate":
        days = data.days or demo["duration_days"] or 7

        if days < 1 or days > 365:
            raise HTTPException(
                status_code=400,
                detail="Reactivation must be between 1 and 365 days",
            )

        new_expiry = now + timedelta(days=days)

        db.execute(
            text(
                """
                UPDATE professional_demo_links
                SET
                    status = 'active',
                    expires_at = :expires_at,
                    duration_days = :duration_days
                WHERE id = :id
                """
            ),
            {
                "id": demo_id,
                "expires_at": new_expiry,
                "duration_days": days,
            },
        )

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid Demo management action",
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
                expires_at
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
    }


# =====================
# PUBLIC — ACTIVATE DEMO
# =====================

@router.post("/{token}/activate")
def activate_professional_demo(
    token: str,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    db: Session = Depends(get_db),
):
    demo = db.execute(
        text(
            """
            SELECT
                id,
                status,
                duration_days,
                expires_at
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

    if demo["status"] != "available":
        raise HTTPException(
            status_code=400,
            detail="Demo link is no longer available",
        )

    existing = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    now = datetime.utcnow()
    expires_at = now + timedelta(
        days=demo["duration_days"]
    )

    professional = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        hashed_password=hash_password(password),
        credits=0,
        plan="free",
        role="professional",
    )

    db.add(professional)
    db.flush()

    db.execute(
        text(
            """
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
            """
        ),
        {
            "user_id": str(professional.id),
            "first_name": professional.first_name,
            "last_name": professional.last_name,
            "professional_email": professional.email,
        },
    )

    db.execute(
        text(
            """
            UPDATE professional_demo_links
            SET
                status = 'active',
                user_id = :user_id,
                activated_at = :activated_at,
                expires_at = :expires_at
            WHERE id = :demo_id
              AND status = 'available'
            """
        ),
        {
            "user_id": str(professional.id),
            "activated_at": now,
            "expires_at": expires_at,
            "demo_id": demo["id"],
        },
    )

    db.commit()
    db.refresh(professional)

    access_token = create_access_token(
        {
            "sub": str(professional.id),
        }
    )

    return {
        "message": "Professional Demo activated",
        "access_token": access_token,
        "token_type": "bearer",
        "role": professional.role,
        "demo_status": "active",
        "demo_expires_at": expires_at,
    }
