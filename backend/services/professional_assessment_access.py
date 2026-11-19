
from sqlalchemy import text
from fastapi import HTTPException

from models.assessment import Assessment
from models.project import Project


ACTIVE_EDIT = "ACTIVE_EDIT"
FROZEN_READ_ONLY = "FROZEN_READ_ONLY"


def get_professional_assessment_access(
    db,
    current_user,
    assessment_id: int,
):
    """
    Resolve access to one Professional Assessment.

    ACTIVE_EDIT:
        The specialist has an active Unlock.

    FROZEN_READ_ONLY:
        The specialist owns the historical Assessment,
        but its Unlock has expired.

    IMPORTANT:
        This function never loads the original Home Project.
    """

    if getattr(current_user, "role", None) != "professional":
        raise HTTPException(
            status_code=403,
            detail="Professional account required.",
        )

    user_id = str(current_user.id)

    assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.professional_user_id == user_id,
            Assessment.assessment_type == "professional",
        )
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Professional Assessment not found.",
        )

    if not assessment.professional_request_id:
        raise HTTPException(
            status_code=409,
            detail="Assessment request linkage is missing.",
        )

    if not assessment.client_project_id:
        raise HTTPException(
            status_code=409,
            detail="Professional Project linkage is missing.",
        )

    # Load only the isolated Professional Project.
    client_project = (
        db.query(Project)
        .filter(
            Project.id == assessment.client_project_id,
            Project.user_id == current_user.id,
        )
        .first()
    )

    if not client_project:
        raise HTTPException(
            status_code=409,
            detail="Professional Project is missing or inaccessible.",
        )

    # Check the exact Unlock linked to this Assessment.
    active_unlock = False

    if assessment.professional_request_contact_id is not None:

        unlock = db.execute(
            text("""
                SELECT
                    id,
                    (expires_at > CURRENT_TIMESTAMP) AS is_active
                FROM professional_request_contacts
                WHERE id = :contact_id
                  AND request_id = :request_id
                  AND professional_user_id = :user_id
                LIMIT 1
            """),
            {
                "contact_id": assessment.professional_request_contact_id,
                "request_id": assessment.professional_request_id,
                "user_id": user_id,
            },
        ).mappings().first()

        if not unlock:
            raise HTTPException(
                status_code=409,
                detail="Assessment Unlock linkage is invalid.",
            )

        active_unlock = bool(unlock["is_active"])

    access_mode = (
        ACTIVE_EDIT
        if active_unlock
        else FROZEN_READ_ONLY
    )

    return {
        "assessment": assessment,
        "client_project": client_project,
        "access_mode": access_mode,
        "has_active_unlock": bool(active_unlock),
    }


def get_professional_project_access(
    db,
    current_user,
    project_id: int,
):
    """
    Resolve whether a project is an isolated
    Professional Project and, if so, its access mode.

    Returns None only when the project has no
    Assessment relationship.
    """

    assessments = (
        db.query(Assessment)
        .filter(
            Assessment.client_project_id == project_id,
        )
        .all()
    )

    if not assessments:
        return None

    if len(assessments) != 1:
        raise HTTPException(
            status_code=409,
            detail="Professional Project has ambiguous Assessment linkage.",
        )

    assessment = assessments[0]

    return get_professional_assessment_access(
        db=db,
        current_user=current_user,
        assessment_id=assessment.id,
    )


def require_active_edit(access: dict):
    """
    Block all write operations when Unlock has expired.
    """

    if access.get("access_mode") != ACTIVE_EDIT:
        raise HTTPException(
            status_code=403,
            detail=(
                "Professional Unlock has expired. "
                "This Assessment is read-only."
            ),
        )
