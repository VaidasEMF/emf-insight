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

    print(
        "\n================================="
    )

    print(
        "🔥 GET CURRENT USER"
    )

    print(
        "🔥 TOKEN RECEIVED:",
        bool(token)
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        print(
            "🔥 JWT PAYLOAD:",
            payload
        )

        user_id = payload.get(
                "sub",
            )

        print(
            "🔥 JWT USER ID:",
            user_id,
            type(user_id)
        )

        if user_id is None:

            print(
                "❌ JWT HAS NO SUB"
            )

            raise credentials_exception

        try:

            user_id = int(user_id)

        except Exception as err:

            print(
                "❌ USER ID CONVERSION FAILED:",
                err
            )

            raise credentials_exception

        user = db.query(User).filter(
                User.id == user_id
            ).first()

        print(
            "🔥 USER FOUND:",
            user
        )

        if not user:

            print(
                "❌ USER NOT FOUND:",
                user_id
            )

            raise credentials_exception

        print(
            "🔥 AUTHENTICATION SUCCESS:",
            {
                "user_id":
                    user.id
            }
        )

        print(
            "=================================\n"
        )

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