from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
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
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    home_full_report_unlocked = False

    try:
        from sqlalchemy import text

        result = db.execute(
            text("""
                SELECT full_report_unlocked
                FROM home_entitlements
                WHERE user_id = :user_id
            """),
            {
                "user_id": str(current_user.id),
            },
        ).scalar()

        home_full_report_unlocked = bool(result)

    except Exception:
        home_full_report_unlocked = False

    return {
        "id": current_user.id,
        "email": current_user.email,
        "credits": current_user.credits,
        "plan": current_user.plan,
        "home_full_report_unlocked": home_full_report_unlocked,
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
