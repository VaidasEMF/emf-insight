from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user, get_db
from models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["admin-users"],
)


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:

    if not current_user.is_admin:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user


# =====================
# GET USERS
# =====================

@router.get("/users")
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rows = db.execute(
        text("""
            SELECT
                id,
                email,
                first_name,
                last_name,
                plan,
                role,
                is_admin,
                credits
            FROM users
            ORDER BY id DESC
        """)
    ).mappings().all()

    return [dict(row) for row in rows]