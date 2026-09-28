from datetime import datetime, timedelta

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
from auth.passwords import (
    hash_password,
    verify_password,
)

router = APIRouter()

from routes.admin_users import require_admin
from models.notification import Notification
from services.notification_service import create_notification

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

    assessment_limit = 0
    assessments_used = 0
    contact_opportunity_limit = 0
    contact_opportunities_used = 0

    # -----------------------------------------------
    # PROFESSIONAL ENTITLEMENTS
    # -----------------------------------------------
    try:
        from sqlalchemy import text

        entitlement = db.execute(
            text("""
                SELECT
                    assessment_limit,
                    assessments_used,
                    contact_opportunity_limit,
                    contact_opportunities_used
                FROM professional_entitlements
                WHERE user_id = :user_id
            """),
            {
                "user_id": str(current_user.id),
            },
        ).mappings().first()

        if entitlement:
            assessment_limit = int(
                entitlement["assessment_limit"] or 0
            )
            assessments_used = int(
                entitlement["assessments_used"] or 0
            )
            contact_opportunity_limit = int(
                entitlement["contact_opportunity_limit"] or 0
            )
            contact_opportunities_used = int(
                entitlement["contact_opportunities_used"] or 0
            )

    except Exception as e:
        print("Failed to load professional entitlements:", e)

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
                    "project_id": str(project_id),
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

        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone": current_user.phone,
        "country": getattr(current_user, "country", None),
        "city": getattr(current_user, "city", None),

        # ---------------------------------------------------------
        # PROFESSIONAL BRANDING
        # ---------------------------------------------------------
        "company_name": getattr(current_user, "company_name", None),
        "company_email": getattr(current_user, "company_email", None),
        "company_website": getattr(current_user, "company_website", None),

        "logo_url": (
            f"/{current_user.logo_path}"
            if getattr(current_user, "logo_path", None)
            else None
        ),

        "branding_active": current_user.branding_active,
        "branding_plan": current_user.branding_plan,
        "branding_activated_at": (
            current_user.branding_activated_at.isoformat()
            if current_user.branding_activated_at
            else None
        ),
        "branding_expires_at": (
            current_user.branding_expires_at.isoformat()
            if current_user.branding_expires_at
            else None
        ),

        "credits": current_user.credits,

        "assessment_limit": assessment_limit,
        "assessments_used": assessments_used,
        "contact_opportunity_limit": contact_opportunity_limit,
        "contact_opportunities_used": contact_opportunities_used,
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

@router.get("/me/notifications")
def get_my_notifications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return [
    {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,"source_workspace": notification.source_workspace,
        "action_label": notification.action_label,
        "action_url": notification.action_url,"source_workspace": notification.source_workspace,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat(),
    }
    for notification in notifications
]

@router.patch("/me/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    notification.is_read = True
    db.commit()

    return {
        "status": "ok",
        "id": notification.id,
        "is_read": True,
    }

@router.patch("/me/notifications/read-all")
def mark_all_notifications_read(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "status": "ok",
        "updated": len(notifications),
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

    current_user.first_name = body.get(
        "first_name",
        current_user.first_name
    )

    current_user.last_name = body.get(
        "last_name",
        current_user.last_name
    )

    current_user.phone = body.get(
        "phone",
        current_user.phone
    )

    current_user.company_name = body.get(
        "company_name",
        "",
    )

    current_user.company_email = body.get(
        "company_email",
        "",
    )

    current_user.company_website = body.get(
        "company_website",
        "",
    )

    db.commit()

    return {
        "status": "ok",
    }

@router.post("/me/change-password")
def change_password(
    body: dict,
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    current_password = (
        body.get("current_password", "")
    )

    new_password = (
        body.get("new_password", "")
    )

    confirm_password = (
        body.get("confirm_password", "")
    )

    # =====================
    # REQUIRED FIELDS
    # =====================

    if not current_password:
        raise HTTPException(
            status_code=400,
            detail="Current password is required.",
        )

    if not new_password:
        raise HTTPException(
            status_code=400,
            detail="New password is required.",
        )

    if not confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Please confirm your new password.",
        )

    # =====================
    # CURRENT PASSWORD
    # =====================

    if not verify_password(
        current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    # =====================
    # NEW PASSWORD
    # =====================

    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters.",
        )

    if new_password != confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match.",
        )

    if new_password == current_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from your current password.",
        )

    # =====================
    # SAVE NEW PASSWORD
    # =====================

    current_user.hashed_password = hash_password(
        new_password
    )

    db.commit()

    notification = Notification(
        user_id=current_user.id,
        title="Password changed",
        message="Your account password was successfully changed.",
        type="security",
        source_workspace=None,
    )

    db.add(notification)
    db.commit()

    return {
        "status": "ok",
        "message": "Password changed successfully.",
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

    print(
        "BRANDING UPLOAD DEBUG logo_path:",
        repr(current_user.logo_path)
    )

    return {"logo_url": f"/uploads/logos/{filename}"}


@router.post("/me/branding/activate")
def activate_branding(
    body: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = body.get("plan")

    if plan not in ("monthly", "annual"):
        raise HTTPException(
            status_code=400,
            detail="Invalid branding plan."
        )

    now = datetime.utcnow()

    if plan == "monthly":
        expires_at = now + timedelta(days=30)
    else:
        expires_at = now + timedelta(days=365)

    current_user.branding_active = True
    current_user.branding_plan = plan
    current_user.branding_activated_at = now
    current_user.branding_expires_at = expires_at

    db.commit()
    db.refresh(current_user)

    return {
        "status": "active",
        "branding_active": True,
        "branding_plan": plan,
        "branding_activated_at": now.isoformat(),
        "branding_expires_at": expires_at.isoformat(),
    }