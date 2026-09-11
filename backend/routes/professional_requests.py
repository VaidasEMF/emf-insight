from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import text
from sqlalchemy.orm import Session

from routes.auth import (
    get_current_user,
)

from auth.dependencies import (
    get_db,
)

router = APIRouter()


# =====================
# CREATE PROFESSIONAL REQUEST
# =====================

@router.post("/professional-requests")
def create_professional_request(
    body: dict,
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    # ---------------------------------
    # HOME FULL REPORT ENTITLEMENT
    # ---------------------------------

    entitlement = db.execute(
        text("""
            SELECT full_report_unlocked
            FROM home_entitlements
            WHERE user_id = :user_id
        """),
        {
            "user_id": str(current_user.id),
        },
    ).scalar()

    if entitlement is not True:
        raise HTTPException(
            status_code=403,
            detail="Full EMF Insight Report must be unlocked before requesting a professional assessment.",
        )

    # ---------------------------------
    # REQUEST DATA
    # ---------------------------------

    project_id = body.get("project_id")
    country = body.get("country")
    region = body.get("region")
    city = body.get("city")
    postal_code = body.get("postal_code")

    if not project_id:
        raise HTTPException(
            status_code=400,
            detail="Home project ID is required.",
        )

    # ---------------------------------
    # CHECK EXISTING ACTIVE REQUEST
    # ---------------------------------

    existing_request = db.execute(
        text("""
            SELECT
                id,
                user_id,
                project_id,
                country,
                region,
                city,
                status,
                created_at
            FROM professional_requests
            WHERE user_id = :user_id
              AND project_id = :project_id
              AND status = 'open'
            ORDER BY created_at DESC
            LIMIT 1
        """),
        {
            "user_id": str(current_user.id),
            "project_id": project_id,
        },
    ).mappings().first()

    if existing_request:
        return {
            "id": existing_request["id"],
            "user_id": existing_request["user_id"],
            "project_id": existing_request["project_id"],
            "country": existing_request["country"],
            "region": existing_request["region"],
            "city": existing_request["city"],
            "postal_code": existing_request["postal_code"],
            "status": existing_request["status"],
            "created_at": existing_request["created_at"],
            "already_exists": True,
        }

    # ---------------------------------
    # CREATE REQUEST
    # ---------------------------------

    result = db.execute(
        text("""
            INSERT INTO professional_requests
                (
                   user_id, project_id, country, region, city, postal_code, status
                )
            VALUES
                (
                    :user_id,
                    :project_id,
                    :country,
                    :region,
                    :city,
                    :postal_code,
                    'open'
                )
            RETURNING
                id,
                user_id,
                project_id,
                country,
                region,
                city,
                postal_code,
                status,
                created_at
        """),
        {
            "user_id": str(current_user.id),
            "project_id": project_id,
            "country": country,
            "region": region,
            "city": city,
            "postal_code": postal_code,
        },
    )

    request = result.mappings().one()

    db.commit()

    return {
        "id": request["id"],
        "user_id": request["user_id"],
        "project_id": request["project_id"],
        "country": request["country"],
        "region": request["region"],
        "city": request["city"],
        "postal_code": request["postal_code"],
        "status": request["status"],
        "created_at": request["created_at"],
    }

# =====================
# CHECK PROFESSIONAL AVAILABILITY
# =====================

@router.get("/professional-requests/availability")
def check_professional_availability(
    country_code: str,
    city: str,
    db: Session = Depends(get_db),
):
    professionals = db.execute(
        text("""
            SELECT COUNT(*)
            FROM professional_profiles
            WHERE country_code = :country_code
              AND LOWER(city) = LOWER(:city)
              AND availability_status = 'available'
              AND verification_status = 'verified'
        """),
        {
            "country_code": country_code.strip().upper(),
            "city": city.strip(),
        },
    ).scalar()

    return {
        "available": professionals > 0,
        "count": professionals,
    }

# =====================
# GET CURRENT PROFESSIONAL REQUEST
# =====================

@router.get("/professional-requests")
def get_professional_request(
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    request = db.execute(
        text("""
            SELECT
            id,
            user_id,
            project_id,
            country,
            region,
            city,
            postal_code,
            status,
            created_at
        FROM professional_requests
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            LIMIT 1
        """),
        {
            "user_id": str(current_user.id),
        },
    ).mappings().first()

    if not request:
        return {
            "request": None,
        }

    return {
        "request": {
            "id": request["id"],
            "user_id": request["user_id"],
            "project_id": request["project_id"],
            "country": request["country"],
            "region": request["region"],
            "city": request["city"],
            "postal_code": request["postal_code"],
            "status": request["status"],
            "created_at": request["created_at"],
        }
    }

@router.get("/admin/professional-requests")
def get_admin_professional_requests(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    requests = db.execute(
        text("""
            SELECT
            id,
            user_id,
            project_id,
            country,
            region,
            city,
            postal_code,
            status,
            created_at
        FROM professional_requests
            ORDER BY created_at DESC
        """)
    ).mappings().all()

    return {
        "requests": [
            {
                "id": request["id"],
                "user_id": request["user_id"],
                "project_id": request["project_id"],
                "country": request["country"],
                "region": request["region"],
                "city": request["city"],
                "postal_code": request["postal_code"],
                "status": request["status"],
                "created_at": request["created_at"],
            }
            for request in requests
        ]
    }

@router.patch("/admin/professional-requests/{request_id}")
def update_admin_professional_request(
    request_id: int,
    body: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    status = body.get("status")

    allowed_statuses = {
        "open",
        "contacted",
        "scheduled",
        "completed",
        "closed",
    }

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid professional assessment request status.",
        )

    result = db.execute(
        text("""
            UPDATE professional_requests
            SET status = :status
            WHERE id = :request_id
            RETURNING
            id,
            user_id,
            project_id,
            country,
            region,
            city,
            postal_code,
            status,
            created_at
        """),
        {
            "status": status,
            "request_id": request_id,
        },
    )

    request = result.mappings().first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Professional assessment request not found.",
        )

    db.commit()

    return {
        "id": request["id"],
        "user_id": request["user_id"],
        "project_id": request["project_id"],
        "country": request["country"],
        "region": request["region"],
        "city": request["city"],
        "postal_code": request["postal_code"],
        "status": request["status"],
        "created_at": request["created_at"],
    }