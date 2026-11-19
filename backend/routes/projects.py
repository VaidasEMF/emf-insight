from sqlalchemy.orm import Session

from auth.dependencies import (
    get_current_user,
    get_db,
)

from models.project import Project

from models.property import Property
from models.property_health_record import PropertyHealthRecord
from models.assessment import Assessment
from services.professional_assessment_access import (
    get_professional_project_access,
    require_active_edit,
)

from models.project_version import ProjectVersion

from datetime import datetime, timezone

import uuid

from sqlalchemy import func, text

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

# ==================================================
# PROFESSIONAL DASHBOARD — MY ASSESSMENTS
# ==================================================

@router.get("/professional-assessments/mine")
def get_my_professional_assessments(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if getattr(current_user, "role", None) != "professional":
        raise HTTPException(
            status_code=403,
            detail="Professional account required.",
        )

    assessments = db.execute(
        text("""
            SELECT
                a.id AS assessment_id,
                a.assessment_uid,
                a.display_reference,
                a.assessment_type,
                a.status AS assessment_status,
                a.property_id,
                a.project_id,
                a.professional_request_id AS request_id,
                a.created_at,
                a.updated_at,

                p.property_reference,

                EXISTS (
    SELECT 1
    FROM professional_request_contacts assessment_unlock
    WHERE assessment_unlock.id = a.professional_request_contact_id
      AND assessment_unlock.request_id = a.professional_request_id
      AND assessment_unlock.professional_user_id = :user_id
      AND assessment_unlock.expires_at > CURRENT_TIMESTAMP
) AS has_active_unlock,

                (
    SELECT assessment_unlock.expires_at
    FROM professional_request_contacts assessment_unlock
    WHERE assessment_unlock.id = a.professional_request_contact_id
      AND assessment_unlock.request_id = a.professional_request_id
      AND assessment_unlock.professional_user_id = :user_id
    LIMIT 1
) AS unlock_expires_at

            FROM assessments a

            JOIN professional_requests pr
              ON pr.id = a.professional_request_id

            JOIN properties p
              ON p.id = a.property_id

            WHERE a.assessment_type = 'professional'
              AND a.project_id = CAST(pr.project_id AS INTEGER)
              AND a.professional_user_id = :user_id

              AND EXISTS (
                  SELECT 1
                  FROM professional_request_contacts prc
                  WHERE prc.request_id = pr.id
                    AND prc.professional_user_id = :user_id
              )

            ORDER BY a.updated_at DESC
        """),
        {
            "user_id": str(current_user.id),
        },
    ).mappings().all()

    return {
        "success": True,
        "assessments": [
            {
                "assessment_id": item["assessment_id"],
                "assessment_uid": item["assessment_uid"],
                "display_reference": item["display_reference"],
                "assessment_type": item["assessment_type"],
                "assessment_status": item["assessment_status"],
                "property_id": item["property_id"],
                "property_reference": item["property_reference"],
                "project_id": item["project_id"],
                "request_id": item["request_id"],
                "created_at": item["created_at"],
                "updated_at": item["updated_at"],
                "has_active_unlock": bool(item["has_active_unlock"]),
                "unlock_status": (
                    "active"
                    if item["has_active_unlock"]
                    else "expired"
                ),
                "unlock_expires_at": item["unlock_expires_at"],
            }
            for item in assessments
        ],
    }



# ==================================================
# PROFESSIONAL DASHBOARD — CLIENT PROPERTIES
# ==================================================

@router.get("/professional-properties/mine")
def get_my_professional_properties(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if getattr(current_user, "role", None) != "professional":
        raise HTTPException(
            status_code=403,
            detail="Professional account required.",
        )

    rows = db.execute(
        text("""
            SELECT
                p.id AS property_id,
                p.property_reference,
                p.name AS property_name,
                p.address,
                p.city,
                p.country,

                a.id AS assessment_id,
                a.assessment_uid,
                a.display_reference,
                a.status AS assessment_status,
                a.project_id AS project_id,
                a.client_project_id AS client_project_id,
professional_project.id AS matched_professional_project_id,
                professional_project.name AS assessment_project_name,
                a.professional_request_id AS request_id,
                a.created_at AS assessment_created_at,
                a.updated_at AS assessment_updated_at,

                EXISTS (
    SELECT 1
    FROM professional_request_contacts active_unlock
    WHERE active_unlock.id = a.professional_request_contact_id
      AND active_unlock.request_id = a.professional_request_id
      AND active_unlock.professional_user_id = :user_id
      AND active_unlock.expires_at > CURRENT_TIMESTAMP
) AS has_active_unlock,

                (
    SELECT history_unlock.expires_at
    FROM professional_request_contacts history_unlock
    WHERE history_unlock.id = a.professional_request_contact_id
      AND history_unlock.request_id = a.professional_request_id
      AND history_unlock.professional_user_id = :user_id
    LIMIT 1
) AS unlock_expires_at

            FROM assessments a

            JOIN professional_requests pr
                ON pr.id = a.professional_request_id

            JOIN properties p
                ON p.id = a.property_id

                LEFT JOIN projects professional_project
    ON professional_project.id = a.client_project_id

            WHERE a.assessment_type = 'professional'
              AND a.professional_user_id = :user_id
              AND a.project_id = CAST(pr.project_id AS INTEGER)
              AND p.owner_user_id = CAST(pr.user_id AS INTEGER)

              AND EXISTS (
    SELECT 1
    FROM professional_request_contacts prc
    WHERE prc.id = a.professional_request_contact_id
      AND prc.request_id = a.professional_request_id
      AND prc.professional_user_id = :user_id
      AND prc.expires_at > CURRENT_TIMESTAMP
)

            ORDER BY
                p.id,
                a.updated_at DESC
        """),
        {
            "user_id": str(current_user.id),
        },
    ).mappings().all()

    properties = {}

    for item in rows:

        property_id = item["property_id"]

        if property_id not in properties:
            properties[property_id] = {
                "property_id": property_id,
                "property_reference": item["property_reference"],
                "property_name": item["property_name"],
                "address": item["address"],
                "city": item["city"],
                "country": item["country"],
                "has_active_unlock": False,
                "assessments": [],
            }

        has_active_unlock = bool(item["has_active_unlock"])

        if has_active_unlock:
            properties[property_id]["has_active_unlock"] = True

        properties[property_id]["assessments"].append({
            "assessment_id": item["assessment_id"],
            "assessment_uid": item["assessment_uid"],
            "display_reference": item["display_reference"],
            "assessment_status": item["assessment_status"],
            "project_id": item["project_id"],
            "client_project_id": item["client_project_id"],
"matched_professional_project_id": item["matched_professional_project_id"],
            "assessment_project_name": item["assessment_project_name"],
            "request_id": item["request_id"],
            "has_active_unlock": has_active_unlock,
            "unlock_status": (
                "active" if has_active_unlock else "expired"
            ),
            "unlock_expires_at": item["unlock_expires_at"],
            "created_at": item["assessment_created_at"],
            "updated_at": item["assessment_updated_at"],
        })

    return {
        "success": True,
        "properties": list(properties.values()),
    }


# =====================
# CREATE PROJECT
# =====================


@router.post("/projects")
def create_project(
    body: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    project_name = body.get("name") or "Project"

    project_data = (
        body.get("data")
        if isinstance(body.get("data"), dict)
        else {}
    )

    project_type = (
        body.get("type")
        or project_data.get("type")
        or project_data.get("projectType")
        or ""
    )

    if project_type:
        project_data["type"] = project_type
        project_data["projectType"] = project_type

    project_data["name"] = project_name

    try:
        project = Project(
            name=project_name,
            data=project_data,
            user_id=current_user.id,
        )

        db.add(project)
        db.flush()

        property_record = None
        health_record = None
        assessment = None

        # ==========================================
        # HOME PROPERTY / PHR / ASSESSMENT
        # ==========================================

        if project_type == "home":

            property_uid = project_data.get("propertyId")
            phr_uid = project_data.get("propertyHealthRecordId")
            assessment_uid = project_data.get("assessmentId")

            if not property_uid or not assessment_uid:
                raise HTTPException(
                    status_code=400,
                    detail="Home project is missing Property or Assessment ID",
                )

            # ======================================
            # PROPERTY
            # ======================================

            property_record = (
                db.query(Property)
                .filter(Property.property_uid == property_uid)
                .first()
            )

            if property_record:

                if property_record.owner_user_id != current_user.id:
                    raise HTTPException(
                        status_code=403,
                        detail="Property belongs to another user",
                    )

            else:

                property_record = Property(
                    property_uid=property_uid,
                    owner_user_id=current_user.id,
                    name=project_name,
                    address=project_data.get("address"),
                    country=project_data.get("country"),
                    city=project_data.get("city"),
                )

                db.add(property_record)
                db.flush()

                if not property_record.property_reference:
                    created_year = (
                        property_record.created_at.year
                        if property_record.created_at
                        else datetime.now(timezone.utc).year
                    )

                    property_record.property_reference = (
                        f"PROP-{created_year}-{property_record.id:06d}"
                    )

            # ======================================
            # PROPERTY HEALTH RECORD
            # ======================================

            health_record = (
                db.query(PropertyHealthRecord)
                .filter(
                    PropertyHealthRecord.property_id == property_record.id
                )
                .first()
            )

            if health_record:

                if phr_uid and health_record.phr_uid != phr_uid:
                    raise HTTPException(
                        status_code=409,
                        detail="Property already has a different PHR ID",
                    )

                phr_uid = health_record.phr_uid

            else:

                if not phr_uid:
                    phr_uid = f"phr_{uuid.uuid4().hex}"

                health_record = PropertyHealthRecord(
                    phr_uid=phr_uid,
                    property_id=property_record.id,
                    record_data={},
                )

                db.add(health_record)
                db.flush()

                if not health_record.phr_reference:
                    created_year = (
                        health_record.created_at.year
                        if health_record.created_at
                        else datetime.now(timezone.utc).year
                    )

                    health_record.phr_reference = (
                        f"PHR-{created_year}-{health_record.id:06d}"
                    )

            # Store canonical PHR ID in project data
            project_data["propertyHealthRecordId"] = health_record.phr_uid
            project.data = project_data

            # ======================================
            # ASSESSMENT
            # ======================================

            existing_assessment = (
                db.query(Assessment)
                .filter(
                    Assessment.assessment_uid == assessment_uid
                )
                .first()
            )

            if existing_assessment:
                raise HTTPException(
                    status_code=409,
                    detail="Assessment ID already exists",
                )

            assessment = Assessment(
                assessment_uid=assessment_uid,
                property_id=property_record.id,
                property_health_record_id=health_record.id,
                project_id=project.id,
                assessment_type="home",
                status="draft",
                assessment_data={},
            )

            db.add(assessment)

        # ==========================================
        # COMMIT
        # ==========================================

        db.commit()
        db.refresh(project)

    except Exception:
        db.rollback()
        raise

    print(
        "PROJECT CREATED",
        {
            "project_id": project.id,
            "name": project.name,
            "type": project.data.get("type"),
            "property_id": project.data.get("propertyId"),
            "phr_id": project.data.get("propertyHealthRecordId"),
            "assessment_id": project.data.get("assessmentId"),
        }
    )

    return {
        "project_id": project.id,
        "name": project.name,
        "type": project.data.get("type", ""),
        "propertyId": project.data.get("propertyId"),
        "propertyHealthRecordId": project.data.get(
            "propertyHealthRecordId"
        ),
        "assessmentId": project.data.get("assessmentId"),
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

        Assessment.project_id.label("client_home_project_id"),

        Project.created_at,
        Project.updated_at,
    )
    .outerjoin(
        Assessment,
        Assessment.client_project_id == Project.id
    )
        .filter(
        Project.user_id == current_user.id,
        Assessment.id.is_(None)
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
            "client_home_project_id": p.client_home_project_id,

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
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # LOAD PROJECT
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(404, "Project not found")

    # OWNERSHIP CHECK
    if project.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")

    # =====================
    # PROFESSIONAL ASSESSMENT ACCESS CONTROL
    # READ ACCESS
    # =====================

    professional_access = get_professional_project_access(
        db=db,
        current_user=current_user,
        project_id=project.id,
    )
    project_data = dict(project.data or {})

    # Database Project.id is the canonical project identity
    project_data["id"] = project.id
    project_data["project_id"] = project.id

    response = {
        "id": project.id,
        "name": project.name,
        "data": project_data,
    }

    if professional_access is not None:
        response["access_mode"] = professional_access["access_mode"]
        response["has_active_unlock"] = professional_access["has_active_unlock"]

        assessment = professional_access["assessment"]

        response["professional_assessment"] = {
            "id": assessment.id,
            "request_id": assessment.professional_request_id,
            "display_reference": assessment.display_reference,
        }
    # HOME PROPERTY HEALTH RECORD
    if project_data.get("type") == "home":

        property_uid = project_data.get("propertyId")

        if property_uid:
            property_record = (
                db.query(Property)
                .filter(
                    Property.property_uid == property_uid,
                    Property.owner_user_id == current_user.id,
                )
                .first()
            )

            if property_record:
                health_record = (
                    db.query(PropertyHealthRecord)
                    .filter(
                        PropertyHealthRecord.property_id == property_record.id
                    )
                    .first()
                )

                response["property"] = {
                    "id": property_record.property_uid,
                    "propertyReference": property_record.property_reference,
                    "name": property_record.name,
                    "address": property_record.address,
                    "city": property_record.city,
                    "country": property_record.country,
                    "createdAt": (
                        property_record.created_at.isoformat()
                        if property_record.created_at else None
                    ),
                }

                if health_record:
                    response["propertyHealthRecord"] = {
                        "id": health_record.phr_uid,
                        "phrReference": health_record.phr_reference,
                        "status": health_record.status,
                        "recordData": health_record.record_data or {},
                        "createdAt": (
                            health_record.created_at.isoformat()
                            if health_record.created_at else None
                        ),
                        "updatedAt": (
                            health_record.updated_at.isoformat()
                            if health_record.updated_at else None
                        ),
                    }

                    assessments = (
                        db.query(Assessment)
                        .filter(
                            Assessment.property_health_record_id == health_record.id,
                            Assessment.property_id == property_record.id,
                        )
                        .order_by(Assessment.created_at.desc())
                        .all()
                    )

                    response["assessments"] = [
                        {
                            "id": item.assessment_uid,
                            "type": item.assessment_type,
                            "status": item.status,
                            "data": item.assessment_data or {},
                            "createdAt": (
                                item.created_at.isoformat()
                                if item.created_at else None
                            ),
                            "updatedAt": (
                                item.updated_at.isoformat()
                                if item.updated_at else None
                            ),
                        }
                        for item in assessments
                    ]

    return response

# =====================
# HOME DEEPER ANALYSIS
# =====================

@router.post("/project/{project_id}/deeper-analysis")
def create_home_deeper_analysis(
    project_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
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

    # =====================
    # HOME WORKSPACE CHECK
    # =====================

    project_data = project.data or {}

    if project_data.get("type") != "home":
        raise HTTPException(
            400,
            "Deeper Analysis is available only for Home Wellness projects",
        )

    # =====================
    # €49 ENTITLEMENT CHECK
    # =====================

    entitlement = db.execute(
        text("""
            SELECT
                t.id AS transaction_id,
                t.usage_status
            FROM home_wellness_entitlements e
            INNER JOIN home_wellness_transactions t
                ON t.user_id = e.user_id
                AND t.project_id = e.project_id
                AND t.product_key = 'home_deeper_first'
                AND t.status = 'completed'
            WHERE e.project_id = :project_id
                AND e.user_id = :user_id
                AND e.entitlement_type = 'deeper_analysis'
                AND e.status = 'active'
                AND (
                    e.starts_at IS NULL
                    OR e.starts_at <= CURRENT_TIMESTAMP
                )
            ORDER BY e.created_at DESC, t.created_at DESC
            LIMIT 1
        """),
        {
            "project_id": str(project_id),
            "user_id": str(current_user.id),
        },
    ).first()

    if not entitlement:
        raise HTTPException(
            403,
            "Deeper Analysis purchase required",
        )

    if entitlement.usage_status == "used":
        raise HTTPException(
            409,
            "Deeper Analysis has already been used",
        )

    # =====================
    # RUN ANALYSIS
    # =====================

    from engine.analysis.home.deeper_analysis import (
        run_deeper_analysis,
    )

    result = run_deeper_analysis(project_data)

    if not result.get("success"):
        raise HTTPException(
            422,
            detail={
                "message": "Deeper Analysis could not be completed",
                "errors": result.get("errors", []),
                "warnings": result.get("warnings", []),
            },
        )

    return {
        "status": "ok",
        "project_id": project_id,
        "analysis": result.get("analysis"),
        "warnings": result.get("warnings", []),
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
    # PROFESSIONAL ASSESSMENT ACCESS CONTROL
    # =====================

    professional_access = get_professional_project_access(
        db=db,
        current_user=current_user,
        project_id=project.id,
    )

    # Frozen Draft is allowed to download its own plan.
    # Only project ownership and Assessment linkage are validated.
    # No active Unlock is required for read access.s

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

    # =====================
    # PROFESSIONAL ASSESSMENT ACCESS CONTROL
    # READ ACCESS
    # =====================

    professional_access = get_professional_project_access(
        db=db,
        current_user=current_user,
        project_id=project.id,
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

    # =====================
    # PROTECT PROFESSIONAL ASSESSMENT HISTORY
    # =====================

    professional_access = get_professional_project_access(
        db=db,
        current_user=current_user,
        project_id=project.id,
    )

    if professional_access is not None:
        raise HTTPException(
            status_code=403,
            detail=(
                "Professional Projects linked to Assessments "
                "cannot be deleted through this endpoint."
            ),
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

    # =====================
    # PROFESSIONAL ASSESSMENT READ ACCESS
    # =====================

    professional_access = get_professional_project_access(
        db=db,
        current_user=current_user,
        project_id=project.id,
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
    # PROFESSIONAL ASSESSMENT ACCESS CONTROL
    # =====================

    professional_access = get_professional_project_access(
        db=db,
        current_user=current_user,
        project_id=project.id,
    )

    if professional_access is not None:
        require_active_edit(professional_access)

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

