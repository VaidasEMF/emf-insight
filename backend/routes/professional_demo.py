from datetime import datetime, timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException
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


# =====================
# ADMIN — CREATE DEMO LINK
# =====================

@router.post("/admin/create")
def create_professional_demo(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    token = secrets.token_urlsafe(32)

    result = db.execute(
        text(
            """
            INSERT INTO professional_demo_links (
                token,
                status
            )
            VALUES (
                :token,
                'available'
            )
            RETURNING id, token, status, created_at
            """
        ),
        {
            "token": token,
        },
    )

    demo = result.mappings().first()
    db.commit()

    return {
        "id": demo["id"],
        "token": demo["token"],
        "status": demo["status"],
        "created_at": demo["created_at"],
        "demo_url": f"/professional-demo/{demo['token']}",
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
    expires_at = now + timedelta(days=7)

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
