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
    # PROFESSIONAL ASSESSMENT ELIGIBILITY
    # ---------------------------------
    # A Home professional assessment can be requested only when
    # the Full EMF Insight Report has been purchased for THIS
    # Home Project.
    # ---------------------------------

    project_id = body.get("project_id")

    if not project_id:
        raise HTTPException(
            status_code=400,
            detail="Home project ID is required.",
        )

    # Load the user's Home project
    project = db.execute(
        text("""
            SELECT
                id,
                user_id,
                data
            FROM projects
            WHERE id = :project_id
              AND user_id = :user_id
        """),
        {
            "project_id": project_id,
            "user_id": str(current_user.id),
        },
    ).mappings().first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Home project not found.",
        )

    # Check Premium Report entitlement for THIS Home Project.
    entitlement = db.execute(
        text("""
            SELECT full_report_unlocked
            FROM home_project_entitlements
            WHERE project_id = :project_id
              AND user_id = :user_id
        """),
        {
            "project_id": project_id,
            "user_id": str(current_user.id),
        },
    ).scalar()

    if entitlement is not True:
        raise HTTPException(
            status_code=403,
            detail="Please purchase the Full EMF Insight Report for this Home Project before requesting a professional assessment.",
        )

    # ---------------------------------
    # REQUEST DATA
    # ---------------------------------

    project_id = body.get("project_id")
    country = body.get("country")
    region = body.get("region")
    city = body.get("city")
    postal_code = body.get("postal_code")
    requested_service = body.get("requested_service")

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
                requested_service,
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
            "requested_service": existing_request["requested_service"],
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
                   user_id, project_id, country, region, city, postal_code, requested_service, status
                )
            VALUES
                (
                    :user_id,
                    :project_id,
                    :country,
                    :region,
                    :city,
                    :postal_code,
                    :requested_service,
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
                requested_service,
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
            "requested_service": requested_service,
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
        "requested_service": request["requested_service"],
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
# GET AVAILABLE HOME PROJECTS
# =====================

@router.get("/professional-requests/available")
def get_available_home_projects(
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):
    # ---------------------
    # PROFESSIONAL ELIGIBILITY
    # ---------------------

    if getattr(current_user, "role", None) != "professional":
        raise HTTPException(
            status_code=403,
            detail="Professional account required.",
        )

    credits = int(getattr(current_user, "credits", 0) or 0)

    if credits < 1:
        return {
            "requests": [],
            "locked": True,
            "reason": "Report Credit required.",
        }

    profile = db.execute(
        text("""
            SELECT
                id,
                country,
                city,
                postal_code,
                availability_status,
                verification_status
            FROM professional_profiles
            WHERE user_id = :user_id
            LIMIT 1
        """),
        {
            "user_id": str(current_user.id),
        },
    ).mappings().first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Professional profile not found.",
        )

    if profile["verification_status"] != "verified":
        return {
            "requests": [],
            "locked": False,
            "reason": "Professional verification required.",
        }

    if profile["availability_status"] != "available":
        return {
            "requests": [],
            "locked": False,
            "reason": "Professional availability is not active.",
        }

    # ---------------------
    # AVAILABLE REQUESTS
    # ---------------------

    requests = db.execute(
        text("""
            SELECT
                pr.id,
                pr.project_id,
                pr.country,
                pr.region,
                pr.city,
                pr.postal_code,
                pr.requested_service,
                pr.created_at
            FROM professional_requests pr
            WHERE pr.status = 'open'
            AND pr.user_id != :user_id
            AND EXISTS (
                SELECT 1
                FROM home_project_entitlements hpe
                WHERE hpe.project_id = pr.project_id
                    AND hpe.user_id = pr.user_id
                    AND hpe.full_report_unlocked = TRUE
            )
            AND (
                (
                    pr.country IS NOT NULL
                    AND :profile_country IS NOT NULL
                    AND LOWER(pr.country) =
                        LOWER(:profile_country)
                    AND (
                        (
                            pr.city IS NOT NULL
                            AND :profile_city IS NOT NULL
                            AND LOWER(pr.city) =
                                LOWER(:profile_city)
                        )
                        OR
                        (
                            pr.postal_code IS NOT NULL
                            AND :profile_postal_code IS NOT NULL
                            AND LOWER(pr.postal_code) =
                                LOWER(:profile_postal_code)
                        )
                    )
                )
                OR EXISTS (
                    SELECT 1
                    FROM professional_service_areas psa
                    WHERE psa.professional_profile_id = :profile_id
                        AND psa.country IS NOT NULL
                        AND pr.country IS NOT NULL
                        AND LOWER(psa.country) =
                            LOWER(pr.country)
                        AND (
                            (
                                psa.city IS NOT NULL
                                AND pr.city IS NOT NULL
                                AND LOWER(psa.city) =
                                    LOWER(pr.city)
                            )
                            OR (
                                psa.region IS NOT NULL
                                AND pr.region IS NOT NULL
                                AND LOWER(psa.region) =
                                    LOWER(pr.region)
                            )
                            OR (
                                psa.postal_code IS NOT NULL
                                AND pr.postal_code IS NOT NULL
                                AND LOWER(psa.postal_code) =
                                    LOWER(pr.postal_code)
                            )
                        )
                )
            )
            ORDER BY pr.created_at DESC
        """),
        {
            "user_id": str(current_user.id),
            "profile_id": profile["id"],
            "profile_country": profile["country"],
            "profile_city": profile["city"],
            "profile_postal_code": profile["postal_code"],
        },
    ).mappings().all()

    return {
        "requests": [
            {
                "request_id": request["id"],
                "project_id": request["project_id"],
                "country": request["country"],
                "region": request["region"],
                "city": request["city"],
                "postal_code": request["postal_code"],
                "requested_service": request["requested_service"],
                "created_at": request["created_at"],
            }
            for request in requests
        ],
        "locked": False,
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
            "requested_service": request["requested_service"],
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
            requested_service,
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
                "requested_service": request["requested_service"],
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