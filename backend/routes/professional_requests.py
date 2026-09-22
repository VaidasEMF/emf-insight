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
            postal_code,
            requested_service,
            status,
            created_at
            FROM professional_requests
            WHERE user_id = :user_id
            AND project_id = :project_id
            AND status IN (
                'submitted',
                'available',
                'contact_unlocked'
            )
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
            INSERT INTO professional_requests (
                user_id,
                project_id,
                country,
                region,
                city,
                postal_code,
                requested_service,
                status
            )
            VALUES (
                :user_id,
                :project_id,
                :country,
                :region,
                :city,
                :postal_code,
                :requested_service,
                'available'
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
    ).mappings().first()

    db.commit()

    return {
        "id": result["id"],
        "user_id": result["user_id"],
        "project_id": result["project_id"],
        "country": result["country"],
        "region": result["region"],
        "city": result["city"],
        "postal_code": result["postal_code"],
        "requested_service": result["requested_service"],
        "status": result["status"],
        "created_at": result["created_at"],
        "already_exists": False,
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
            WHERE pr.status = 'available'
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


@router.post("/professional-requests/{request_id}/unlock-contact")
def unlock_professional_request_contact(
    request_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if getattr(current_user, "role", None) != "professional":
        raise HTTPException(
            status_code=403,
            detail="Professional account required.",
        )

    profile = db.execute(
        text("""
            SELECT id, verification_status, availability_status
            FROM professional_profiles
            WHERE user_id = :user_id
            LIMIT 1
        """),
        {"user_id": str(current_user.id)},
    ).mappings().first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Professional profile not found.",
        )

    if profile["verification_status"] != "verified":
        raise HTTPException(
            status_code=403,
            detail="Professional verification required.",
        )

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
                requested_service,
                status
            FROM professional_requests
            WHERE id = :request_id
        """),
        {"request_id": request_id},
    ).mappings().first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Professional assessment request not found.",
        )

    if str(request["user_id"]) == str(current_user.id):
        raise HTTPException(
            status_code=400,
            detail="You cannot unlock your own request.",
        )

    if request["status"] != "available":
        raise HTTPException(
            status_code=400,
            detail="This professional request is not available.",
        )

    existing_unlock = db.execute(
        text("""
            SELECT id, unlocked_at
            FROM professional_request_contacts
            WHERE request_id = :request_id
              AND professional_user_id = :professional_user_id
            LIMIT 1
        """),
        {
            "request_id": request_id,
            "professional_user_id": str(current_user.id),
        },
    ).mappings().first()

    if existing_unlock:
        return {
            "status": "contact_unlocked",
            "already_unlocked": True,
            "request_id": request_id,
            "unlocked_at": existing_unlock["unlocked_at"],
        }

    db.execute(
        text("""
            INSERT INTO professional_contact_points (user_id, balance)
            VALUES (:user_id, 0)
            ON CONFLICT (user_id) DO NOTHING
        """),
        {"user_id": str(current_user.id)},
    )

    balance_result = db.execute(
        text("""
            UPDATE professional_contact_points
            SET balance = balance - 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = :user_id
              AND balance >= 1
            RETURNING balance
        """),
        {"user_id": str(current_user.id)},
    ).scalar()

    if balance_result is None:
        db.rollback()

        raise HTTPException(
            status_code=402,
            detail="You need at least 1 Contact Point to unlock this contact.",
        )

    unlock_result = db.execute(
        text("""
            INSERT INTO professional_request_contacts (
                request_id,
                professional_user_id
            )
            VALUES (
                :request_id,
                :professional_user_id
            )
            ON CONFLICT (request_id, professional_user_id)
            DO NOTHING
            RETURNING id, unlocked_at
        """),
        {
            "request_id": request_id,
            "professional_user_id": str(current_user.id),
        },
    ).mappings().first()

    if not unlock_result:
        db.execute(
            text("""
                UPDATE professional_contact_points
                SET balance = balance + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = :user_id
            """),
            {"user_id": str(current_user.id)},
        )

        db.commit()

        existing_unlock = db.execute(
            text("""
                SELECT id, unlocked_at
                FROM professional_request_contacts
                WHERE request_id = :request_id
                  AND professional_user_id = :professional_user_id
                LIMIT 1
            """),
            {
                "request_id": request_id,
                "professional_user_id": str(current_user.id),
            },
        ).mappings().first()

        return {
            "status": "contact_unlocked",
            "already_unlocked": True,
            "request_id": request_id,
            "unlocked_at": (
                existing_unlock["unlocked_at"]
                if existing_unlock
                else None
            ),
        }

    db.execute(
        text("""
            INSERT INTO professional_contact_point_ledger (
                user_id,
                transaction_type,
                amount,
                balance_after,
                reference_type,
                reference_id
            )
            VALUES (
                :user_id,
                'CONTACT_UNLOCK',
                -1,
                :balance_after,
                'professional_request',
                :request_id
            )
        """),
        {
            "user_id": str(current_user.id),
            "balance_after": int(balance_result),
            "request_id": str(request_id),
        },
    )

    db.commit()

    return {
        "status": "contact_unlocked",
        "already_unlocked": False,
        "request_id": request_id,
        "unlocked_at": unlock_result["unlocked_at"],
        "contact_points_remaining": int(balance_result),
    }

@router.get("/professional-requests/mine")
def get_my_professional_requests(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    requests = db.execute(
        text("""
            SELECT
                id,
                project_id,
                country,
                region,
                city,
                postal_code,
                requested_service,
                status,
                created_at
            FROM professional_requests
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        """),
        {
            "user_id": str(current_user.id),
        },
    ).mappings().all()

    return {
        "requests": [
            {
                "id": request["id"],
                "project_id": request["project_id"],
                "country": request["country"],
                "region": request["region"],
                "city": request["city"],
                "postal_code": request["postal_code"],
                "requested_service":
                    request["requested_service"],
                "status": request["status"],
                "created_at": request["created_at"],
            }
            for request in requests
        ]
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
        "available",
        "contact_unlocked",
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
        "requested_service": request["requested_service"],
        "status": request["status"],
        "created_at": request["created_at"],
    }