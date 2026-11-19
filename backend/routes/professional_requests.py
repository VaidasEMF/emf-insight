from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Body,
)

from sqlalchemy import text
from sqlalchemy.orm import Session

from routes.auth import (
    get_current_user,
)

from auth.dependencies import (
    get_db,
)

from services.notification_service import create_notification

from services.professional_assessment_access import (
    get_professional_assessment_access,
    require_active_edit,
    ACTIVE_EDIT,
    FROZEN_READ_ONLY,
)

import uuid

from sqlalchemy.exc import IntegrityError

from models.assessment import Assessment
from models.project import Project
from models.property import Property
from models.property_health_record import PropertyHealthRecord

from fastapi.responses import StreamingResponse
from io import BytesIO
from pathlib import Path

from storage import supabase

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

    create_notification(
        db=db,
        user_id=current_user.id,
        title="Professional assessment request submitted",
        message="Your professional assessment request has been submitted successfully.",
        notification_type="assessment",
        source_workspace="home",
        action_label="View Request Status",
        action_url="dashboard.html#home-professional-requests",
    )

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
            pr.created_at,
            pr.status,

            EXISTS (
                SELECT 1
                FROM professional_request_contacts prc
                WHERE prc.request_id = pr.id
                  AND prc.expires_at > CURRENT_TIMESTAMP
            ) AS has_active_unlock,

            EXISTS (
                SELECT 1
                FROM professional_request_contacts prc
                WHERE prc.request_id = pr.id
                  AND prc.professional_user_id = :user_id
                  AND prc.expires_at > CURRENT_TIMESTAMP
            ) AS unlocked_by_me,

            (
                SELECT prc.expires_at
                FROM professional_request_contacts prc
                WHERE prc.request_id = pr.id
                  AND prc.professional_user_id = :user_id
                  AND prc.expires_at > CURRENT_TIMESTAMP
                ORDER BY prc.expires_at DESC
                LIMIT 1
            ) AS contact_expires_at,

            (
                SELECT prcf.contact_preference
                FROM professional_request_contact_feedback prcf
                WHERE prcf.request_id = pr.id
                LIMIT 1
            ) AS contact_preference,

            (
                SELECT prcf.contact_status
                FROM professional_request_contact_feedback prcf
                WHERE prcf.request_id = pr.id
                LIMIT 1
            ) AS contact_status,

            (
                SELECT u.email
                FROM users u
                WHERE u.id::text = pr.user_id
                  AND EXISTS (
                      SELECT 1
                      FROM professional_request_contacts prc
                      WHERE prc.request_id = pr.id
                        AND prc.professional_user_id = :user_id
                        AND prc.expires_at > CURRENT_TIMESTAMP
                  )
                LIMIT 1
            ) AS contact_email

        FROM professional_requests pr
        WHERE pr.user_id != :user_id

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
                        OR
                        (
                            psa.region IS NOT NULL
                            AND pr.region IS NOT NULL
                            AND LOWER(psa.region) =
                                LOWER(pr.region)
                        )
                        OR
                        (
                            psa.postal_code IS NOT NULL
                            AND pr.postal_code IS NOT NULL
                            AND LOWER(psa.postal_code) =
                                LOWER(pr.postal_code)
                        )
                    )
            )
        )

        AND (
            pr.status = 'available'

            OR

            (
                pr.status = 'contact_unlocked'
                AND EXISTS (
                    SELECT 1
                    FROM professional_request_contacts prc
                    WHERE prc.request_id = pr.id
                        AND prc.professional_user_id = :user_id
                        AND prc.expires_at > CURRENT_TIMESTAMP
                )
            )

            OR

            (
                pr.status = 'contact_unlocked'
                AND NOT EXISTS (
                    SELECT 1
                    FROM professional_request_contacts prc
                    WHERE prc.request_id = pr.id
                        AND prc.expires_at > CURRENT_TIMESTAMP
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
                "status": (
                    "contact_unlocked"
                    if request["unlocked_by_me"]
                    else "available"
                ),
                "has_active_unlock": bool(
                    request["has_active_unlock"]
                ),
                "unlocked_by_me": bool(
                    request["unlocked_by_me"]
                ),


                "contact_expires_at": request["contact_expires_at"],
                "contact_preference": request["contact_preference"],
                "contact_status": request["contact_status"],

                "contact": {
                    "email": request["contact_email"]
                } if request["contact_email"] else None,
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
            SELECT
                id,
                verification_status,
                availability_status
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

    if profile["availability_status"] != "available":
        raise HTTPException(
            status_code=403,
            detail="Professional must be available to unlock contacts.",
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
            LIMIT 1
            FOR UPDATE
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

    # ---------------------------------------------------------
    # Check for an existing active unlock for this professional
    # ---------------------------------------------------------
    existing_unlock = db.execute(
        text("""
            SELECT
                id,
                unlocked_at,
                expires_at,
                duration_days
            FROM professional_request_contacts
            WHERE request_id = :request_id
              AND professional_user_id = :professional_user_id
              AND expires_at > CURRENT_TIMESTAMP
            ORDER BY expires_at DESC
            LIMIT 1
        """),
        {
            "request_id": request_id,
            "professional_user_id": str(current_user.id),
        },
    ).mappings().first()

    if existing_unlock:
        contact_user = db.execute(
            text("""
                SELECT
                    id,
                    first_name,
                    last_name,
                    email
                FROM users
                WHERE id = :user_id
                LIMIT 1
            """),
            {"user_id": str(request["user_id"])},
        ).mappings().first()

        if not contact_user:
            raise HTTPException(
                status_code=404,
                detail="Home user account not found.",
            )

        return {
            "status": "contact_unlocked",
            "already_unlocked": True,
            "request_id": request_id,
            "unlocked_at": existing_unlock["unlocked_at"],
            "expires_at": existing_unlock["expires_at"],
            "duration_days": existing_unlock["duration_days"],
            "contact_opportunities_spent": 0,
            "contact": {
                "first_name": contact_user["first_name"],
                "last_name": contact_user["last_name"],
                "email": contact_user["email"],
            },
        }

    # ---------------------------------------------------------
    # Request must be available for a NEW unlock
    # ---------------------------------------------------------
    if request["status"] not in ("available", "contact_unlocked"):
        raise HTTPException(
            status_code=400,
            detail="This professional request is not available.",
        )

    # ---------------------------------------------------------
    # Read current Admin-configured unlock duration
    # ---------------------------------------------------------
    duration_setting = db.execute(
        text("""
            SELECT setting_value
            FROM platform_settings
            WHERE setting_key = 'professional_contact_unlock_days'
            LIMIT 1
        """)
    ).scalar()

    try:
        duration_days = int(duration_setting or 14)
    except (TypeError, ValueError):
        duration_days = 14

    if duration_days < 1:
        duration_days = 14


    # ---------------------------------------------------------
    # Atomically spend 1 Contact Opportunity
    # ---------------------------------------------------------
    opportunity_result = db.execute(
        text("""
            UPDATE professional_entitlements
            SET
                contact_opportunities_used =
                    contact_opportunities_used + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = :user_id
              AND plan_code = 'professional'
              AND status = 'active'
              AND contact_opportunities_used < contact_opportunity_limit
            RETURNING
                contact_opportunity_limit,
                contact_opportunities_used
        """),
        {"user_id": str(current_user.id)},
    ).mappings().first()


    if opportunity_result is None:
        db.rollback()

        raise HTTPException(
            status_code=402,
            detail="You need at least 1 Contact Opportunity to unlock this contact.",
        )

    # ---------------------------------------------------------
    # Create a new historical unlock
    # ---------------------------------------------------------
    unlock_result = db.execute(
        text("""
            INSERT INTO professional_request_contacts (
                request_id,
                professional_user_id,
                unlocked_at,
                expires_at,
                duration_days
            )
            VALUES (
                :request_id,
                :professional_user_id,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP + (:duration_days * INTERVAL '1 day'),
                :duration_days
            )
            RETURNING
                id,
                unlocked_at,
                expires_at,
                duration_days
        """),
        {
            "request_id": request_id,
            "professional_user_id": str(current_user.id),
            "duration_days": duration_days,
        },
    ).mappings().first()

    if not unlock_result:
        db.execute(
            text("""
                UPDATE professional_entitlements
                SET
                    contact_opportunities_used =
                        GREATEST(contact_opportunities_used - 1, 0),
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = :user_id
            """),
            {"user_id": str(current_user.id)},
        )

        db.commit()

        raise HTTPException(
            status_code=500,
            detail="Unable to unlock professional contact.",
        )

    # ---------------------------------------------------------
    # Mark request as temporarily contact_unlocked
    # ---------------------------------------------------------
    db.execute(
        text("""
            UPDATE professional_requests
            SET status = 'contact_unlocked'
            WHERE id = :request_id
        """),
        {"request_id": request_id},
    )

    # ---------------------------------------------------------
    # Record Contact Opportunity transaction
    # ---------------------------------------------------------
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
            "balance_after": int(
                opportunity_result["contact_opportunity_limit"]
                - opportunity_result["contact_opportunities_used"]
            ),
            "request_id": str(request_id),
        },
    )

    # ---------------------------------------------------------
    # Load Home user's contact information
    # ---------------------------------------------------------
    contact_user = db.execute(
        text("""
            SELECT
                id,
                first_name,
                last_name,
                email
            FROM users
            WHERE id = :user_id
            LIMIT 1
        """),
        {"user_id": str(request["user_id"])},
    ).mappings().first()

    if not contact_user:
        db.rollback()

        raise HTTPException(
            status_code=404,
            detail="Home user account not found.",
        )

    db.commit()

    return {
        "status": "contact_unlocked",
        "already_unlocked": False,
        "request_id": request_id,
        "unlocked_at": unlock_result["unlocked_at"],
        "expires_at": unlock_result["expires_at"],
        "duration_days": unlock_result["duration_days"],
        "contact_opportunities_spent": 1,
        "contact_opportunities_remaining": int(
            opportunity_result["contact_opportunity_limit"]
            - opportunity_result["contact_opportunities_used"]
        ),
        "contact": {
            "first_name": contact_user["first_name"],
            "last_name": contact_user["last_name"],
            "email": contact_user["email"],
        },
    }

# =========================================================
# GET UNLOCKED HOME PROJECT
# =========================================================

@router.get("/professional-requests/{request_id}/project")
def get_unlocked_home_project(
    request_id: int,
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    # -----------------------------------------------------
    # PROFESSIONAL ACCOUNT REQUIRED
    # -----------------------------------------------------

    if getattr(current_user, "role", None) != "professional":
        raise HTTPException(
            status_code=403,
            detail="Professional account required.",
        )

    # -----------------------------------------------------
    # FIND REQUEST
    # -----------------------------------------------------

    request = db.execute(
        text("""
            SELECT
                id,
                user_id,
                project_id,
                status
            FROM professional_requests
            WHERE id = :request_id
            LIMIT 1
        """),
        {
            "request_id": request_id,
        },
    ).mappings().first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Professional assessment request not found.",
        )
    # -----------------------------------------------------
    # VERIFY ACTIVE CONTACT UNLOCK
    # -----------------------------------------------------

    unlock = db.execute(
        text("""
            SELECT
                id,
                unlocked_at,
                expires_at,
                duration_days
            FROM professional_request_contacts
            WHERE request_id = :request_id
              AND professional_user_id = :professional_user_id
              AND expires_at > CURRENT_TIMESTAMP
            ORDER BY expires_at DESC
            LIMIT 1
        """),
        {
            "request_id": request_id,
            "professional_user_id": str(current_user.id),
        },
    ).mappings().first()

    if not unlock:
        raise HTTPException(
            status_code=403,
            detail="Active contact unlock required to access this Home project.",
        )

    # -----------------------------------------------------
    # LOAD THE ORIGINAL HOME PROJECT
    # -----------------------------------------------------

    project = db.execute(
        text("""
            SELECT
                id,
                user_id,
                data
            FROM projects
            WHERE id = :project_id
              AND user_id = :user_id
            LIMIT 1
        """),
        {
            "project_id": request["project_id"],
            "user_id": str(request["user_id"]),
        },
    ).mappings().first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Home project not found.",
        )

    # -----------------------------------------------------
    # RETURN ORIGINAL HOME PROJECT
    # -----------------------------------------------------

    return {
        "success": True,
        "request_id": request["id"],
        "project_id": project["id"],
        "project_owner_id": project["user_id"],
        "request_status": request["status"],
        "unlock": {
            "unlocked_at": unlock["unlocked_at"],
            "expires_at": unlock["expires_at"],
            "duration_days": unlock["duration_days"],
        },
        "project": {
            "id": project["id"],
            "data": project["data"],
        },
    }

# =========================================================
# CREATE OR GET PROFESSIONAL ASSESSMENT
# =========================================================

def create_or_get_professional_assessment(
    request_id: int,
    assessment_id: int | None = None,
    create_new: bool = False,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # PROFESSIONAL ACCOUNT REQUIRED
    # -----------------------------------------------------

    if getattr(current_user, "role", None) != "professional":
        raise HTTPException(
            status_code=403,
            detail="Professional account required.",
        )

    # -----------------------------------------------------
    # FIND REQUEST
    # -----------------------------------------------------

    request = db.execute(
        text("""
            SELECT
                id,
                user_id,
                project_id,
                status
            FROM professional_requests
            WHERE id = :request_id
            LIMIT 1
        """),
        {"request_id": request_id},
    ).mappings().first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Professional assessment request not found.",
        )

    # -----------------------------------------------------
    # VALIDATE ASSESSMENT OPENING PARAMETERS
    # -----------------------------------------------------

    if assessment_id is not None and create_new:
        raise HTTPException(
            status_code=400,
            detail="Specify either assessment_id or create_new, not both.",
        )

    if assessment_id is None and not create_new:
        raise HTTPException(
            status_code=400,
            detail="Assessment ID or create_new flag is required.",
        )

    # -----------------------------------------------------
    # FROZEN DRAFT — OPEN WITHOUT HOME PROJECT ACCESS
    # -----------------------------------------------------

    if assessment_id is not None:

        frozen_access = get_professional_assessment_access(
            db=db,
            current_user=current_user,
            assessment_id=assessment_id,
        )

        frozen_assessment = frozen_access["assessment"]

        if frozen_assessment.professional_request_id != request_id:
            raise HTTPException(
                status_code=404,
                detail="Professional Assessment not found.",
            )

        if frozen_access["access_mode"] == FROZEN_READ_ONLY:

            client_project = frozen_access["client_project"]
            client_project_data = client_project.data or {}

            return {
                "success": True,
                "created": False,
                "access_mode": FROZEN_READ_ONLY,
                "assessment": {
                    "id": frozen_assessment.id,
                    "assessment_uid": frozen_assessment.assessment_uid,
                    "display_reference": frozen_assessment.display_reference,
                    "property_reference": client_project_data.get(
                        "propertyReference"
                    ),
                    "assessment_type": frozen_assessment.assessment_type,
                    "status": frozen_assessment.status,
                    "property_id": frozen_assessment.property_id,
                    "property_health_record_id": (
                        frozen_assessment.property_health_record_id
                    ),
                    "project_id": frozen_assessment.project_id,
                    "professional_request_id": (
                        frozen_assessment.professional_request_id
                    ),
                    "client_project_id": client_project.id,
                },
            }

    # -----------------------------------------------------
    # VERIFY ACTIVE CONTACT UNLOCK
    # -----------------------------------------------------

    unlock = db.execute(
        text("""
            SELECT id
            FROM professional_request_contacts
            WHERE request_id = :request_id
              AND professional_user_id = :professional_user_id
              AND expires_at > CURRENT_TIMESTAMP
            ORDER BY expires_at DESC
            LIMIT 1
        """),
        {
            "request_id": request_id,
            "professional_user_id": str(current_user.id),
        },
    ).mappings().first()

    if not unlock:
        raise HTTPException(
            status_code=403,
            detail="Active contact unlock required.",
        )

    # -----------------------------------------------------
    # LOAD ORIGINAL CLIENT HOME PROJECT
    # -----------------------------------------------------

    project = db.execute(
        text("""
            SELECT
                id,
                user_id,
                data
            FROM projects
            WHERE id = :project_id
              AND user_id = :user_id
            LIMIT 1
        """),
        {
            "project_id": request["project_id"],
            "user_id": str(request["user_id"]),
        },
    ).mappings().first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Home project not found.",
        )

    project_data = project["data"] or {}

    if (
        not isinstance(project_data, dict)
        or project_data.get("type") != "home"
    ):
        raise HTTPException(
            status_code=400,
            detail="The requested project is not a Home project.",
        )

    # -----------------------------------------------------
    # RESOLVE CLIENT PROPERTY
    # -----------------------------------------------------

    property_uid = project_data.get("propertyId")
    phr_uid = project_data.get("propertyHealthRecordId")

    if not property_uid or not phr_uid:
        raise HTTPException(
            status_code=409,
            detail="Home project is missing its Property or PHR reference.",
        )

    property_record = (
        db.query(Property)
        .filter(Property.property_uid == property_uid)
        .first()
    )

    if not property_record:
        raise HTTPException(
            status_code=404,
            detail="Client Property not found.",
        )

    if str(property_record.owner_user_id) != str(request["user_id"]):
        raise HTTPException(
            status_code=403,
            detail="Property ownership verification failed.",
        )

    # -----------------------------------------------------
    # RESOLVE EXISTING PROPERTY HEALTH RECORD
    # -----------------------------------------------------

    health_record = (
        db.query(PropertyHealthRecord)
        .filter(
            PropertyHealthRecord.property_id == property_record.id
        )
        .first()
    )

    if not health_record:
        raise HTTPException(
            status_code=404,
            detail="Property Health Record not found.",
        )

    if health_record.phr_uid != phr_uid:
        raise HTTPException(
            status_code=409,
            detail="Property Health Record reference mismatch.",
        )

    # -----------------------------------------------------
    # LOCK PROPERTY FOR SEQUENTIAL ASSESSMENT NUMBERING
    # -----------------------------------------------------

    property_record = (
        db.query(Property)
        .filter(Property.id == property_record.id)
        .with_for_update()
        .first()
    )

    if not property_record:
        raise HTTPException(
            status_code=404,
            detail="Client Property not found.",
        )

    if not property_record.property_reference:
        raise HTTPException(
            status_code=409,
            detail="Property reference number is missing.",
        )


    def generate_client_project_name(home_project_id, home_project_name):
        base_name = home_project_name or "Client Property"

        existing_names = (
            db.query(Project.name)
            .join(
                Assessment,
                Assessment.client_project_id == Project.id
            )
            .filter(
                Assessment.project_id == home_project_id,
                Assessment.professional_user_id == str(current_user.id),
            )
            .all()
        )

        max_number = 0
        prefix = f"{base_name} ("

        for (name,) in existing_names:
            if not isinstance(name, str):
                continue

            if name.startswith(prefix) and name.endswith(")"):
                number_text = name[len(prefix):-1]

                if number_text.isdigit():
                    max_number = max(max_number, int(number_text))

        return f"{base_name} ({max_number + 1})"


    # -----------------------------------------------------
    # OPEN EXISTING OR CREATE NEW ASSESSMENT
    # -----------------------------------------------------


    existing_assessment = None

    if assessment_id is not None:
        existing_assessment = (
            db.query(Assessment)
            .filter(
                Assessment.id == assessment_id,
                Assessment.professional_request_id == request_id,
                Assessment.professional_user_id == str(current_user.id),
            )
            .first()
        )

        if not existing_assessment:
            raise HTTPException(
                status_code=404,
                detail="Professional Assessment not found or access denied.",
            )

    if existing_assessment:

        if (
            existing_assessment.property_id != property_record.id
            or existing_assessment.property_health_record_id != health_record.id
            or existing_assessment.project_id != project["id"]
            or existing_assessment.assessment_type != "professional"
        ):
            raise HTTPException(
                status_code=409,
                detail="Existing Professional Assessment has inconsistent Property references.",
            )

        # Ensure this Assessment has its own Client Project
        if not existing_assessment.client_project_id:

            home_project_data = project["data"] or {}

            client_project_name = generate_client_project_name(
                existing_assessment.project_id,
                home_project_data.get("name") or "Client Property"
            )

            client_project_data = {
                **(home_project_data or {}),
                "type": "business",
                "projectType": "business",
                "name": client_project_name,
                "assessmentContext": "professional",
                "assessmentId": existing_assessment.assessment_uid,
                "assessmentDatabaseId": existing_assessment.id,
                "assessmentReference": existing_assessment.display_reference,
                "professionalRequestId": request_id,
                "professionalUserId": str(current_user.id),
                "clientHomeProjectId": project["id"],
                "propertyId": home_project_data.get("propertyId"),
                "propertyHealthRecordId": home_project_data.get(
                    "propertyHealthRecordId"
                ),
                "propertyReference": property_record.property_reference,
            }

            client_project = Project(
                name=client_project_name,
                data=client_project_data,
                user_id=current_user.id,
            )

            db.add(client_project)
            db.flush()

            existing_assessment.client_project_id = client_project.id

            db.commit()
            db.refresh(existing_assessment)

        return {
            "success": True,
            "created": False,
            "assessment": {
                "id": existing_assessment.id,
                "assessment_uid": existing_assessment.assessment_uid,
                "display_reference": existing_assessment.display_reference,
                "property_reference": property_record.property_reference,
                "assessment_type": existing_assessment.assessment_type,
                "status": existing_assessment.status,
                "property_id": existing_assessment.property_id,
                "property_health_record_id": existing_assessment.property_health_record_id,
                "project_id": existing_assessment.project_id,
                "professional_request_id": existing_assessment.professional_request_id,
            },
        }

    # -----------------------------------------------------
    # GENERATE PROPERTY-BASED ASSESSMENT REFERENCE
    # -----------------------------------------------------

    existing_assessment_count = (
        db.query(Assessment)
        .filter(
            Assessment.property_id == property_record.id,
            Assessment.assessment_type == "professional",
        )
        .count()
    )

    display_reference = (
        f"{property_record.property_reference}-"
        f"{existing_assessment_count + 1}"
    )

    # -----------------------------------------------------
    # CREATE PROFESSIONAL ASSESSMENT
    # -----------------------------------------------------

        # -----------------------------------------------------
    # CREATE PROFESSIONAL ASSESSMENT
    # -----------------------------------------------------

    home_project_data = project["data"] or {}

    client_project_name = generate_client_project_name(
        project["id"],
        home_project_data.get("name") or "Client Property"
    )

    assessment = Assessment(
        assessment_uid=f"professional_assessment_{uuid.uuid4().hex}",
        display_reference=display_reference,
        property_id=property_record.id,
        property_health_record_id=health_record.id,
        project_id=project["id"],
        professional_request_id=request_id,
        professional_request_contact_id=unlock["id"],
        professional_user_id=str(current_user.id),
        assessment_type="professional",
        status="draft",
        assessment_data={},
    )

    db.add(assessment)
    db.flush()

    # -----------------------------------------------------
    # CREATE INDEPENDENT CLIENT PROJECT
    # -----------------------------------------------------

    client_project_data = {
        **(home_project_data or {}),
        "type": "business",
        "projectType": "business",
        "name": client_project_name,
        "assessmentContext": "professional",
        "assessmentId": assessment.assessment_uid,
        "assessmentDatabaseId": assessment.id,
        "assessmentReference": display_reference,
        "professionalRequestId": request_id,
        "professionalUserId": str(current_user.id),
        "clientHomeProjectId": project["id"],
        "propertyId": home_project_data.get("propertyId"),
        "propertyHealthRecordId": home_project_data.get(
            "propertyHealthRecordId"
        ),
        "propertyReference": property_record.property_reference,
    }

    client_project = Project(
        name=client_project_name,
        data=client_project_data,
        user_id=current_user.id,
    )

    db.add(client_project)
    db.flush()

    # Set canonical identity of the new Professional Project
    assessment.client_project_id = client_project.id

    client_project_data["id"] = client_project.id
    client_project_data["project_id"] = client_project.id

    client_project.data = client_project_data

    db.add(assessment)

    try:
        db.commit()
        db.refresh(assessment)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "Unable to create a new Professional Assessment "
                "because a database integrity conflict occurred. "
                "Please retry."
            ),
        ) from exc

    # -----------------------------------------------------
    # RETURN CREATED ASSESSMENT
    # -----------------------------------------------------

    return {
        "success": True,
        "created": True,
        "assessment": {
            "id": assessment.id,
            "assessment_uid": assessment.assessment_uid,
            "display_reference": assessment.display_reference,
            "property_reference": property_record.property_reference,
            "assessment_type": assessment.assessment_type,
            "status": assessment.status,
            "property_id": assessment.property_id,
            "property_health_record_id": assessment.property_health_record_id,
            "project_id": assessment.project_id,
            "professional_request_id": assessment.professional_request_id,
        },
    }


# =====================================================
# CREATE OR OPEN PROFESSIONAL ASSESSMENT API
# =====================================================

@router.post("/professional-requests/{request_id}/assessment")
def create_or_open_professional_assessment_api(
    request_id: int,
    assessment_id: int | None = None,
    create_new: bool = False,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_or_get_professional_assessment(
        request_id=request_id,
        assessment_id=assessment_id,
        create_new=create_new,
        current_user=current_user,
        db=db,
    )

# =====================================================
# PROFESSIONAL ASSESSMENT DATA ACCESS
# =====================================================

def get_authorized_professional_assessment(
    request_id: int,
    assessment_id: int,
    current_user,
    db: Session,
):
    # -------------------------------------------------
    # PROFESSIONAL ACCOUNT REQUIRED
    # -------------------------------------------------

    if getattr(current_user, "role", None) != "professional":
        raise HTTPException(
            status_code=403,
            detail="Professional account required.",
        )

    # -------------------------------------------------
    # FIND REQUEST
    # -------------------------------------------------

    request = db.execute(
        text("""
            SELECT id, user_id, project_id
            FROM professional_requests
            WHERE id = :request_id
            LIMIT 1
        """),
        {"request_id": request_id},
    ).mappings().first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Professional request not found.",
        )

    # -------------------------------------------------
    # VERIFY THIS PROFESSIONAL'S ACTIVE UNLOCK
    # -------------------------------------------------

    unlock = db.execute(
        text("""
            SELECT id
            FROM professional_request_contacts
            WHERE request_id = :request_id
              AND professional_user_id = :professional_user_id
              AND expires_at > CURRENT_TIMESTAMP
            ORDER BY expires_at DESC
            LIMIT 1
        """),
        {
            "request_id": request_id,
            "professional_user_id": str(current_user.id),
        },
    ).mappings().first()

    if not unlock:
        raise HTTPException(
            status_code=403,
            detail="Active contact unlock required.",
        )

    # -------------------------------------------------
    # VERIFY ORIGINAL CLIENT PROJECT
    # -------------------------------------------------

    project = db.execute(
        text("""
            SELECT id, user_id, data
            FROM projects
            WHERE id = :project_id
              AND user_id = :user_id
            LIMIT 1
        """),
        {
            "project_id": request["project_id"],
            "user_id": str(request["user_id"]),
        },
    ).mappings().first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Client Home project not found.",
        )

    project_data = project["data"] or {}

    if (
        not isinstance(project_data, dict)
        or project_data.get("type") != "home"
    ):
        raise HTTPException(
            status_code=409,
            detail="Client project is not a Home project.",
        )

    # -------------------------------------------------
    # VERIFY PROPERTY REFERENCES
    # -------------------------------------------------

    property_uid = project_data.get("propertyId")
    phr_uid = project_data.get("propertyHealthRecordId")

    if not property_uid or not phr_uid:
        raise HTTPException(
            status_code=409,
            detail="Client project is missing Property or PHR references.",
        )

    property_record = (
        db.query(Property)
        .filter(Property.property_uid == property_uid)
        .first()
    )

    if not property_record:
        raise HTTPException(
            status_code=404,
            detail="Client Property not found.",
        )

    if str(property_record.owner_user_id) != str(request["user_id"]):
        raise HTTPException(
            status_code=403,
            detail="Property ownership verification failed.",
        )

    health_record = (
        db.query(PropertyHealthRecord)
        .filter(
            PropertyHealthRecord.property_id == property_record.id
        )
        .first()
    )

    if not health_record or health_record.phr_uid != phr_uid:
        raise HTTPException(
            status_code=409,
            detail="Property Health Record reference mismatch.",
        )

    # -------------------------------------------------
    # FIND PROFESSIONAL ASSESSMENT
    # -------------------------------------------------

    assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.professional_request_id == request_id,
            Assessment.professional_user_id == str(current_user.id),
        )
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Professional Assessment not found.",
        )

    # -------------------------------------------------
    # VERIFY ASSESSMENT LINKAGE
    # -------------------------------------------------

    if (
        assessment.assessment_type != "professional"
        or assessment.project_id != project["id"]
        or assessment.property_id != property_record.id
        or assessment.property_health_record_id != health_record.id
    ):
        raise HTTPException(
            status_code=409,
            detail="Professional Assessment references are inconsistent.",
        )

    return assessment


# =====================================================
# DOWNLOAD CLIENT FLOOR PLAN VERSION
# PROFESSIONAL READ-ONLY ACCESS
# =====================================================

@router.get(
    "/professional-requests/{request_id}/floors/{floor_id}/plan-versions/{version_id}/plan"
)
def download_professional_floor_plan_version(
    request_id: int,
    assessment_id: int,
    floor_id: str,
    version_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # -------------------------------------------------
    # VERIFY ASSESSMENT ACCESS
    # -------------------------------------------------

    access = get_professional_assessment_access(
        db=db,
        current_user=current_user,
        assessment_id=assessment_id,
    )

    assessment = access["assessment"]
    access_mode = access["access_mode"]

    if assessment.professional_request_id != request_id:
        raise HTTPException(
            status_code=404,
            detail="Professional Assessment not found.",
        )

    # -------------------------------------------------
    # SELECT PROJECT ACCORDING TO ACCESS MODE
    # -------------------------------------------------

    if access_mode == FROZEN_READ_ONLY:
        # Frozen: only the isolated Professional Project.
        allowed_project_ids = [
            access["client_project"].id
        ]

    else:
        # Active: both original Home Project and
        # isolated Professional Project are accessible.
        allowed_project_ids = [
            assessment.project_id,
            access["client_project"].id,
        ]

    project = None

    for candidate_project_id in allowed_project_ids:

        candidate = db.execute(
            text("""
                SELECT id, data
                FROM projects
                WHERE id = :project_id
                LIMIT 1
            """),
            {
                "project_id": candidate_project_id,
            },
        ).mappings().first()

        if not candidate:
            continue

        candidate_data = candidate["data"] or {}

        if not isinstance(candidate_data, dict):
            continue

        candidate_floors = candidate_data.get("floors", [])

        if not isinstance(candidate_floors, list):
            continue

        matching_floor = any(
            isinstance(item, dict)
            and str(item.get("id")) == floor_id
            for item in candidate_floors
        )

        if matching_floor:
            project = candidate
            break

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Floor not found in accessible projects.",
        )

    project_id = project["id"]

    project_data = project["data"] or {}

    if not isinstance(project_data, dict):
        raise HTTPException(
            status_code=409,
            detail="Invalid client project data.",
        )

    floors = project_data.get("floors", [])

    if not isinstance(floors, list):
        raise HTTPException(
            status_code=409,
            detail="Invalid floor data.",
        )

    # -------------------------------------------------
    # FIND REQUESTED FLOOR
    # -------------------------------------------------

    floor = next(
        (
            item for item in floors
            if isinstance(item, dict)
            and str(item.get("id")) == floor_id
        ),
        None,
    )

    if not floor:
        raise HTTPException(
            status_code=404,
            detail="Floor not found.",
        )

    # -------------------------------------------------
    # VERIFY ACTIVE PLAN VERSION
    # -------------------------------------------------

    active_version_id = floor.get("activePlanVersionId")

    if (
        access_mode == ACTIVE_EDIT
        and str(active_version_id) != str(version_id)
    ):
        raise HTTPException(
            status_code=403,
            detail="Only the active floor plan version is available.",
        )

    versions = floor.get("planVersions", [])

    if not isinstance(versions, list):
        raise HTTPException(
            status_code=409,
            detail="Invalid floor plan version data.",
        )

    version = next(
        (
            item for item in versions
            if isinstance(item, dict)
            and str(item.get("id")) == str(version_id)
        ),
        None,
    )

    if not version:
        raise HTTPException(
            status_code=404,
            detail="Floor plan version not found.",
        )

    # -------------------------------------------------
    # GET ACTIVE VERSION IMAGE PATH
    # -------------------------------------------------

    plan = version.get("plan", {})

    image_path = (
        plan.get("imagePath")
        if isinstance(plan, dict)
        else None
    )

    if not image_path:
        raise HTTPException(
            status_code=404,
            detail="Floor plan image not found.",
        )

    # TEMPORARY DIAGNOSTIC
    print(
        "[PROFESSIONAL FLOOR PLAN PATH CHECK]",
        {
            "request_id": request_id,
            "assessment_id": assessment_id,
            "access_mode": access_mode,
            "selected_project_id": project_id,
            "floor_id": floor_id,
            "version_id": version_id,
            "image_path": image_path,
        },
    )

    # -------------------------------------------------
    # DOWNLOAD FROM SUPABASE STORAGE
    # -------------------------------------------------

    try:
        file_content = (
            supabase.storage
            .from_("floor-plans")
            .download(image_path)
        )

    except Exception as err:
        print(
            "[PROFESSIONAL FLOOR PLAN DOWNLOAD ERROR]",
            str(err),
        )

        raise HTTPException(
            status_code=502,
            detail="Floor plan download failed.",
        )

    if not file_content:
        raise HTTPException(
            status_code=404,
            detail="Floor plan image is empty.",
        )

    # -------------------------------------------------
    # DETERMINE CONTENT TYPE
    # -------------------------------------------------

    extension = Path(image_path).suffix.lower()

    content_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }

    content_type = content_types.get(
        extension,
        "application/octet-stream",
    )

    return StreamingResponse(
        BytesIO(file_content),
        media_type=content_type,
        headers={
            "Content-Disposition": "inline",
            "Cache-Control": "private, no-store",
        },
    )


# =====================================================
# GET PROFESSIONAL ASSESSMENT DATA
# =====================================================

@router.get(
    "/professional-requests/{request_id}/assessment/data"
)
def get_professional_assessment_data(
    request_id: int,
    assessment_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    access = get_professional_assessment_access(
        db=db,
        current_user=current_user,
        assessment_id=assessment_id,
    )

    assessment = access["assessment"]

    # Assessment must belong to the request in this URL.
    if assessment.professional_request_id != request_id:
        raise HTTPException(
            status_code=404,
            detail="Professional Assessment not found.",
        )

    # Frozen Draft: return only the Assessment and its isolated
    # Professional Project. Never load the original Home Project.
    if access["access_mode"] == FROZEN_READ_ONLY:
        client_project = access["client_project"]

        return {
            "success": True,
            "assessment_id": assessment.id,
            "assessment_uid": assessment.assessment_uid,
            "display_reference": assessment.display_reference,
            "assessment_status": assessment.status,
            "assessment_data": assessment.assessment_data or {},
            "updated_at": assessment.updated_at,
            "client_project_id": client_project.id,
            "client_project_name": client_project.name,
            "client_project_data": client_project.data,
            "access_mode": FROZEN_READ_ONLY,
            "has_active_unlock": False,
        }

    # ACTIVE_EDIT: preserve the existing authorization path.
    assessment = get_authorized_professional_assessment(
        request_id,
        assessment_id,
        current_user,
        db,
    )

    client_project = None

    if assessment.client_project_id:
        client_project = (
            db.query(Project)
            .filter(
                Project.id == assessment.client_project_id,
                Project.user_id == current_user.id,
            )
            .first()
        )

    return {
        "success": True,
        "assessment_id": assessment.id,
        "assessment_uid": assessment.assessment_uid,
        "display_reference": assessment.display_reference,
        "assessment_status": assessment.status,
        "assessment_data": assessment.assessment_data or {},
        "updated_at": assessment.updated_at,
        "client_project_id": (
            client_project.id if client_project else None
        ),
        "client_project_name": (
            client_project.name if client_project else None
        ),
        "client_project_data": (
            client_project.data if client_project else None
        ),
    }

# =====================================================
# SAVE PROFESSIONAL ASSESSMENT DATA
# =====================================================

@router.put(
    "/professional-requests/{request_id}/assessment/data"
)
def save_professional_assessment_data(
    request_id: int,
    assessment_id: int,
    body: dict = Body(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    access = get_professional_assessment_access(
        db=db,
        current_user=current_user,
        assessment_id=assessment_id,
    )

    require_active_edit(access)

    assessment = get_authorized_professional_assessment(
        request_id,
        assessment_id,
        current_user,
        db,
    )

    assessment_data = body.get("assessment_data")

    if not isinstance(assessment_data, dict):
        raise HTTPException(
            status_code=400,
            detail="assessment_data must be a JSON object.",
        )

    # Save Professional Assessment data
    assessment.assessment_data = assessment_data

    # Update the isolated Client Project
    client_project = None

    if assessment.client_project_id:
        client_project = (
            db.query(Project)
            .filter(
                Project.id == assessment.client_project_id,
                Project.user_id == current_user.id,
            )
            .first()
        )

    if client_project:
        canvas_data = assessment_data.get("canvas", {})

        print(
    "[PA CANVAS SAVE CHECK]",
    {
        "assessment_id": assessment.id,
        "client_project_id": assessment.client_project_id,
        "canvas_name": canvas_data.get("name"),
        "floor_count": len(canvas_data.get("floors", [])),
        "zones": [
            {
                "id": z.get("id"),
                "x": z.get("x"),
                "y": z.get("y"),
            }
            for f in canvas_data.get("floors", [])
            if isinstance(f, dict)
            for z in f.get("zones", [])
            if isinstance(z, dict)
        ],
    },
)

        if not isinstance(canvas_data, dict):
            canvas_data = {}

        client_project.name = (
            canvas_data.get("name")
            or body.get("client_project_name")
            or client_project.name
        )

        client_project.data = {
            **(client_project.data or {}),
            **canvas_data,
            "name": client_project.name,
            "assessmentContext": "professional",
            "assessmentId": assessment.assessment_uid,
            "assessmentDatabaseId": assessment.id,
            "assessmentReference": assessment.display_reference,
            "professionalRequestId": request_id,
            "professionalUserId": str(current_user.id),
            "clientHomeProjectId": assessment.project_id,
            "clientProjectId": client_project.id,
        }

    db.commit()
    db.refresh(assessment)

    if client_project:
        db.refresh(client_project)

    return {
        "success": True,
        "assessment_id": assessment.id,
        "assessment_uid": assessment.assessment_uid,
        "display_reference": assessment.display_reference,
        "assessment_status": assessment.status,
        "client_project_id": (
            client_project.id if client_project else None
        ),
        "client_project_name": (
            client_project.name if client_project else None
        ),
        "assessment_data": assessment.assessment_data,
        "updated_at": assessment.updated_at,
    }

@router.get("/professional-requests/contact-points")
def get_professional_contact_opportunities(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "professional":
        raise HTTPException(
            status_code=403,
            detail="Professional account required",
        )

    result = db.execute(
        text("""
            SELECT
                contact_opportunity_limit,
                contact_opportunities_used
            FROM professional_entitlements
            WHERE user_id = :user_id
              AND plan_code = 'professional'
              AND status = 'active'
            LIMIT 1
        """),
        {"user_id": str(current_user.id)},
    ).mappings().first()

    remaining = 0

    if result:
        remaining = max(
            0,
            int(result["contact_opportunity_limit"] or 0)
            - int(result["contact_opportunities_used"] or 0)
        )

    return {
        "contact_opportunities": remaining
    }

@router.get("/professional-requests/mine")
def get_my_professional_requests(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    requests = db.execute(
        text("""
            SELECT
    pr.id,
    pr.user_id,
    pr.project_id,
    pr.country,
    pr.region,
    pr.city,
    pr.postal_code,
    pr.requested_service,
    pr.status,
    pr.created_at,

    EXISTS (
        SELECT 1
        FROM professional_request_contacts prc
        WHERE prc.request_id = pr.id
          AND prc.expires_at > CURRENT_TIMESTAMP
    ) AS has_active_unlock,

    (
        SELECT prc.expires_at
        FROM professional_request_contacts prc
        WHERE prc.request_id = pr.id
          AND prc.expires_at > CURRENT_TIMESTAMP
        ORDER BY prc.expires_at DESC
        LIMIT 1
    ) AS contact_expires_at

    ,
(
    SELECT prcf.contact_preference
    FROM professional_request_contact_feedback prcf
    WHERE prcf.request_id = pr.id
    LIMIT 1
) AS contact_preference,

(
    SELECT prcf.contact_status
    FROM professional_request_contact_feedback prcf
    WHERE prcf.request_id = pr.id
    LIMIT 1
) AS contact_status

FROM professional_requests pr

WHERE pr.user_id = :user_id

ORDER BY pr.created_at DESC
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
                "has_active_unlock": bool(
                    request["has_active_unlock"]
                ),
                "contact_expires_at": request["contact_expires_at"],
                "contact_preference": request["contact_preference"],
                "contact_status": request["contact_status"],
            }
            for request in requests
        ]
    }

# =====================
# UPDATE HOME CONTACT FEEDBACK
# =====================

@router.patch("/professional-requests/{request_id}/contact-feedback")
def update_home_contact_feedback(
    request_id: int,
    body: dict = Body(...),
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    contact_preference = body.get("contact_preference")
    contact_status = body.get("contact_status")

    existing_feedback = db.execute(
        text("""
            SELECT
                contact_preference,
                contact_status
            FROM professional_request_contact_feedback
            WHERE request_id = :request_id
            LIMIT 1
        """),
        {
            "request_id": request_id,
        },
    ).mappings().first()

    if existing_feedback:
        if "contact_preference" not in body:
            contact_preference = existing_feedback["contact_preference"]

        if "contact_status" not in body:
            contact_status = existing_feedback["contact_status"]

    allowed_preferences = {
        None,
        "as_soon_as_possible",
        "within_3_days",
        "within_7_days",
        "no_preference",
    }

    allowed_statuses = {
        None,
        "unknown",
        "not_yet",
        "connected",
    }

    if contact_preference not in allowed_preferences:
        raise HTTPException(
            status_code=400,
            detail="Invalid contact preference.",
        )

    if contact_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid contact status.",
        )

    request = db.execute(
        text("""
            SELECT id
            FROM professional_requests
            WHERE id = :request_id
              AND user_id = :user_id
            LIMIT 1
        """),
        {
            "request_id": request_id,
            "user_id": str(current_user.id),
        },
    ).mappings().first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Professional assessment request not found.",
        )

    db.execute(
        text("""
            INSERT INTO professional_request_contact_feedback (
                request_id,
                contact_preference,
                contact_status,
                updated_at
            )
            VALUES (
                :request_id,
                :contact_preference,
                :contact_status,
                CURRENT_TIMESTAMP
            )
            ON CONFLICT (request_id)
            DO UPDATE SET
                contact_preference = EXCLUDED.contact_preference,
                contact_status = EXCLUDED.contact_status,
                updated_at = CURRENT_TIMESTAMP
        """),
        {
            "request_id": request_id,
            "contact_preference": contact_preference,
            "contact_status": contact_status,
        },
    )

    db.commit()

    return {
        "success": True,
        "request_id": request_id,
        "contact_preference": contact_preference,
        "contact_status": contact_status,
    }

# =====================
# GET CURRENT PROFESSIONAL REQUEST
# =====================


@router.get("/professional-requests")
def get_professional_request(
    project_id: str | None = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
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
            AND (
                :project_id IS NULL
                OR project_id = :project_id
            )
            ORDER BY created_at DESC
            LIMIT 1
        """),
        {
            "user_id": str(current_user.id),
            "project_id": (
                str(project_id)
                if project_id
                else None
            ),
        },
    ).mappings().first()

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

