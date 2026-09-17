from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from auth.dependencies import (
    get_current_user,
    get_db,
)

import os
import uuid

from fastapi import UploadFile
from fastapi import File
from sqlalchemy.orm import Session

router = APIRouter()

# =====================
# ME
# =====================


@router.get("/me")
def me(
    project_id: int | None = Query(default=None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    home_full_report_unlocked = False

    professional_demo_active = False
    professional_demo_expires_at = None

    try:
        from auth.entitlements import is_professional_demo_active
        from sqlalchemy import text
        from datetime import datetime

        professional_demo_active = is_professional_demo_active(
            current_user,
            db,
        )

        if professional_demo_active:
            professional_demo_expires_at = db.execute(
                text("""
                    SELECT expires_at
                    FROM professional_demo_links
                    WHERE user_id = :user_id
                      AND status = 'active'
                    ORDER BY expires_at DESC
                    LIMIT 1
                """),
                {
                    "user_id": str(current_user.id),
                },
            ).scalar()

    except Exception:
        professional_demo_active = False
        professional_demo_expires_at = None

    try:
        from sqlalchemy import text

        if project_id is not None:
            project_owner = db.execute(
                text("""
                    SELECT id
                    FROM projects
                    WHERE id = :project_id
                      AND user_id = :user_id
                """),
                {
                    "project_id": project_id,
                    "user_id": str(current_user.id),
                },
            ).scalar()

            if project_owner is None:
                raise HTTPException(
                    status_code=404,
                    detail="Home project not found.",
                )

            result = db.execute(
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
        else:
            result = db.execute(
                text("""
                    SELECT full_report_unlocked
                    FROM home_entitlements
                    WHERE user_id = :user_id
                """),
                {"user_id": str(current_user.id)},
            ).scalar()

        home_full_report_unlocked = bool(result)

    except HTTPException:
        raise
    except Exception:
        home_full_report_unlocked = False

    return {
        "id": current_user.id,
        "email": current_user.email,
        "credits": current_user.credits,
        "plan": current_user.plan,
        "role": current_user.role,
        "is_admin": current_user.is_admin,
        "home_full_report_unlocked": home_full_report_unlocked,
        "professional_demo_active": professional_demo_active,
        "professional_demo_expires_at": (
            professional_demo_expires_at.isoformat()
            if professional_demo_expires_at
            else None
        ),
    }



# =====================
# DELETE ACCOUNT
# =====================

@router.delete("/me")
def delete_me(
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):
    if current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin account cannot be deleted here",
        )

    from sqlalchemy import text

    user_id = str(current_user.id)

    try:
        # Delete professional requests
        db.execute(
            text("""
                DELETE FROM professional_requests
                WHERE user_id = :user_id
            """),
            {"user_id": user_id},
        )

        # Delete professional profile
        db.execute(
            text("""
                DELETE FROM professional_profiles
                WHERE user_id = :user_id
            """),
            {"user_id": user_id},
        )

        # Delete Home entitlements
        db.execute(
            text("""
                DELETE FROM home_entitlements
                WHERE user_id = :user_id
            """),
            {"user_id": user_id},
        )

        # Delete Home Project entitlements
        db.execute(
            text("""
                DELETE FROM home_project_entitlements
                WHERE user_id = :user_id
            """),
            {"user_id": user_id},
        )

        # Delete reports belonging to user's projects
        db.execute(
            text("""
                DELETE FROM reports
                WHERE project_id IN (
                    SELECT id
                    FROM projects
                    WHERE user_id = :user_id
                )
            """),
            {"user_id": current_user.id},
        )

        # Delete project versions belonging to user's projects
        db.execute(
            text("""
                DELETE FROM project_versions
                WHERE project_id IN (
                    SELECT id
                    FROM projects
                    WHERE user_id = :user_id
                )
            """),
            {"user_id": current_user.id},
        )

        # Delete user's projects
        db.execute(
            text("""
                DELETE FROM projects
                WHERE user_id = :user_id
            """),
            {"user_id": current_user.id},
        )

        # Finally delete the user
        db.delete(current_user)

        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Account deletion failed",
        )

    return {
        "status": "deleted",
    }

# =====================
# UPDATE PROFILE
# =====================


@router.post("/me/profile")
def update_profile(
    body: dict,
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    current_user.company_name = body.get(
        "company_name",
        "",
    )

    current_user.company_email = body.get(
        "company_email",
        "",
    )

    db.commit()

    return {
        "status": "ok",
    }


# =====================
# UPLOAD LOGO
# =====================


@router.post("/me/logo")
async def upload_logo(
    file: UploadFile = File(...),
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    ext = file.filename.split(".")[-1]

    filename = f"{uuid.uuid4()}.{ext}"

    save_path = os.path.join(
        "uploads",
        "logos",
        filename,
    )

    with open(
        save_path,
        "wb",
    ) as f:

        content = await file.read()

        f.write(content)

    current_user.logo_path = save_path

    db.commit()

    return {"logo_url": f"/uploads/logos/{filename}"}

