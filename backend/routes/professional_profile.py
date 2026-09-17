from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from db.database import SessionLocal
from models.user import User
from routes.auth import get_current_user


router = APIRouter(
    prefix="/professional",
    tags=["professional-profile"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ProfessionalProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    company_name: str | None = None
    professional_email: str | None = None
    professional_phone: str | None = None
    phone_country_code: str | None = None
    country_code: str | None = None
    country: str | None = None
    city: str | None = None
    postal_code: str | None = None
    service_areas: list[dict] | None = None


@router.get("/profile")
def get_professional_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "professional" and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Professional account required",
        )

    profile = db.execute(
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
                phone_country_code,
                country_code,
                country,
                city,
                postal_code,
                availability_status,
                verification_status,
                created_at
            FROM professional_profiles
            WHERE user_id = :user_id
            """
        ),
        {"user_id": str(current_user.id)},
    ).mappings().first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Professional profile not found",
        )

    service_areas = db.execute(
        text(
            """
            SELECT
                id,
                country,
                region,
                city,
                postal_code
            FROM professional_service_areas
            WHERE professional_profile_id = :profile_id
            ORDER BY id
            """
        ),
        {"profile_id": profile["id"]},
    ).mappings().all()

    result = dict(profile)
    result["service_areas"] = [dict(area) for area in service_areas]

    return result


@router.patch("/profile")
def update_professional_profile(
    payload: ProfessionalProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "professional" and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Professional account required",
        )

    profile = db.execute(
        text(
            """
            SELECT id
            FROM professional_profiles
            WHERE user_id = :user_id
            """
        ),
        {"user_id": str(current_user.id)},
    ).mappings().first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Professional profile not found",
        )

    service_areas = payload.service_areas

    fields = payload.model_dump(
        exclude_none=True,
        exclude={"service_areas"},
    )

    allowed_fields = {
        "first_name",
        "last_name",
        "company_name",
        "professional_email",
        "professional_phone",
        "phone_country_code",
        "country_code",
        "country",
        "city",
        "postal_code",
    }

    fields = {
        key: value
        for key, value in fields.items()
        if key in allowed_fields
    }

    if fields:
        assignments = ", ".join(
            f"{key} = :{key}"
            for key in fields
        )

        fields["profile_id"] = profile["id"]

        db.execute(
            text(
                f"""
                UPDATE professional_profiles
                SET {assignments}
                WHERE id = :profile_id
                """
            ),
            fields,
        )

    if service_areas is not None:
        db.execute(
            text(
                """
                DELETE FROM professional_service_areas
                WHERE professional_profile_id = :profile_id
                """
            ),
            {"profile_id": profile["id"]},
        )

        for area in service_areas:
            country = str(area.get("country") or "").strip()
            region = str(area.get("region") or "").strip() or None
            city = str(area.get("city") or "").strip() or None
            postal_code = str(area.get("postal_code") or "").strip() or None

            if not country:
                raise HTTPException(
                    status_code=400,
                    detail="Service area country is required",
                )

            if not any([region, city, postal_code]):
                raise HTTPException(
                    status_code=400,
                    detail="Service area must include region, city, or postal code",
                )

            db.execute(
                text(
                    """
                    INSERT INTO professional_service_areas (
                        professional_profile_id,
                        country,
                        region,
                        city,
                        postal_code
                    )
                    VALUES (
                        :profile_id,
                        :country,
                        :region,
                        :city,
                        :postal_code
                    )
                    """
                ),
                {
                    "profile_id": profile["id"],
                    "country": country,
                    "region": region,
                    "city": city,
                    "postal_code": postal_code,
                },
            )

    db.commit()

    return get_professional_profile(
        current_user=current_user,
        db=db,
    )

@router.post("/profile/request-verification")
def request_professional_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "professional":
        raise HTTPException(
            status_code=403,
            detail="Professional account required",
        )

    profile = db.execute(
        text(
            """
            SELECT
                id,
                first_name,
                last_name,
                company_name,
                professional_email,
                professional_phone,
                country,
                city,
                postal_code,
                verification_status
            FROM professional_profiles
            WHERE user_id = :user_id
            """
        ),
        {"user_id": str(current_user.id)},
    ).mappings().first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Professional profile not found",
        )

    if profile["verification_status"] == "verified":
        raise HTTPException(
            status_code=400,
            detail="Professional profile is already verified",
        )

    if profile["verification_status"] == "pending":
        raise HTTPException(
            status_code=400,
            detail="Verification request is already pending",
        )

    required_fields = {
        "first_name": "First name",
        "last_name": "Last name",
        "company_name": "Company",
        "professional_email": "Professional email",
        "professional_phone": "Phone",
        "country": "Country",
        "city": "City / Town",
        "postal_code": "Postal / Postcode",
    }

    missing_fields = [
        label
        for field, label in required_fields.items()
        if not str(profile[field] or "").strip()
    ]

    if missing_fields:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Professional profile is incomplete",
                "missing_fields": missing_fields,
            },
        )

    db.execute(
        text(
            """
            UPDATE professional_profiles
            SET verification_status = 'pending'
            WHERE id = :profile_id
            """
        ),
        {"profile_id": profile["id"]},
    )

    db.commit()

    return get_professional_profile(
        current_user=current_user,
        db=db,
    )
