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


@router.post("/forgot-password")
def forgot_password(
    email: str,
    db: Session = Depends(get_db),
):
    import os
    import smtplib
    from email.message import EmailMessage

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

    message = EmailMessage()

    message["Subject"] = "EMF Insight – Password Reset"
    message["From"] = os.getenv(
        "SMTP_USERNAME",
        "info@emfinsight.com",
    )
    message["To"] = user.email

    message.set_content(
        f"""Hello,

We received a request to reset your EMF Insight password.

Please use the following link to reset your password:

{reset_url}

This link is valid for 30 minutes.

If you did not request a password reset, you can safely ignore this email.

EMF Insight
"""
    )

    smtp_host = os.getenv(
        "SMTP_HOST",
        "smtp.gmail.com",
    )

    smtp_port = int(
        os.getenv(
            "SMTP_PORT",
            "587",
        )
    )

    smtp_username = os.getenv(
        "SMTP_USERNAME"
    )

    smtp_password = os.getenv(
        "SMTP_PASSWORD"
    )

    if not smtp_username or not smtp_password:
        raise RuntimeError(
            "SMTP_USERNAME and SMTP_PASSWORD are not configured."
        )

    with smtplib.SMTP(
        smtp_host,
        smtp_port,
    ) as server:

        server.starttls()

        server.login(
            smtp_username,
            smtp_password,
        )

        server.send_message(
            message
        )

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
