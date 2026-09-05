from datetime import (
    datetime,
    timedelta,
)

from jose import (
    jwt,
    JWTError,
)

from config import (
    SECRET_KEY,
)


# ==================================================
# JWT CONFIGURATION
# ==================================================

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_HOURS = 24


# ==================================================
# CREATE ACCESS TOKEN
# ==================================================

def create_access_token(
    data: dict,
):

    to_encode = data.copy()

    expire = (
        datetime.utcnow()
        + timedelta(
            hours=ACCESS_TOKEN_EXPIRE_HOURS,
        )
    )

    to_encode.update(
        {
            "exp": expire,
        }
    )

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ==================================================
# DECODE ACCESS TOKEN
# ==================================================

def decode_access_token(
    token: str,
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[
                ALGORITHM
            ],
        )

        return payload

    except JWTError:

        raise ValueError(
            "Invalid or expired token"
        )