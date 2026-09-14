from datetime import datetime

from sqlalchemy import text


def is_professional_demo_active(user, db):
    """
    Return True only when the user has an active, non-expired
    Professional Demo entitlement.
    """

    if not user:
        return False

    if getattr(user, "role", None) != "professional":
        return False

    result = db.execute(
        text(
            """
            SELECT 1
            FROM professional_demo_links
            WHERE user_id = :user_id
              AND status = 'active'
              AND expires_at IS NOT NULL
              AND expires_at > :now
            LIMIT 1
            """
        ),
        {
            "user_id": str(user.id),
            "now": datetime.utcnow(),
        },
    ).first()

    return result is not None
