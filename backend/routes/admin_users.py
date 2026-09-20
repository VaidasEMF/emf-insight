from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user, get_db
from models.user import User

from models.project import Project


router = APIRouter(
    prefix="/admin",
    tags=["admin-users"],
)


def require_admin(
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user


# =========================================================
# USERS LIST
# =========================================================

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
                country,
                city,
                plan,
                role,
                is_admin,
                account_status,
                credits
            FROM users
            ORDER BY id DESC
        """)
    ).mappings().all()

    return [dict(row) for row in rows]


# =========================================================
# USER DETAIL
# =========================================================

@router.get("/users/{user_id}")
def get_admin_user(
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

    # -----------------------------------------------------
    # HOME PROJECTS
    # -----------------------------------------------------

    home_summary = db.execute(
    text("""
        SELECT
            COUNT(p.id) AS total_projects,
            COUNT(
                CASE
                    WHEN e.stripe_session_id IS NOT NULL
                    THEN 1
                END
            ) AS purchased_reports,
            COUNT(
                CASE
                    WHEN e.full_report_unlocked = TRUE
                    THEN 1
                END
            ) AS unlocked_reports
        FROM projects p
        LEFT JOIN home_project_entitlements e
            ON CAST(e.project_id AS VARCHAR)
             = CAST(p.id AS VARCHAR)
            AND CAST(e.user_id AS VARCHAR)
             = CAST(:user_id AS VARCHAR)
        WHERE p.user_id = :user_id
    """),
    {
        "user_id": user_id,
    },
).mappings().first()

    # -----------------------------------------------------
    # BUSINESS CREDIT LEDGER
    # -----------------------------------------------------

    credit_ledger = db.execute(
        text("""
            SELECT
                id,
                transaction_type,
                amount,
                balance_after,
                reference_type,
                reference_id,
                created_at
            FROM report_credit_ledger
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            LIMIT 100
        """),
        {
            "user_id": user_id,
        },
    ).mappings().all()

    return {
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "country": user.country,
            "city": user.city,
            "company_name": user.company_name,
            "company_email": user.company_email,
            "plan": user.plan,
            "role": user.role,
            "credits": user.credits,
            "is_admin": user.is_admin,
            "account_status": user.account_status,
            "access_expires_at": (
                user.access_expires_at.isoformat()
                if user.access_expires_at
                else None
            ),
        },

        "home_summary": {
            "total_projects":
                int(home_summary["total_projects"] or 0),

            "purchased_reports":
                int(home_summary["purchased_reports"] or 0),

            "unlocked_reports":
                int(home_summary["unlocked_reports"] or 0),
        },

        "credit_ledger": [
            dict(row)
            for row in credit_ledger
        ],
    }

# =========================================================
# HOME PROJECTS LIST
# =========================================================

@router.get("/users/{user_id}/home-projects")
def get_admin_home_projects(
    user_id: int,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    report_status: str | None = None,
    payment_status: str | None = None,
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

    page = max(1, int(page))

    allowed_page_sizes = {
        10,
        20,
        50,
        100,
    }

    if page_size not in allowed_page_sizes:
        page_size = 20

    offset = (page - 1) * page_size

    where = [
        "p.user_id = :user_id"
    ]

    params = {
        "user_id": user_id,
    }

    if search:
        where.append(
            """
            CAST(p.id AS VARCHAR) ILIKE :search
            """
        )

        params["search"] = f"%{search.strip()}%"

    if report_status == "unlocked":
        where.append(
            "e.full_report_unlocked = TRUE"
        )

    elif report_status == "locked":
        where.append(
            """
            (
                e.full_report_unlocked = FALSE
                OR e.full_report_unlocked IS NULL
            )
            """
        )

    if payment_status == "paid":
        where.append(
            "e.stripe_session_id IS NOT NULL"
        )

    elif payment_status == "unpaid":
        where.append(
            "e.stripe_session_id IS NULL"
        )

    where_sql = " AND ".join(where)

    total = db.execute(
        text(f"""
            SELECT COUNT(*)
            FROM projects p
            LEFT JOIN home_project_entitlements e
                ON CAST(e.project_id AS VARCHAR)
                 = CAST(p.id AS VARCHAR)
                AND CAST(e.user_id AS VARCHAR)
                 = CAST(:user_id AS VARCHAR)
            WHERE {where_sql}
        """),
        params,
    ).scalar() or 0

    rows = db.execute(
        text(f"""
            SELECT
                p.id,
                e.full_report_unlocked,
                e.stripe_session_id,
                e.unlocked_at
            FROM projects p
            LEFT JOIN home_project_entitlements e
                ON CAST(e.project_id AS VARCHAR)
                 = CAST(p.id AS VARCHAR)
                AND CAST(e.user_id AS VARCHAR)
                 = CAST(:user_id AS VARCHAR)
            WHERE {where_sql}
            ORDER BY p.id DESC
            LIMIT :limit
            OFFSET :offset
        """),
        {
            **params,
            "limit": page_size,
            "offset": offset,
        },
    ).mappings().all()

    return {
        "user_id": user_id,
        "page": page,
        "page_size": page_size,
        "total": int(total),
        "total_pages": max(
            1,
            (int(total) + page_size - 1)
            // page_size,
        ),
        "projects": [
            dict(row)
            for row in rows
        ],
    }


# =========================================================
# ADMIN HOME PROJECT INSPECTOR
# =========================================================

@router.get("/users/{user_id}/home-projects/{project_id}")
def get_admin_home_project(
    user_id: int,
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.user_id == user_id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Home project not found",
        )

    entitlement = db.execute(
        text("""
            SELECT
                full_report_unlocked,
                stripe_session_id,
                unlocked_at
            FROM home_project_entitlements
            WHERE project_id = :project_id
              AND user_id = :user_id
        """),
        {
            "project_id": str(project_id),
            "user_id": str(user_id),
        },
    ).mappings().first()

    data = (
        project.data
        if isinstance(project.data, dict)
        else {}
    )

    return {
        "id": project.id,
        "user_id": project.user_id,
        "name": project.name,
        "data": data,
        "full_report_unlocked": (
            bool(entitlement["full_report_unlocked"])
            if entitlement
            else False
        ),
        "stripe_session_id": (
            entitlement["stripe_session_id"]
            if entitlement
            else None
        ),
        "unlocked_at": (
            entitlement["unlocked_at"].isoformat()
            if entitlement
            and entitlement["unlocked_at"]
            else None
        ),
    }

# =========================================================
# EDIT USER
# =========================================================

@router.patch("/users/{user_id}")
def update_admin_user(
    user_id: int,
    body: dict,
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

    allowed_fields = {
        "first_name",
        "last_name",
        "email",
        "country",
        "city",
        "company_name",
        "company_email",
        "role",
        "plan",
    }

    changes = {}

    for field in allowed_fields:
        if field not in body:
            continue

        value = body.get(field)

        if field == "email":
            value = str(value or "").strip().lower()

            existing = (
                db.query(User)
                .filter(
                    User.email == value,
                    User.id != user_id,
                )
                .first()
            )

            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="Email already exists",
                )

        else:
            value = (
                str(value).strip()
                if value is not None
                else ""
            )

        old_value = getattr(user, field)

        if old_value != value:
            setattr(user, field, value)

            changes[field] = {
                "old": old_value,
                "new": value,
            }

    if changes:
        db.commit()

    return {
        "status": "ok",
        "user_id": user.id,
        "changes": changes,
    }


# =========================================================
# SUSPEND
# =========================================================

@router.post("/users/{user_id}/suspend")
def suspend_admin_user(
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

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot suspend your own admin account",
        )

    user.account_status = "suspended"

    db.commit()

    return {
        "status": "ok",
        "user_id": user.id,
        "account_status": user.account_status,
    }


# =========================================================
# ACTIVATE
# =========================================================

@router.post("/users/{user_id}/activate")
def activate_admin_user(
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

    user.account_status = "active"

    db.commit()

    return {
        "status": "ok",
        "user_id": user.id,
        "account_status": user.account_status,
    }


# =========================================================
# ADD / REMOVE BUSINESS CREDITS
# =========================================================

@router.post("/users/{user_id}/credits")
def adjust_admin_user_credits(
    user_id: int,
    body: dict,
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

    try:
        amount = int(body.get("amount"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Credit amount must be an integer",
        )

    if amount == 0:
        raise HTTPException(
            status_code=400,
            detail="Credit amount cannot be zero",
        )

    new_balance = (user.credits or 0) + amount

    if new_balance < 0:
        raise HTTPException(
            status_code=400,
            detail="Credit balance cannot become negative",
        )

    user.credits = new_balance

    # Keep Business balance authoritative in User.credits.
    # Ledger is the audit/history layer.
    from models.report_credit_ledger import ReportCreditLedger

    db.add(
        ReportCreditLedger(
            user_id=user.id,
            transaction_type="ADMIN_ADJUSTMENT",
            amount=amount,
            balance_after=new_balance,
            reference_type="admin",
            reference_id=str(current_user.id),
        )
    )

    db.commit()

    return {
        "status": "ok",
        "user_id": user.id,
        "amount": amount,
        "balance": new_balance,
    }