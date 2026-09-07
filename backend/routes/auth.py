from datetime import datetime, timedelta

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

    print(
        "EMAIL:",
        user.email
    )

    print(
        "HASH:",
        user.hashed_password
    )

    print(
        "HASH LEN:",
        len(
            user.hashed_password
        )
    )

    print(
        "PASSWORD:",
        form_data.password
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

@router.post("/admin/reset-password")
def reset_admin_password(
    password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    current_user.hashed_password = hash_password(
        password
    )

    db.commit()

    return {
        "message": "Admin password updated",
    }