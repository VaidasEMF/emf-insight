from datetime import datetime, timedelta

import secrets

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from fastapi.security import (
    OAuth2PasswordRequestForm,
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from sqlalchemy.orm import Session

from db.database import (
    SessionLocal,
)

from models.user import User

from auth.passwords import (
    hash_password,
    verify_password,
)

from auth.jwt import (
    create_access_token,
    decode_access_token,
)


router = APIRouter()


# =====================
# DB DEPENDENCY
# =====================


def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# =====================
# CURRENT USER
# =====================

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(
        get_db
    ),
):

    token = credentials.credentials

    try:

        payload = decode_access_token(
            token
        )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user_id = payload.get(
        "sub"
    )

    if not user_id:

        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    try:

        user_id = int(
            user_id
        )

    except (
        ValueError,
        TypeError,
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid token subject",
        )

    user = (
        db.query(
            User
        )
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


# =====================
# REGISTER
# =====================


@router.post("/register")
def register(
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    db: Session = Depends(
        get_db,
    ),
):

    existing = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        hashed_password=hash_password(
            password,
        ),
        credits=1,
    )

    db.add(
        user
    )

    db.commit()

    db.refresh(
        user
    )

    return {
        "message": "User created",
    }


# =====================
# LOGIN
# =====================


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(
        get_db
    ),
):

    user = (
        db.query(User)
        .filter(
            User.email ==
            form_data.username
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )



    valid = verify_password(
        form_data.password,
        user.hashed_password,
    )

    if not valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if (
        user.access_expires_at is not None
        and user.access_expires_at <= datetime.utcnow()
    ):

        raise HTTPException(
            status_code=403,
            detail="Test access has expired.",
        )



    token = create_access_token(
        {
            "sub": str(
                user.id
            ),
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/admin/tester")
def create_tester(
    email: str,
    password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    existing = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    tester = User(
        email=email,
        hashed_password=hash_password(password),
        credits=1,
        plan="tester",
        access_expires_at=(
            datetime.utcnow()
            + timedelta(days=7)
        ),
    )

    db.add(tester)
    db.commit()
    db.refresh(tester)

    return {
        "email": tester.email,
        "plan": tester.plan,
        "access_expires_at": tester.access_expires_at,
    }


@router.get("/admin/user/{user_id}")
def get_admin_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

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

    return {
        "id": user.id,
        "email": user.email,
        "plan": user.plan,
        "credits": user.credits,
        "home_full_report_unlocked": getattr(
            user,
            "home_full_report_unlocked",
            None,
        ),
    }


@router.post("/forgot-password")
def forgot_password(
    email: str,
    db: Session = Depends(get_db),
):
    import os
    import json
    import urllib.request
    import urllib.error

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    

    # Do not reveal whether an account exists
    if not user:
        return {
            "message": "If the account exists, a password reset link will be sent."
        }

    token = secrets.token_urlsafe(32)

    user.password_reset_token = token
    user.password_reset_expires_at = (
        datetime.utcnow() + timedelta(minutes=30)
    )

    db.commit()

    reset_url = (
        "https://app.emfinsight.com/reset-password.html"
        f"?token={token}"
    )

    brevo_api_key = os.getenv("BREVO_API_KEY")

    if not brevo_api_key:
        raise RuntimeError(
            "BREVO_API_KEY is not configured."
        )

    payload = {
        "sender": {
            "name": "EMF Insight",
            "email": "info@emfinsight.com",
        },
        "to": [
            {
                "email": user.email,
            }
        ],
        "subject": "EMF Insight – Password Reset",
        "textContent": f"""Hello,

We received a request to reset your EMF Insight password.

Please use the following link to reset your password:

{reset_url}

This link is valid for 30 minutes.

If you did not request a password reset, you can safely ignore this email.

EMF Insight
""",
    }

    request = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "accept": "application/json",
            "api-key": brevo_api_key,
            "content-type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(
            request,
            timeout=15,
        ) as response:

            if response.status not in (200, 201):
                raise RuntimeError(
                    f"Brevo email failed with status {response.status}."
                )

    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode(
            "utf-8",
            errors="replace",
        )

        raise HTTPException(
            status_code=503,
            detail="Password reset email service is temporarily unavailable. Please try again later."
        ) from exc

    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"Brevo connection failed: {exc}"
        ) from exc

    return {
        "message": "If the account exists, a password reset link will be sent."
    }

@router.post("/reset-password")
def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(
            User.password_reset_token == token
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    if (
        user.password_reset_expires_at is None
        or user.password_reset_expires_at <= datetime.utcnow()
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    user.hashed_password = hash_password(
        new_password
    )

    user.password_reset_token = None
    user.password_reset_expires_at = None

    db.commit()

    return {
        "message": "Password reset successful",
    }
