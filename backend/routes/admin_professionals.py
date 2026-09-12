from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from db.database import SessionLocal
from models.user import User
from routes.auth import get_current_user


router = APIRouter(
    prefix="/admin",
    tags=["admin-professionals"],
)


# =====================
# DATABASE
# =====================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =====================
# ADMIN AUTH
# =====================

def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:

    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user


# =====================
# REQUEST MODEL
# =====================

class ProfessionalUpdate(BaseModel):
    user_id: str | None = None

    first_name: str | None = None
    last_name: str | None = None
    company_name: str | None = None

    professional_email: str | None = None
    professional_phone: str | None = None

    country_code: str | None = None
    country: str | None = None
    city: str | None = None
    postal_code: str | None = None

    availability_status: str | None = None
    verification_status: str | None = None


# =====================
# LIST PROFESSIONALS
# =====================

@router.get("/professionals")
def get_professionals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    rows = db.execute(
        text(
            """
            SELECT
                id,
                user_id,
                first_name,
                last_name,
                company_name,
                professional_email,
                professional_phone,
                country_code,
                country,
                city,
                postal_code,
                availability_status,
                verification_status,
                created_at
            FROM professional_profiles
            ORDER BY
                last_name NULLS LAST,
                first_name NULLS LAST,
                id
            """
        )
    ).mappings().all()

    return [dict(row) for row in rows]


# =====================
# GET ONE PROFESSIONAL
# =====================

@router.get("/professionals/{professional_id}")
def get_professional(
    professional_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    row = db.execute(
        text(
            """
            SELECT
                id,
                user_id,
                first_name,
                last_name,
                company_name,
                professional_email,
                professional_phone,
                country_code,
                country,
                city,
                postal_code,
                availability_status,
                verification_status,
                created_at
            FROM professional_profiles
            WHERE id = :id
            """
        ),
        {
            "id": professional_id,
        },
    ).mappings().first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Professional not found",
        )

    return dict(row)


# =====================
# CREATE PROFESSIONAL
# =====================

@router.post("/professionals")
def create_professional(
    data: ProfessionalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    if not data.user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID is required",
        )

    existing = db.execute(
        text(
            """
            SELECT id
            FROM professional_profiles
            WHERE user_id = :user_id
            """
        ),
        {
            "user_id": data.user_id,
        },
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="A professional profile already exists for this user",
        )

    result = db.execute(
        text(
            """
            INSERT INTO professional_profiles (
                user_id,
                first_name,
                last_name,
                company_name,
                professional_email,
                professional_phone,
                country_code,
                country,
                city,
                postal_code,
                availability_status,
                verification_status
            )
            VALUES (
                :user_id,
                :first_name,
                :last_name,
                :company_name,
                :professional_email,
                :professional_phone,
                :country_code,
                :country,
                :city,
                :postal_code,
                :availability_status,
                :verification_status
            )
            RETURNING
                id,
                user_id,
                first_name,
                last_name,
                company_name,
                professional_email,
                professional_phone,
                country_code,
                country,
                city,
                postal_code,
                availability_status,
                verification_status,
                created_at
            """
        ),
        {
            "user_id": data.user_id,
            "first_name": data.first_name,
            "last_name": data.last_name,
            "company_name": data.company_name,
            "professional_email": data.professional_email,
            "professional_phone": data.professional_phone,
            "country_code": data.country_code,
            "country": data.country,
            "city": data.city,
            "postal_code": data.postal_code,
            "availability_status": (
                data.availability_status
                or "unavailable"
            ),
            "verification_status": (
                data.verification_status
                or "pending"
            ),
        },
    ).mappings().first()

    db.commit()

    return dict(result)


# =====================
# UPDATE PROFESSIONAL
# =====================

@router.patch("/professionals/{professional_id}")
def update_professional(
    professional_id: int,
    data: ProfessionalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    existing = db.execute(
        text(
            """
            SELECT id
            FROM professional_profiles
            WHERE id = :id
            """
        ),
        {
            "id": professional_id,
        },
    ).first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Professional not found",
        )

    allowed_availability = {
        "available",
        "limited",
        "unavailable",
    }

    allowed_verification = {
        "pending",
        "verified",
        "suspended",
    }

    if (
        data.availability_status is not None
        and data.availability_status
        not in allowed_availability
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid availability status",
        )

    if (
        data.verification_status is not None
        and data.verification_status
        not in allowed_verification
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid verification status",
        )

    fields = []
    params = {
        "id": professional_id,
    }

    values = {
        "user_id": data.user_id,
        "first_name": data.first_name,
        "last_name": data.last_name,
        "company_name": data.company_name,
        "professional_email": data.professional_email,
        "professional_phone": data.professional_phone,
        "country_code": data.country_code,
        "country": data.country,
        "city": data.city,
        "postal_code": data.postal_code,
        "availability_status": data.availability_status,
        "verification_status": data.verification_status,
    }

    for field, value in values.items():

        if value is None:
            continue

        fields.append(
            f"{field} = :{field}"
        )

        params[field] = value

    if not fields:
        raise HTTPException(
            status_code=400,
            detail="No fields to update",
        )

    result = db.execute(
        text(
            f"""
            UPDATE professional_profiles
            SET
                {", ".join(fields)}
            WHERE id = :id
            RETURNING
                id,
                user_id,
                first_name,
                last_name,
                company_name,
                professional_email,
                professional_phone,
                country_code,
                country,
                city,
                postal_code,
                availability_status,
                verification_status,
                created_at
            """
        ),
        params,
    ).mappings().first()

    db.commit()

    return dict(result)
# =====================
# SET USER ROLE
# =====================

@router.patch("/user-role")
def set_user_role(
    email: str,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if role not in {"user", "professional"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid role",
        )

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.role = role

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "is_admin": user.is_admin,
    }
