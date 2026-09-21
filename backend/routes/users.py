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
from sqlalchemy import text
from sqlalchemy.orm import Session
from models.user import User

router = APIRouter()

from routes.admin_users import require_admin

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

    # ---------------------------------------------------------
    # PROFESSIONAL DEMO
    # ---------------------------------------------------------
    try:
        from auth.entitlements import is_professional_demo_active
        from sqlalchemy import text

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

    # ---------------------------------------------------------
    # HOME FULL REPORT ENTITLEMENT
    # Project-scoped ONLY
    # ---------------------------------------------------------
    if project_id is not None:
        try:
            from sqlalchemy import text

            # First verify that this project belongs to
            # the currently authenticated user.
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

            # Check entitlement ONLY for this project.
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

            home_full_report_unlocked = bool(result)

        except HTTPException:
            raise
        except Exception as e:
            print("HOME ENTITLEMENT CHECK FAILED:", repr(e))
            home_full_report_unlocked = False

    # IMPORTANT:
    # If project_id is not supplied, the Home Full Report
    # remains locked.
    #
    # Do NOT fall back to the old `home_entitlements` table.
    # The entitlement is project-scoped.

    return {
        "id": current_user.id,
        "email": current_user.email,
        "country": getattr(current_user, "country", None),
        "city": getattr(current_user, "city", None),
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


# =========================================================
# HOME PROJECT SUMMARY
# =========================================================

@router.get("/users/{user_id}/home-summary")
def get_admin_home_summary(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    total_projects = db.execute(
        text("""
            SELECT COUNT(*)
            FROM projects
            WHERE user_id = :user_id
        """),
        {
            "user_id": user_id,
        },
    ).scalar() or 0

    purchased_reports = db.execute(
        text("""
            SELECT COUNT(*)
            FROM home_project_entitlements
            WHERE user_id = :user_id
              AND stripe_session_id IS NOT NULL
        """),
        {
            "user_id": user_id,
        },
    ).scalar() or 0

    unlocked_reports = db.execute(
        text("""
            SELECT COUNT(*)
            FROM home_project_entitlements
            WHERE user_id = :user_id
              AND full_report_unlocked = TRUE
        """),
        {
            "user_id": user_id,
        },
    ).scalar() or 0

    return {
        "user_id": user_id,
        "total_projects": int(total_projects),
        "purchased_reports": int(purchased_reports),
        "unlocked_reports": int(unlocked_reports),
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

