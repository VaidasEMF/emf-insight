from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from auth.dependencies import (
    get_current_user,
    get_db,
)

from models.project import Project

from models.project_version import ProjectVersion

router = APIRouter()



# =====================
# CREATE PROJECT
# =====================


@router.post("/projects")
def create_project(
    body: dict,
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    project_name = (
        body.get("name")
        or "Project"
    )

    project_type = (
        body.get("type")
        or ""
    )

    project_data = (
        body.get("data")
        if isinstance(
            body.get("data"),
            dict
        )
        else {}
    )

    # ==================================================
    # STORE PROJECT TYPE INSIDE PROJECT DATA
    # ==================================================

    if project_type:
        project_data["type"] = project_type

    # Keep projectType compatibility if
    # existing frontend logic expects it.
    if project_type:
        project_data["projectType"] = project_type

    # Keep project name available in project data
    # as well as canonical Project.name.
    project_data["name"] = project_name


    project = Project(
        name=project_name,
        data=project_data,
        user_id=current_user.id,
    )


    db.add(project)

    db.commit()


    print(
        "\n🔥🔥🔥 AFTER DB COMMIT"
    )

    print(
        "🔥 PROJECT CREATED",
        {
            "project_id":
                project.id,

            "name":
                project.name,

            "type":
                project_data.get(
                    "type"
                )
        }
    )

    print(
        "🔥 PROJECT.DATA ZONES AFTER COMMIT:",
        [
            len(
                floor.get(
                    "zones",
                    []
                )
            )
            if isinstance(
                floor,
                dict
            )
            else "INVALID"
            for floor in project.data.get(
                "floors",
                []
            )
        ]
    )


    db.refresh(project)


    return {
        "project_id":
            project.id,

        "name":
            project.name,

        "type":
            project.data.get(
                "type",
                ""
            ),
    }


# =====================
# MY PROJECTS
# =====================


@router.get("/projects/me")
def my_projects(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    projects = (
        db.query(Project)
        .filter(
            Project.user_id == current_user.id
        )
        .all()
    )

    result = []

    for p in projects:

        data = (
            p.data
            if isinstance(p.data, dict)
            else {}
        )

        project_type = (
            data.get("type")
            or data.get("project_type")
            or data.get("projectType")
            or ""
        )

        created_at = getattr(
            p,
            "created_at",
            None
        )

        result.append({
            "id": p.id,
            "name": p.name,
            "type": project_type,
            "created_at": (
                created_at.isoformat()
                if created_at
                else None
            ),
        })

    return result

# =====================
# GET PROJECT
# =====================


@router.get("/project/{project_id}")
def get_project(
    project_id: int,
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:

        raise HTTPException(
            404,
            "Project not found",
        )

    # =====================
    # OWNERSHIP CHECK
    # =====================

    if project.user_id != current_user.id:

        raise HTTPException(
            403,
            "Forbidden",
        )


    print(
        "\n🔥🔥🔥 GET PROJECT DB DATA",
        {
            "project_id": project.id,
            "project_type":
                project.data.get(
                    "projectType"
                )
                if isinstance(
                    project.data,
                    dict
                )
                else None,

            "floors":
                len(
                    project.data.get(
                        "floors",
                        []
                    )
                )
                if isinstance(
                    project.data,
                    dict
                )
                else "INVALID",

            "floor_keys":
                [
                    list(floor.keys())
                    for floor in project.data.get(
                        "floors",
                        []
                    )
                    if isinstance(
                        floor,
                        dict
                    )
                ]
                if isinstance(
                    project.data,
                    dict
                )
                else []
        }
    )

    print(
        "🔥🔥🔥 IMAGE DATA DB DEBUG",
        {
            "floor_count":
                len(
                    project.data.get(
                        "floors",
                        []
                    )
                ),

            "has_imageData":
                bool(
                    project.data
                        .get("floors", [{}])[0]
                        .get("imageData")
                )
                if project.data.get("floors")
                else False,

            "imageData_type":
                type(
                    project.data
                        .get("floors", [{}])[0]
                        .get("imageData")
                ).__name__
                if project.data.get("floors")
                else None,

            "imageData_length":
                len(
                    project.data
                        .get("floors", [{}])[0]
                        .get("imageData") or ""
                )
                if project.data.get("floors")
                else 0,

            "imageFileName":
                project.data
                    .get("floors", [{}])[0]
                    .get("imageFileName")
                if project.data.get("floors")
                else None
        }
    )

    return {
        "id": project.id,
        "name": project.name,
        "data": project.data,
    }


# =====================
# DELETE PROJECT
# =====================


@router.delete("/project/{project_id}")
def delete_project(
    project_id: int,
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:

        raise HTTPException(
            404,
            "Project not found",
        )

    if project.user_id != current_user.id:

        raise HTTPException(
            403,
            "Forbidden",
        )

    db.delete(project)

    db.commit()

    return {
        "status": "deleted",
    }


@router.get("/project/{project_id}/versions")
def get_versions(
    project_id: int,
    current_user=Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            404,
            "Project not found",
        )

    if project.user_id != current_user.id:
        raise HTTPException(
            403,
            "Forbidden",
        )

    versions = (
        db.query(ProjectVersion)
        .filter(
            ProjectVersion.project_id == project_id
        )
        .all()
    )

    return [
        {
            "id": v.id,
        }
        for v in versions
    ]

# =====================
# RENAME PROJECT
# =====================


@router.patch("/project/{project_id}")
def rename_project(
    project_id: int,
    body: dict,
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    project = (
        db.query(Project)
        .filter(
            Project.id ==
            project_id
        )
        .first()
    )


    if not project:

        raise HTTPException(
            404,
            "Project not found",
        )


    # =====================
    # OWNERSHIP CHECK
    # =====================

    if (
        project.user_id !=
        current_user.id
    ):

        raise HTTPException(
            403,
            "Forbidden",
        )


    # =====================
    # VALIDATE NAME
    # =====================

    new_name = (
        body.get("name")
        or ""
    )

    new_name = str(
        new_name
    ).strip()


    if not new_name:

        raise HTTPException(
            400,
            "Project name is required",
        )


    if len(new_name) > 120:

        raise HTTPException(
            400,
            "Project name is too long",
        )


    # =====================
    # UPDATE NAME
    # =====================

    project.name = new_name


    # Keep name synchronized
    # inside project data.

    if isinstance(
        project.data,
        dict
    ):

        project.data["name"] = (
            new_name
        )


    db.commit()

    db.refresh(project)


    print(
        "\n✏️ PROJECT RENAMED",
        {
            "project_id":
                project.id,

            "name":
                project.name,
        }
    )


    return {
        "id":
            project.id,

        "name":
            project.name,
    }

