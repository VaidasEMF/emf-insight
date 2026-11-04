from sqlalchemy.orm import Session

from auth.dependencies import (
    get_current_user,
    get_db,
)

from models.project import Project

from models.project_version import ProjectVersion

from datetime import datetime, timezone


from sqlalchemy import func

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
)

from pathlib import Path
from storage import supabase

from fastapi.responses import StreamingResponse
from io import BytesIO

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
        db.query(
            Project.id,
            Project.name,

            func.coalesce(
                Project.data["type"].as_string(),
                Project.data["project_type"].as_string(),
                Project.data["projectType"].as_string(),
                ""
            ).label("project_type"),

            Project.data["propertyId"].as_string().label("property_id"),
            Project.data["propertyHealthRecordId"].as_string().label("property_health_record_id"),
            Project.data["propertyType"].as_string().label("property_type"),
            Project.data["country"].as_string().label("country"),
            Project.data["city"].as_string().label("city"),
            Project.data["postalCode"].as_string().label("postal_code"),
            Project.data["address"].as_string().label("address"),
            Project.data["unit"].as_string().label("unit"),

            Project.created_at,
            Project.updated_at,
        )
        .filter(
            Project.user_id == current_user.id
        )
        .all()
    )

    result = []

    for p in projects:

        result.append({
            "id": p.id,
            "name": p.name,
            "type": p.project_type,

            "property_id": p.property_id,
            "property_health_record_id": p.property_health_record_id,
            "property_type": p.property_type,

            "country": p.country,
            "city": p.city,
            "postal_code": p.postal_code,
            "address": p.address,
            "unit": p.unit,

            "created_at": (
                p.created_at.isoformat()
                if p.created_at
                else None
            ),

            "updated_at": (
                p.updated_at.isoformat()
                if p.updated_at
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
    # =====================
    # LOAD PROJECT
    # =====================

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
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

    if project.user_id != current_user.id:

        raise HTTPException(
            403,
            "Forbidden",
        )

    return {
        "id": project.id,
        "name": project.name,
        "data": project.data,
    }


# =====================
# UPLOAD FLOOR PLAN
# =====================

@router.post("/project/{project_id}/floors/{floor_id}/plan")
async def upload_floor_plan(
    project_id: int,
    floor_id: str,
    plan_version_id: str = Form(...),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # =====================
    # FIND PROJECT
    # =====================

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # =====================
    # OWNERSHIP CHECK
    # =====================

    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden",
        )

    # =====================
    # FIND FLOOR
    # =====================

    project_data = project.data

    if not isinstance(project_data, dict):
        raise HTTPException(
            status_code=400,
            detail="Invalid project data",
        )

    floors = project_data.get("floors", [])

    if not isinstance(floors, list):
        raise HTTPException(
            status_code=400,
            detail="Invalid floors data",
        )

    print("[FLOOR PLAN DEBUG]", {
        "requested_floor_id": floor_id,
        "backend_floor_ids": [
            f.get("id")
            for f in floors
            if isinstance(f, dict)
        ]
    })

    floor_index = next(
        (
            i for i, floor in enumerate(floors)
            if isinstance(floor, dict)
            and str(floor.get("id")) == floor_id
        ),
        None,
    )

    if floor_index is None:
        raise HTTPException(
            status_code=404,
            detail="Floor not found",
        )

    # =====================
    # VALIDATE FILE
    # =====================

    content_type = file.content_type or ""

    allowed_types = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/webp": ".webp",
    }

    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format",
        )

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="Empty file",
        )

    max_size = 50 * 1024 * 1024

    if len(file_content) > max_size:
        raise HTTPException(
            status_code=413,
            detail="File exceeds 50 MB limit",
        )

    # =====================
    # STORAGE PATH
    # =====================

    extension = allowed_types[content_type]

    storage_path = (
        f"{project_id}/{floor_id}/{plan_version_id}/floor-plan{extension}"
    )

    # =====================
    # UPLOAD TO SUPABASE
    # =====================

    try:

        supabase.storage.from_("floor-plans").upload(
            storage_path,
            file_content,
            file_options={
                "content-type": content_type,
                "upsert": "false",
            },
        )

    except Exception as err:

        print(
            "[FLOOR PLAN STORAGE ERROR]",
            str(err),
        )

        raise HTTPException(
            status_code=502,
            detail="Floor plan upload failed",
        )

    # =====================
    # UPDATE PROJECT DATA
    # =====================

    updated_data = dict(project_data)

    updated_floors = list(floors)

    updated_floor = dict(
        updated_floors[floor_index]
    )

    updated_floor["imagePath"] = storage_path
    updated_floor["imageFileName"] = file.filename
    updated_floor["imageFileSize"] = len(file_content)

    updated_floors[floor_index] = updated_floor

    updated_data["floors"] = updated_floors

    project.data = updated_data
    project.updated_at = datetime.now(timezone.utc)

    # =====================
    # COMMIT FLOOR METADATA
    # =====================

    try:

        db.commit()

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Floor plan metadata save failed",
        )

    return {
        "status": "ok",
        "project_id": project.id,
        "floor_id": floor_id,
        "imagePath": storage_path,
        "file_size": len(file_content),
    }

# =====================
# DOWNLOAD FLOOR PLAN
# =====================

@router.get("/project/{project_id}/floors/{floor_id}/plan")
def download_floor_plan(
    project_id: int,
    floor_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # FIND PROJECT
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # OWNERSHIP CHECK
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden",
        )

    # FIND FLOOR
    project_data = project.data

    floors = (
        project_data.get("floors", [])
        if isinstance(project_data, dict)
        else []
    )

    floor = next(
        (
            item for item in floors
            if isinstance(item, dict)
            and str(item.get("id")) == floor_id
        ),
        None,
    )

    if floor is None:
        raise HTTPException(
            status_code=404,
            detail="Floor not found",
        )

    # GET STORAGE PATH
    image_path = floor.get("imagePath")

    if not image_path:
        raise HTTPException(
            status_code=404,
            detail="Floor plan not found",
        )

    # DOWNLOAD FROM SUPABASE
    try:
        file_content = (
            supabase.storage
            .from_("floor-plans")
            .download(image_path)
        )

    except Exception as err:
        print("[FLOOR PLAN DOWNLOAD ERROR]", str(err))

        raise HTTPException(
            status_code=502,
            detail="Floor plan download failed",
        )

    # DETERMINE CONTENT TYPE
    extension = Path(image_path).suffix.lower()

    content_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }

    content_type = content_types.get(
        extension,
        "application/octet-stream",
    )

    return StreamingResponse(
        BytesIO(file_content),
        media_type=content_type,
        headers={
            "Content-Disposition": "inline",
            "Cache-Control": "private, no-store",
        },
    )


# =====================
# DOWNLOAD FLOOR PLAN VERSION
# =====================

@router.get(
    "/project/{project_id}/floors/{floor_id}/plan-versions/{version_id}/plan"
)
def download_floor_plan_version(
    project_id: int,
    floor_id: str,
    version_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # FIND PROJECT
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # OWNERSHIP CHECK
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden",
        )

    # FIND FLOOR
    project_data = project.data

    floors = (
        project_data.get("floors", [])
        if isinstance(project_data, dict)
        else []
    )

    floor = next(
        (
            item for item in floors
            if isinstance(item, dict)
            and str(item.get("id")) == floor_id
        ),
        None,
    )

    if floor is None:
        raise HTTPException(
            status_code=404,
            detail="Floor not found",
        )

    # FIND PLAN VERSION
    versions = floor.get("planVersions", [])

    version = next(
        (
            item for item in versions
            if isinstance(item, dict)
            and str(item.get("id")) == version_id
        ),
        None,
    )

    if version is None:
        raise HTTPException(
            status_code=404,
            detail="Plan version not found",
        )

    # GET VERSION IMAGE PATH
    plan = version.get("plan", {})
    image_path = (
        plan.get("imagePath")
        if isinstance(plan, dict)
        else None
    )

    if not image_path:
        raise HTTPException(
            status_code=404,
            detail="Plan version image not found",
        )

    # DOWNLOAD FROM SUPABASE
    try:
        file_content = (
            supabase.storage
            .from_("floor-plans")
            .download(image_path)
        )

    except Exception as err:
        print(
            "[FLOOR PLAN VERSION DOWNLOAD ERROR]",
            str(err),
        )

        raise HTTPException(
            status_code=502,
            detail="Plan version download failed",
        )

    # DETERMINE CONTENT TYPE
    extension = Path(image_path).suffix.lower()

    content_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }

    content_type = content_types.get(
        extension,
        "application/octet-stream",
    )

    return StreamingResponse(
        BytesIO(file_content),
        media_type=content_type,
        headers={
            "Content-Disposition": "inline",
            "Cache-Control": "private, no-store",
        },
    )



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
    project.updated_at = datetime.now(timezone.utc)

    if isinstance(project.data, dict):
        project_data = dict(project.data)
        project_data["name"] = new_name
        project.data = project_data

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

