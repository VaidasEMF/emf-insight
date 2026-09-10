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
            "user_id": current_user.id,
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

    # ---------------------------------
    # CREATE REQUEST
    # ---------------------------------

    result = db.execute(
        text("""
            INSERT INTO professional_requests
                (
                    user_id,
                    project_id,
                    country,
                    region,
                    city,
                    status
                )
            VALUES
                (
                    :user_id,
                    :project_id,
                    :country,
                    :region,
                    :city,
                    'open'
                )
            RETURNING
                id,
                user_id,
                project_id,
                country,
                region,
                city,
                status,
                created_at
        """),
        {
            "user_id": current_user.id,
            "project_id": project_id,
            "country": country,
            "region": region,
            "city": city,
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
        "status": request["status"],
        "created_at": request["created_at"],
    }