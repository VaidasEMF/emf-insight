from sqlalchemy import text
from sqlalchemy.orm import Session


def delete_user_data(
    user_id: int,
    db: Session,
):
    user_id = str(user_id)

    # Delete professional requests
    db.execute(
        text("""
            DELETE FROM professional_requests
            WHERE user_id = :user_id
        """),
        {"user_id": user_id},
    )

    # Delete professional profile
    db.execute(
        text("""
            DELETE FROM professional_profiles
            WHERE user_id = :user_id
        """),
        {"user_id": user_id},
    )

    # Delete Home entitlements
    db.execute(
        text("""
            DELETE FROM home_entitlements
            WHERE user_id = :user_id
        """),
        {"user_id": user_id},
    )

    # Delete Home Project entitlements
    db.execute(
        text("""
            DELETE FROM home_project_entitlements
            WHERE user_id = :user_id
        """),
        {"user_id": user_id},
    )

    # Delete reports belonging to user's projects
    db.execute(
        text("""
            DELETE FROM reports
            WHERE project_id IN (
                SELECT id
                FROM projects
                WHERE user_id = :user_id
            )
        """),
        {"user_id": user_id},
    )

    # Delete project versions belonging to user's projects
    db.execute(
        text("""
            DELETE FROM project_versions
            WHERE project_id IN (
                SELECT id
                FROM projects
                WHERE user_id = :user_id
            )
        """),
        {"user_id": user_id},
    )

    # Delete user's projects
    db.execute(
        text("""
            DELETE FROM projects
            WHERE user_id = :user_id
        """),
        {"user_id": user_id},
    )