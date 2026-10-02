from fastapi import (
    Depends,
    HTTPException,
)

from fastapi.security import (
    OAuth2PasswordBearer,
)

from jose import jwt

from sqlalchemy.orm import Session

from db.database import (
    SessionLocal,
)

from models.user import User

from auth.jwt import (
    SECRET_KEY,
    ALGORITHM,
)


# =====================
# TOKEN SCHEME
# =====================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login",
)


# =====================
# DB
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

def get_current_user(
    token: str = Depends(
        oauth2_scheme,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid authentication",
    )

    

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

       

        user_id = payload.get(
                "sub",
            )

       

        if user_id is None:

           

            raise credentials_exception

        try:

            user_id = int(user_id)

        except Exception as err:

           

            raise credentials_exception

        user = db.query(User).filter(
                User.id == user_id
            ).first()

       

        if not user:

           

            raise credentials_exception

       


        return user

    except HTTPException:

        raise

    except Exception as err:

        print(
            "❌❌❌ JWT DECODE ERROR:",
            type(err).__name__,
            str(err)
        )

        print(
            "=================================\n"
        )

        raise credentials_exception

    # =====================
# ADMIN
# =====================

def require_admin(
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user