from sqlalchemy.orm import Session

from auth.dependencies import (
    get_current_user,
    get_db,
)

from models.project import Project

from models.property import Property
from models.property_health_record import PropertyHealthRecord
from models.assessment import Assessment
from models.home_deeper_analysis import HomeDeeperAnalysis
from engine.deeper_analysis_pdf import (
    build_deeper_analysis_pdf,
)
from services.professional_assessment_access import (
    get_professional_project_access,
    require_active_edit,
)

from models.project_version import ProjectVersion

from datetime import datetime, timezone

import uuid

import math

from sqlalchemy import func, text

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    Body,
)

from pathlib import Path
from storage import supabase

from fastapi.responses import StreamingResponse
from io import BytesIO

from models.measurement_cycle import MeasurementCycle
from models.measurement_cycle_floor import MeasurementCycleFloor
from models.measurement_cycle_data import MeasurementCycleData

from sqlalchemy.orm.attributes import flag_modified

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

            # Link Home Project to its canonical Property
            project.property_id = property_record.id

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

            project.data = dict(project_data)
            flag_modified(project, "data")

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

    home_phr_access_active = False

    if project_data.get("type") == "home":
        phr_access = db.execute(
            text("""
                SELECT EXISTS (
                    SELECT 1
                    FROM home_wellness_entitlements e
                    WHERE e.project_id = :project_id
                      AND e.user_id = :user_id
                      AND e.entitlement_type IN (
                          'simple_report',
                          'measure_monthly'
                      )
                      AND e.status = 'active'
                      AND (
                          e.starts_at IS NULL
                          OR e.starts_at <= CURRENT_TIMESTAMP
                      )
                      AND (
                          e.expires_at IS NULL
                          OR e.expires_at > CURRENT_TIMESTAMP
                      )
                )
            """),
            {
                "project_id": str(project.id),
                "user_id": str(current_user.id),
            },
        ).scalar()

        home_phr_access_active = bool(phr_access)

    # Database Project.id is the canonical project identity
    project_data["id"] = project.id
    project_data["project_id"] = project.id
    response = {
        "id": project.id,
        "name": project.name,
        "data": project_data,
        "phr_access_active": home_phr_access_active,
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
                        "recordData": (
                            health_record.record_data or {}
                            if home_phr_access_active
                            else {}
                        ),
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
                            Assessment.assessment_type == "home",
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
# HOME MEASUREMENT CYCLE
# =====================

@router.post("/project/{project_id}/measurement-cycles")
def create_measurement_cycle(
    project_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    try:

        # =====================
        # LOAD AND LOCK PROJECT
        # =====================

        project = (
            db.query(Project)
            .filter(Project.id == project_id)
            .with_for_update()
            .first()
        )

        if not project:
            raise HTTPException(404, "Project not found")

        if project.user_id != current_user.id:
            raise HTTPException(403, "Forbidden")

        project_data = project.data or {}

        if not isinstance(project_data, dict):
            raise HTTPException(
                422,
                "Invalid Home Project data",
            )

        if project_data.get("type") != "home":
            raise HTTPException(
                400,
                "Measurement Cycles are available only for Home Wellness projects",
            )

        # =====================
        # LOAD PROPERTY / PHR
        # =====================

        property_uid = project_data.get("propertyId")
        phr_uid = project_data.get("propertyHealthRecordId")

        if not property_uid or not phr_uid:
            raise HTTPException(
                400,
                "Home project is missing Property or PHR ID",
            )

        # Lock Property to serialize cycle numbering
        # across all Home Projects belonging to this Property.

        property_record = (
            db.query(Property)
            .filter(Property.property_uid == property_uid)
            .with_for_update()
            .first()
        )

        if not property_record:
            raise HTTPException(404, "Property not found")

        if property_record.owner_user_id != current_user.id:
            raise HTTPException(
                403,
                "Property belongs to another user",
            )

        # =====================
        # VERIFY PROPERTY HEALTH RECORD
        # =====================

        health_record = (
            db.query(PropertyHealthRecord)
            .filter(
                PropertyHealthRecord.property_id == property_record.id
            )
            .first()
        )

        if not health_record:
            raise HTTPException(
                404,
                "Property Health Record not found",
            )

        if health_record.phr_uid != phr_uid:
            raise HTTPException(
                409,
                "Property Health Record does not match the project",
            )

        # =====================
        # CHECK ACTIVE MEASUREMENT CYCLE
        # =====================

        active_cycle = (
            db.query(MeasurementCycle)
            .filter(
                MeasurementCycle.project_id == project_id,
                MeasurementCycle.status == "in_progress",
            )
            .first()
        )

        if active_cycle:
            raise HTTPException(
                409,
                "This Home Project already has an active Measurement Cycle",
            )

        # =====================
        # VALIDATE ALL PROPERTY FLOORS
        # =====================

        floors = project_data.get("floors", [])

        if not isinstance(floors, list) or not floors:
            raise HTTPException(
                400,
                "Property has no floors configured",
            )

        validated_floors = []
        seen_floor_ids = set()

        for floor in floors:

            if not isinstance(floor, dict):
                raise HTTPException(
                    422,
                    "Invalid floor configuration",
                )

            floor_id = floor.get("id")
            active_version_id = floor.get("activePlanVersionId")
            versions = floor.get("planVersions", [])

            if not floor_id:
                raise HTTPException(
                    422,
                    "A floor is missing its ID",
                )

            floor_id = str(floor_id)

            if floor_id in seen_floor_ids:
                raise HTTPException(
                    422,
                    f"Duplicate floor ID: {floor_id}",
                )

            seen_floor_ids.add(floor_id)

            if not active_version_id:
                raise HTTPException(
                    422,
                    f"Floor '{floor_id}' has no active Floor Plan version",
                )

            if not isinstance(versions, list):
                raise HTTPException(
                    422,
                    f"Floor '{floor_id}' has invalid plan version data",
                )

            active_version_id = str(active_version_id)

            active_version = next(
                (
                    version for version in versions
                    if isinstance(version, dict)
                    and str(version.get("id")) == active_version_id
                ),
                None,
            )

            if not active_version:
                raise HTTPException(
                    422,
                    f"Floor '{floor_id}' has an invalid active Floor Plan version",
                )

            validated_floors.append({
                "floor_id": floor_id,
                "plan_version_id": active_version_id,
            })

        # =====================
        # NEXT PROPERTY CYCLE NUMBER
        # =====================

        max_cycle_number = (
            db.query(func.max(MeasurementCycle.cycle_number))
            .filter(
                MeasurementCycle.property_id == property_record.id
            )
            .scalar()
        )

        next_cycle_number = (max_cycle_number or 0) + 1

        # =====================
        # CREATE MEASUREMENT CYCLE
        # =====================

        cycle = MeasurementCycle(
            cycle_uid=f"cycle_{uuid.uuid4().hex}",
            property_id=property_record.id,
            property_health_record_id=health_record.id,
            project_id=project_id,
            cycle_number=next_cycle_number,
            status="in_progress",
        )

        db.add(cycle)
        db.flush()

        # =====================
        # CREATE CYCLE FLOORS
        # =====================

        for floor_data in validated_floors:

            db.add(
                MeasurementCycleFloor(
                    measurement_cycle_id=cycle.id,
                    floor_id=floor_data["floor_id"],
                    plan_version_id=floor_data["plan_version_id"],
                )
            )

                    # =====================
        # CREATE INITIAL CYCLE DATA
        # =====================

        db.add(
            MeasurementCycleData(
                measurement_cycle_id=cycle.id,
                schema_version=1,
                data={
                    "schemaVersion": 1,
                    "floors": {},
                },
            )
        )

        # =====================
        # COMMIT
        # =====================

        db.commit()

        return {
            "status": "ok",
            "cycle_id": cycle.id,
            "cycle_uid": cycle.cycle_uid,
            "property_id": property_record.id,
            "property_health_record_id": health_record.id,
            "project_id": project_id,
            "cycle_number": cycle.cycle_number,
            "cycle_status": cycle.status,
            "floors": validated_floors,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise


# =================================================
# GET ACTIVE MEASUREMENT CYCLE
# =================================================

@router.get("/project/{project_id}/measurement-cycles/active")
def get_active_measurement_cycle(
    project_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
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

        # HOME PROJECT VALIDATION
        project_data = project.data or {}

        if not isinstance(project_data, dict):
            raise HTTPException(
                status_code=422,
                detail="Invalid project data",
            )

        if project_data.get("type") != "home":
            raise HTTPException(
                status_code=400,
                detail="Measurement Cycles are available only for Home Wellness projects",
            )

        # FIND ACTIVE MEASUREMENT CYCLE
        cycle = (
            db.query(MeasurementCycle)
            .filter(
                MeasurementCycle.project_id == project_id,
                MeasurementCycle.status == "in_progress",
            )
            .order_by(MeasurementCycle.cycle_number.desc())
            .first()
        )

        # NO ACTIVE CYCLE
        if not cycle:
            return {
                "status": "ok",
                "active_cycle": None,
            }

        # LOAD CYCLE FLOORS
        cycle_floors = (
            db.query(MeasurementCycleFloor)
            .filter(
                MeasurementCycleFloor.measurement_cycle_id == cycle.id
            )
            .order_by(MeasurementCycleFloor.id.asc())
            .all()
        )

        return {
            "status": "ok",
            "active_cycle": {
                "cycle_id": cycle.id,
                "cycle_uid": cycle.cycle_uid,
                "property_id": cycle.property_id,
                "property_health_record_id": cycle.property_health_record_id,
                "project_id": cycle.project_id,
                "cycle_number": cycle.cycle_number,
                "cycle_status": cycle.status,
                "started_at": cycle.started_at,
                "floors": [
                    {
                        "floor_id": floor.floor_id,
                        "plan_version_id": floor.plan_version_id,
                    }
                    for floor in cycle_floors
                ],
            },
        }

    except HTTPException:
        raise

    except Exception:
        raise

# =================================================
# GET ACTIVE MEASUREMENT CYCLE COMPLETION PREVIEW
# =================================================

@router.get(
    "/project/{project_id}/measurement-cycles/active/completion-preview"
)
def get_active_measurement_cycle_completion_preview(
    project_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
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

        # HOME PROJECT VALIDATION
        project_data = project.data or {}

        if not isinstance(project_data, dict):
            raise HTTPException(422, "Invalid project data")

        if project_data.get("type") != "home":
            raise HTTPException(
                400,
                "Measurement Cycles are available only for Home Wellness projects",
            )

        # LOAD ACTIVE CYCLE
        cycle = (
            db.query(MeasurementCycle)
            .filter(
                MeasurementCycle.project_id == project_id,
                MeasurementCycle.status == "in_progress",
            )
            .first()
        )

        if not cycle:
            return {
                "status": "ok",
                "active_cycle": None,
            }

        # LOAD CYCLE FLOOR LINKS
        cycle_floors = (
            db.query(MeasurementCycleFloor)
            .filter(
                MeasurementCycleFloor.measurement_cycle_id == cycle.id
            )
            .all()
        )

        expected_floor_ids = {
            str(item.floor_id)
            for item in cycle_floors
        }

        # LOAD CYCLE DATA
        cycle_data = (
            db.query(MeasurementCycleData)
            .filter(
                MeasurementCycleData.measurement_cycle_id == cycle.id
            )
            .first()
        )

        if not cycle_data or cycle_data.schema_version != 1:
            raise HTTPException(
                422,
                "Measurement Cycle data is missing or invalid",
            )

        document = cycle_data.data or {}

        if not isinstance(document, dict):
            raise HTTPException(
                422,
                "Invalid Measurement Cycle data document",
            )

        floors_data = document.get("floors")

        if not isinstance(floors_data, dict):
            raise HTTPException(
                422,
                "Measurement Cycle floors data is missing",
            )

        saved_floor_ids = {
            str(floor_id)
            for floor_id in floors_data.keys()
        }

        if saved_floor_ids != expected_floor_ids:
            raise HTTPException(
                status_code=409,
                detail="Measurement Cycle floor data is incomplete",
            )

        # CALCULATE COMPLETION WITHOUT MODIFYING CYCLE
        completion = _calculate_measurement_cycle_completion(
            floors_data
        )

        return {
            "status": "ok",
            "active_cycle": {
                "cycle_id": cycle.id,
                "cycle_number": cycle.cycle_number,
                "cycle_status": cycle.status,
                "eligible": completion["eligible"],
                "overall_percent": completion["overall_percent"],
                "measured_points": completion["measured_points"],
                "total_points": completion["total_points"],
                "areas": completion["areas"],
            },
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise

# =================================================
# GET MEASUREMENT CYCLE HISTORY
# =================================================

@router.get("/project/{project_id}/measurement-cycles")
def get_measurement_cycle_history(
    project_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
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

        # HOME PROJECT VALIDATION
        project_data = project.data or {}

        if not isinstance(project_data, dict):
            raise HTTPException(
                status_code=422,
                detail="Invalid project data",
            )

        if project_data.get("type") != "home":
            raise HTTPException(
                status_code=400,
                detail="Measurement Cycles are available only for Home Wellness projects",
            )

        # LOAD ALL PROJECT CYCLES
        cycles = (
            db.query(MeasurementCycle)
            .filter(
                MeasurementCycle.project_id == project_id
            )
            .order_by(
                MeasurementCycle.cycle_number.desc()
            )
            .all()
        )

        history = []

        for cycle in cycles:

            # LOAD SAVED CYCLE DATA
            cycle_data = (
                db.query(MeasurementCycleData)
                .filter(
                    MeasurementCycleData.measurement_cycle_id == cycle.id
                )
                .first()
            )

            # LOAD LINKED FLOORS
            cycle_floors = (
                db.query(MeasurementCycleFloor)
                .filter(
                    MeasurementCycleFloor.measurement_cycle_id == cycle.id
                )
                .order_by(
                    MeasurementCycleFloor.id.asc()
                )
                .all()
            )

            completion = None

            if (
                cycle_data
                and cycle_data.schema_version == 1
                and isinstance(cycle_data.data, dict)
            ):
                floors_data = cycle_data.data.get("floors")

                if isinstance(floors_data, dict):
                    completion = (
                        _calculate_measurement_cycle_completion(
                            floors_data
                        )
                    )

            history.append({
                "cycle_id": cycle.id,
                "cycle_uid": cycle.cycle_uid,
                "property_id": cycle.property_id,
                "property_health_record_id": cycle.property_health_record_id,
                "project_id": cycle.project_id,
                "cycle_number": cycle.cycle_number,
                "cycle_status": cycle.status,
                "started_at": cycle.started_at,
                "completed_at": cycle.completed_at,
                "floors": [
                    {
                        "floor_id": floor.floor_id,
                        "plan_version_id": floor.plan_version_id,
                    }
                    for floor in cycle_floors
                ],
                "completion": completion,
            })

        return {
            "status": "ok",
            "project_id": project_id,
            "total_cycles": len(history),
            "cycles": history,
        }

    except HTTPException:
        raise

    except Exception:
        raise


# =================================================
# GET ACTIVE MEASUREMENT CYCLE DATA
# =================================================

@router.get("/project/{project_id}/measurement-cycles/active/data")
def get_active_measurement_cycle_data(
    project_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
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

        # HOME PROJECT VALIDATION
        project_data = project.data or {}

        if not isinstance(project_data, dict):
            raise HTTPException(
                status_code=422,
                detail="Invalid project data",
            )

        if project_data.get("type") != "home":
            raise HTTPException(
                status_code=400,
                detail="Measurement Cycles are available only for Home Wellness projects",
            )

        # FIND ACTIVE CYCLE
        cycle = (
            db.query(MeasurementCycle)
            .filter(
                MeasurementCycle.project_id == project_id,
                MeasurementCycle.status == "in_progress",
            )
            .first()
        )

        if not cycle:
            return {
                "status": "ok",
                "active_cycle": None,
                "cycle_data": None,
            }

        # LOAD CYCLE DATA
        cycle_data = (
            db.query(MeasurementCycleData)
            .filter(
                MeasurementCycleData.measurement_cycle_id == cycle.id
            )
            .first()
        )

        if not cycle_data:
            return {
                "status": "ok",
                "active_cycle": {
                    "cycle_id": cycle.id,
                    "cycle_uid": cycle.cycle_uid,
                    "cycle_number": cycle.cycle_number,
                    "cycle_status": cycle.status,
                },
                "cycle_data": None,
            }

        return {
            "status": "ok",
            "active_cycle": {
                "cycle_id": cycle.id,
                "cycle_uid": cycle.cycle_uid,
                "cycle_number": cycle.cycle_number,
                "cycle_status": cycle.status,
            },
            "cycle_data": {
                "schema_version": cycle_data.schema_version,
                "data": cycle_data.data,
                "created_at": cycle_data.created_at,
                "updated_at": cycle_data.updated_at,
            },
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise

# =================================================
# PREVIEW ACTIVE MEASUREMENT CYCLE COMPLETION
# READ ONLY
# =================================================

@router.get(
    "/project/{project_id}/measurement-cycles/active/completion"
)
def preview_active_measurement_cycle_completion(
    project_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
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

        # HOME PROJECT VALIDATION
        project_data = project.data or {}

        if not isinstance(project_data, dict):
            raise HTTPException(
                status_code=422,
                detail="Invalid project data",
            )

        if project_data.get("type") != "home":
            raise HTTPException(
                status_code=400,
                detail="Measurement Cycles are available only for Home Wellness projects",
            )

        # FIND ACTIVE CYCLE
        cycle = (
            db.query(MeasurementCycle)
            .filter(
                MeasurementCycle.project_id == project_id,
                MeasurementCycle.status == "in_progress",
            )
            .first()
        )

        if not cycle:
            return {
                "status": "ok",
                "active_cycle": None,
                "completion": None,
                "read_only": True,
            }

        # LOAD LINKED FLOORS
        cycle_floors = (
            db.query(MeasurementCycleFloor)
            .filter(
                MeasurementCycleFloor.measurement_cycle_id == cycle.id
            )
            .all()
        )

        expected_floor_ids = {
            str(item.floor_id)
            for item in cycle_floors
        }

        if not expected_floor_ids:
            return {
                "status": "ok",
                "active_cycle": {
                    "cycle_id": cycle.id,
                    "cycle_number": cycle.cycle_number,
                    "cycle_status": cycle.status,
                },
                "completion": {
                    "eligible": False,
                    "reason": "No floors linked to this cycle",
                },
                "read_only": True,
            }

        # LOAD CYCLE DATA
        cycle_data = (
            db.query(MeasurementCycleData)
            .filter(
                MeasurementCycleData.measurement_cycle_id == cycle.id
            )
            .first()
        )

        if not cycle_data:
            return {
                "status": "ok",
                "active_cycle": {
                    "cycle_id": cycle.id,
                    "cycle_number": cycle.cycle_number,
                    "cycle_status": cycle.status,
                },
                "completion": {
                    "eligible": False,
                    "reason": "Measurement Cycle data not found",
                },
                "read_only": True,
            }

        if cycle_data.schema_version != 1:
            raise HTTPException(
                status_code=422,
                detail="Unsupported Measurement Cycle schema version",
            )

        document = cycle_data.data

        if not isinstance(document, dict):
            raise HTTPException(
                status_code=422,
                detail="Invalid Measurement Cycle data",
            )

        floors_data = document.get("floors")

        if not isinstance(floors_data, dict):
            raise HTTPException(
                status_code=422,
                detail="Measurement Cycle floors must be an object",
            )

        saved_floor_ids = {
            str(floor_id)
            for floor_id in floors_data.keys()
        }

        if saved_floor_ids != expected_floor_ids:
            return {
                "status": "ok",
                "active_cycle": {
                    "cycle_id": cycle.id,
                    "cycle_number": cycle.cycle_number,
                    "cycle_status": cycle.status,
                },
                "completion": {
                    "eligible": False,
                    "reason": "Saved floors do not match cycle floors",
                    "expected_floor_ids": sorted(expected_floor_ids),
                    "saved_floor_ids": sorted(saved_floor_ids),
                },
                "read_only": True,
            }

        # CALCULATE COMPLETION
        completion = _calculate_measurement_cycle_completion(
            floors_data
        )

        return {
            "status": "ok",
            "active_cycle": {
                "cycle_id": cycle.id,
                "cycle_uid": cycle.cycle_uid,
                "cycle_number": cycle.cycle_number,
                "cycle_status": cycle.status,
            },
            "completion": completion,
            "read_only": True,
        }

    except HTTPException:
        raise

    except Exception:
        # No database changes are performed by this endpoint.
        raise

# =================================================
# SAVE ACTIVE MEASUREMENT CYCLE DATA
# =================================================

@router.put("/project/{project_id}/measurement-cycles/active/data")
def save_active_measurement_cycle_data(
    project_id: int,
    payload: dict = Body(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # =====================
        # VALIDATE PAYLOAD
        # =====================

        if not isinstance(payload, dict):
            raise HTTPException(
                status_code=422,
                detail="Measurement Cycle data must be a JSON object",
            )

        schema_version = payload.get("schemaVersion")

        if schema_version != 1:
            raise HTTPException(
                status_code=422,
                detail="Unsupported Measurement Cycle schema version",
            )

        floors_data = payload.get("floors")

        if not isinstance(floors_data, dict):
            raise HTTPException(
                status_code=422,
                detail="Measurement Cycle floors must be an object",
            )

                # =====================
        # VALIDATE MEASUREMENT PROFILE
        # =====================

        measurement_profile = payload.get("homeMeasurementProfile")

        if not isinstance(measurement_profile, dict):
            raise HTTPException(
                status_code=422,
                detail="Measurement Cycle profile is missing or invalid",
            )

        measurement_types = measurement_profile.get("measurementTypes")

        supported_types = {"rf", "electric", "magnetic"}

        if (
            not isinstance(measurement_types, list)
            or not measurement_types
            or any(
                modality not in supported_types
                for modality in measurement_types
            )
            or len(measurement_types) != len(set(measurement_types))
        ):
            raise HTTPException(
                status_code=422,
                detail="Measurement Cycle modalities are missing or invalid",
            )

        # =====================
        # LOAD AND LOCK PROJECT
        # =====================

        project = (
            db.query(Project)
            .filter(Project.id == project_id)
            .with_for_update()
            .first()
        )

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        if project.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden",
            )

        project_data = project.data or {}

        if not isinstance(project_data, dict):
            raise HTTPException(
                status_code=422,
                detail="Invalid project data",
            )

        if project_data.get("type") != "home":
            raise HTTPException(
                status_code=400,
                detail="Measurement Cycles are available only for Home Wellness projects",
            )

        # =====================
        # LOAD AND LOCK ACTIVE CYCLE
        # =====================

        cycle = (
            db.query(MeasurementCycle)
            .filter(
                MeasurementCycle.project_id == project_id,
                MeasurementCycle.status == "in_progress",
            )
            .with_for_update()
            .first()
        )

        if not cycle:
            raise HTTPException(
                status_code=404,
                detail="No active Measurement Cycle found",
            )

        # =====================
        # VALIDATE FLOOR REFERENCES
        # =====================

        cycle_floors = (
            db.query(MeasurementCycleFloor)
            .filter(
                MeasurementCycleFloor.measurement_cycle_id == cycle.id
            )
            .all()
        )

        allowed_floor_ids = {
            str(floor.floor_id)
            for floor in cycle_floors
        }

        for floor_id in floors_data.keys():
            if str(floor_id) not in allowed_floor_ids:
                raise HTTPException(
                    status_code=422,
                    detail=f"Floor '{floor_id}' does not belong to this Measurement Cycle",
                )

        # =====================
        # LOAD OR CREATE DATA DOCUMENT
        # =====================

        cycle_data = (
            db.query(MeasurementCycleData)
            .filter(
                MeasurementCycleData.measurement_cycle_id == cycle.id
            )
            .with_for_update()
            .first()
        )

        if cycle_data:
            cycle_data.schema_version = schema_version
            cycle_data.data = payload

        else:
            cycle_data = MeasurementCycleData(
                measurement_cycle_id=cycle.id,
                schema_version=schema_version,
                data=payload,
            )

            db.add(cycle_data)

        # =====================
        # COMMIT
        # =====================

        db.commit()
        db.refresh(cycle_data)

        return {
            "status": "ok",
            "cycle_id": cycle.id,
            "cycle_number": cycle.cycle_number,
            "cycle_status": cycle.status,
            "schema_version": cycle_data.schema_version,
            "updated_at": cycle_data.updated_at,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise


def _generate_lifestyle_measurement_point_ids(zone, floor):
    """
    Mirrors frontend generateLifestyleMeasurementPoints().
    Returns expected measurement point IDs for one lifestyle zone.
    """

    if not isinstance(zone, dict) or not isinstance(floor, dict):
        return []

    try:
        zone_x = float(zone.get("x"))
        zone_y = float(zone.get("y"))
        scale = float(floor.get("currentScale"))

        dimensions = zone.get("measurementZoneDimensions") or {}

        if not isinstance(dimensions, dict):
            return []

        width = float(dimensions.get("width"))
        depth = float(dimensions.get("depth"))

    except (TypeError, ValueError):
        return []

    if not all(math.isfinite(value) for value in [
        zone_x, zone_y, scale, width, depth
    ]):
        return []

    if scale <= 0 or width <= 0 or depth <= 0:
        return []

    preset_key = (
        zone.get("lifestylePreset")
        or zone.get("lifestylePresetKey")
    )

    furniture = zone.get("furnitureDimensions") or {}

    if not isinstance(furniture, dict):
        furniture = {}

    try:
        furniture_width = float(furniture.get("width"))
        furniture_depth = float(furniture.get("depth"))
    except (TypeError, ValueError):
        furniture_width = 0
        furniture_depth = 0

    has_furniture_dimensions = (
        math.isfinite(furniture_width)
        and furniture_width > 0
        and math.isfinite(furniture_depth)
        and furniture_depth > 0
    )

    is_double_or_king = preset_key in ("double", "king")

    if is_double_or_king and has_furniture_dimensions:
        positions = [1, 2, 3]
    else:
        positions = [1, 2, 3, 4, 5]

    point_count = (
        5
        if zone.get("zoneType") == "child"
        and preset_key == "combined"
        else 3
    )

    return [
        f"measurement_{zone.get('id')}_{index}"
        for index in range(1, min(len(positions), point_count) + 1)
    ]


def _calculate_measurement_cycle_completion(floors_data):
    """
    Calculate Measurement Cycle completion using the
    existing Home Wellness eligibility rules.
    """

    lifestyle_types = {
        "sleep",
        "rest",
        "relax",
        "work",
        "child",
        # Legacy zone types
        "bed",
        "work_area",
        "child_area",
    }

    areas = []

    for floor_id, floor in floors_data.items():

        if not isinstance(floor, dict):
            continue

        zones = floor.get("zones") or []

        if not isinstance(zones, list):
            continue

        for zone in zones:

            if not isinstance(zone, dict):
                continue

            zone_type = (
                zone.get("zoneType")
                or zone.get("type")
            )

            if zone_type not in lifestyle_types:
                continue

            expected_point_ids = (
                _generate_lifestyle_measurement_point_ids(
                    zone,
                    floor,
                )
            )

            if not expected_point_ids:
                continue

            existing_points = zone.get("measurementPoints") or []

            if not isinstance(existing_points, list):
                existing_points = []

            existing_by_id = {
                str(point.get("id")): point
                for point in existing_points
                if isinstance(point, dict)
                and point.get("id") is not None
            }

            measured_count = sum(
                1
                for point_id in expected_point_ids
                if (
                    existing_by_id.get(point_id, {}).get("status")
                    == "measured"
                )
            )

            total_count = len(expected_point_ids)

            percent = int(
                math.floor(
                    (measured_count / total_count) * 100 + 0.5
                )
            )

            areas.append({
                "floor_id": str(floor_id),
                "zone_id": zone.get("id"),
                "type": zone_type,
                "total_points": total_count,
                "measured_points": measured_count,
                "percent": percent,
                "eligible": percent >= 50,
            })

    total_points = sum(
        area["total_points"] for area in areas
    )

    measured_points = sum(
        area["measured_points"] for area in areas
    )

    overall_percent = (
        int(math.floor(
            (measured_points / total_points) * 100 + 0.5
        ))
        if total_points > 0
        else 0
    )

    all_areas_eligible = (
        len(areas) > 0
        and all(area["eligible"] for area in areas)
    )

    eligible = (
        overall_percent >= 60
        and all_areas_eligible
    )

    return {
        "eligible": eligible,
        "overall_percent": overall_percent,
        "measured_points": measured_points,
        "total_points": total_points,
        "areas": areas,
    }


@router.post(
    "/project/{project_id}/measurement-cycles/active/complete"
)
def complete_active_measurement_cycle(
    project_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # =====================
        # LOAD AND LOCK PROJECT
        # =====================

        project = (
            db.query(Project)
            .filter(Project.id == project_id)
            .with_for_update()
            .first()
        )

        if not project:
            raise HTTPException(404, "Project not found")

        if project.user_id != current_user.id:
            raise HTTPException(403, "Forbidden")

        project_data = project.data or {}

        if not isinstance(project_data, dict):
            raise HTTPException(422, "Invalid project data")

        if project_data.get("type") != "home":
            raise HTTPException(
                400,
                "Measurement Cycles are available only for Home Wellness projects",
            )

        # =====================
        # LOAD AND LOCK ACTIVE CYCLE
        # =====================

        cycle = (
            db.query(MeasurementCycle)
            .filter(
                MeasurementCycle.project_id == project_id,
                MeasurementCycle.status == "in_progress",
            )
            .with_for_update()
            .first()
        )

        if not cycle:
            raise HTTPException(
                404,
                "No active Measurement Cycle found",
            )

        # =====================
        # LOAD CYCLE FLOOR LINKS
        # =====================

        cycle_floors = (
            db.query(MeasurementCycleFloor)
            .filter(
                MeasurementCycleFloor.measurement_cycle_id == cycle.id
            )
            .all()
        )

        expected_floor_ids = {
            str(item.floor_id)
            for item in cycle_floors
        }

        if not expected_floor_ids:
            raise HTTPException(
                422,
                "Measurement Cycle has no linked floors",
            )

        # =====================
        # LOAD AND LOCK CYCLE DATA
        # =====================

        cycle_data = (
            db.query(MeasurementCycleData)
            .filter(
                MeasurementCycleData.measurement_cycle_id == cycle.id
            )
            .with_for_update()
            .first()
        )

        if not cycle_data or cycle_data.schema_version != 1:
            raise HTTPException(
                422,
                "Measurement Cycle data is missing or invalid",
            )

        document = cycle_data.data or {}

        if not isinstance(document, dict):
            raise HTTPException(
                422,
                "Invalid Measurement Cycle data document",
            )

        floors_data = document.get("floors")

        if not isinstance(floors_data, dict):
            raise HTTPException(
                422,
                "Measurement Cycle floors data is missing",
            )

        saved_floor_ids = {
            str(floor_id)
            for floor_id in floors_data.keys()
        }

        if saved_floor_ids != expected_floor_ids:
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "Measurement Cycle does not contain data for all linked floors",
                    "expected_floor_ids": sorted(expected_floor_ids),
                    "saved_floor_ids": sorted(saved_floor_ids),
                },
            )
        # =====================
        # CALCULATE COMPLETION
        # =====================

        completion = _calculate_measurement_cycle_completion(
            floors_data
        )

        eligible = completion["eligible"]
        overall_percent = completion["overall_percent"]
        measured_points = completion["measured_points"]
        total_points = completion["total_points"]
        areas = completion["areas"]
        # =====================

        if not eligible:
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "Measurement Cycle has not reached the required completion threshold",
                    "overall_percent": overall_percent,
                    "required_overall_percent": 60,
                    "measured_points": measured_points,
                    "total_points": total_points,
                    "areas": areas,
                },
            )

        # =====================
        # COMPLETE CYCLE
        # =====================

        cycle.status = "completed"
        cycle.completed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(cycle)

        return {
            "status": "ok",
            "cycle_id": cycle.id,
            "cycle_number": cycle.cycle_number,
            "cycle_status": cycle.status,
            "completed_at": cycle.completed_at,
            "eligible": True,
            "overall_percent": overall_percent,
            "measured_points": measured_points,
            "total_points": total_points,
            "areas": areas,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise


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
        .with_for_update()
        .first()
    )

    if not project:
        raise HTTPException(404, "Project not found")

    # =====================
    # OWNERSHIP CHECK
    # =====================

    if project.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")

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
    # LOAD PROPERTY / PHR
    # =====================

    property_uid = project_data.get("propertyId")
    phr_uid = project_data.get("propertyHealthRecordId")

    if not property_uid or not phr_uid:
        raise HTTPException(
            409,
            "Home Project is missing Property or PHR ID",
        )

    property_record = (
        db.query(Property)
        .filter(Property.property_uid == property_uid)
        .first()
    )

    if not property_record:
        raise HTTPException(
            404,
            "Property not found",
        )

    if property_record.owner_user_id != current_user.id:
        raise HTTPException(
            403,
            "Property belongs to another user",
        )

    health_record = (
        db.query(PropertyHealthRecord)
        .filter(
            PropertyHealthRecord.property_id == property_record.id
        )
        .first()
    )

    if not health_record or health_record.phr_uid != phr_uid:
        raise HTTPException(
            409,
            "Property Health Record does not match the project",
        )

    try:
        # =====================
        # FIRST PURCHASE / ENTITLEMENT CHECK
        # =====================

        first_purchase_exists = db.execute(
            text("""
                SELECT EXISTS (
                    SELECT 1
                    FROM home_wellness_entitlements e
                    WHERE e.project_id = :project_id
                      AND e.user_id = :user_id
                      AND e.entitlement_type = 'deeper_analysis'
                      AND e.status = 'active'
                      AND (
                          e.starts_at IS NULL
                          OR e.starts_at <= CURRENT_TIMESTAMP
                      )
                      AND EXISTS (
                          SELECT 1
                          FROM home_wellness_transactions f
                          WHERE f.user_id = e.user_id
                            AND f.project_id = e.project_id
                            AND f.product_key = 'home_deeper_first'
                            AND f.status = 'completed'
                      )
                )
            """),
            {
                "project_id": str(project_id),
                "user_id": str(current_user.id),
            },
        ).scalar()

        if not first_purchase_exists:
            raise HTTPException(
                403,
                "Deeper Analysis purchase required",
            )

        # =====================
        # SELECT ONE UNUSED CREDIT
        # FIRST PURCHASE HAS PRIORITY
        # =====================

        credit = db.execute(
            text("""
                SELECT
                    t.id,
                    t.product_key,
                    t.stripe_session_id
                FROM home_wellness_transactions t
                WHERE t.user_id = :user_id
                  AND t.project_id = :project_id
                  AND t.status = 'completed'
                  AND t.usage_status = 'not_used'
                  AND t.product_key IN (
                      'home_deeper_first',
                      'home_deeper_repeat'
                  )
                ORDER BY
                    CASE
                        WHEN t.product_key = 'home_deeper_first'
                        THEN 0
                        ELSE 1
                    END,
                    t.created_at ASC,
                    t.id ASC
                LIMIT 1
                FOR UPDATE OF t
            """),
            {
                "user_id": str(current_user.id),
                "project_id": str(project_id),
            },
        ).first()

        if not credit:
            raise HTTPException(
                409,
                "No unused Deeper Analysis credits available",
            )

                # =====================
        # REPEAT ANALYSIS CYCLE
        # =====================

        measurement_cycle_id = None

        measurement_cycle_number = None
        coverage_percent = None

        if credit.product_key == "home_deeper_repeat":

            if not credit.stripe_session_id:
                raise HTTPException(
                    409,
                    "Repeat Analysis credit has no Stripe session reference",
                )

            # Find the exact completed reservation for this purchase.
            reservation = db.execute(
                text("""
                    SELECT
                        id,
                        measurement_cycle_id,
                        project_id,
                        property_id,
                        property_health_record_id,
                        user_id,
                        status,
                        stripe_session_id
                    FROM home_deeper_repeat_reservations
                    WHERE stripe_session_id = :stripe_session_id
                      AND status = 'completed'
                    FOR UPDATE
                """),
                {
                    "stripe_session_id": credit.stripe_session_id,
                },
            ).mappings().first()

            if not reservation:
                raise HTTPException(
                    409,
                    "Completed Repeat Analysis reservation not found",
                )

            if (
                str(reservation["user_id"]) != str(current_user.id)
                or reservation["project_id"] != project_id
                or reservation["property_id"] != property_record.id
                or reservation["property_health_record_id"] != health_record.id
            ):
                raise HTTPException(
                    409,
                    "Repeat Analysis reservation does not match this Property",
                )

            measurement_cycle_id = reservation["measurement_cycle_id"]

            if not measurement_cycle_id:
                raise HTTPException(
                    409,
                    "Repeat Analysis reservation has no Measurement Cycle",
                )

            # Load only the Measurement Cycle linked to this purchase.
            cycle = (
                db.query(MeasurementCycle)
                .filter(
                    MeasurementCycle.id == measurement_cycle_id,
                    MeasurementCycle.project_id == project_id,
                    MeasurementCycle.property_id == property_record.id,
                    MeasurementCycle.property_health_record_id == health_record.id,
                    MeasurementCycle.status == "completed",
                )
                .with_for_update()
                .first()
            )

            if not cycle:
                raise HTTPException(
                    409,
                    "Reserved Measurement Cycle is missing or invalid",
                )

            cycle_data = (
                db.query(MeasurementCycleData)
                .filter(
                    MeasurementCycleData.measurement_cycle_id == cycle.id
                )
                .with_for_update()
                .first()
            )

            if (
                not cycle_data
                or cycle_data.schema_version != 1
                or not isinstance(cycle_data.data, dict)
            ):
                raise HTTPException(
                    409,
                    "Measurement Cycle data is missing or invalid",
                )

            cycle_payload = cycle_data.data

            if (
                not isinstance(cycle_payload.get("floors"), dict)
                or not isinstance(cycle_payload.get("homeMeasurementProfile"), dict)
            ):
                raise HTTPException(
                    409,
                    "Measurement Cycle data is incomplete",
                )
            completion = _calculate_measurement_cycle_completion(
                cycle_payload["floors"]
            )

            if not completion["eligible"]:
                raise HTTPException(
                    409,
                    "Measurement Cycle has not reached the required analysis coverage",
                )

            measurement_cycle_number = cycle.cycle_number
            coverage_percent = completion["overall_percent"]

            analysis_input = {
                **project_data,
                **cycle_payload,
                "floors": list(cycle_payload["floors"].values()),
                "type": "home",
            }

        else:
            # FIRST ANALYSIS — USE ACTIVE MEASUREMENT CYCLE

            cycle = (
                db.query(MeasurementCycle)
                .filter(
                    MeasurementCycle.project_id == project_id,
                    MeasurementCycle.property_id == property_record.id,
                    MeasurementCycle.property_health_record_id == health_record.id,
                    MeasurementCycle.status == "in_progress",
                )
                .with_for_update()
                .first()
            )

            if not cycle:
                raise HTTPException(
                    409,
                    "No active Measurement Cycle found for first analysis",
                )

            cycle_data = (
                db.query(MeasurementCycleData)
                .filter(
                    MeasurementCycleData.measurement_cycle_id == cycle.id
                )
                .with_for_update()
                .first()
            )

            if (
                not cycle_data
                or cycle_data.schema_version != 1
                or not isinstance(cycle_data.data, dict)
            ):
                raise HTTPException(
                    409,
                    "Measurement Cycle data is missing or invalid",
                )

            cycle_payload = cycle_data.data

            if (
                not isinstance(cycle_payload.get("floors"), dict)
                or not isinstance(cycle_payload.get("homeMeasurementProfile"), dict)
            ):
                raise HTTPException(
                    409,
                    "Measurement Cycle data is incomplete",
                )

            completion = _calculate_measurement_cycle_completion(
                cycle_payload["floors"]
            )

            measurement_cycle_number = cycle.cycle_number
            coverage_percent = completion["overall_percent"]

            if not completion["eligible"]:
                raise HTTPException(
                    409,
                    "Measurement Cycle has not reached the required analysis coverage",
                )

            measurement_cycle_number = cycle.cycle_number
            coverage_percent = completion["overall_percent"]

            measurement_cycle_id = cycle.id

            analysis_input = {
                **project_data,
                **cycle_payload,
                "floors": list(cycle_payload["floors"].values()),
                "type": "home",
            }

        # =====================
        # RUN ANALYSIS
        # =====================

        from engine.analysis.home.deeper_analysis import (
            run_deeper_analysis,
        )

        print(
            "[DEEPER ANALYSIS INPUT CHECK]",
            {
                "project_id": project_id,
                "measurement_cycle_id": measurement_cycle_id,
                "measurement_cycle_number": measurement_cycle_number,
                "coverage_percent": coverage_percent,
                "floor_count": len(analysis_input.get("floors", [])),
                "zones": [
                    {
                        "zone_id": zone.get("id"),
                        "zone_type": zone.get("zoneType"),
                        "points": [
                            {
                                "id": point.get("id"),
                                "status": point.get("status")
                            }
                            for point in zone.get("measurementPoints", [])
                        ]
                    }
                    for floor in analysis_input.get("floors", [])
                    for zone in floor.get("zones", [])
                ]
            }
        )

        result = run_deeper_analysis(analysis_input)

        if not result.get("success"):
            db.rollback()

            raise HTTPException(
                422,
                detail={
                    "message": "Deeper Analysis could not be completed",
                    "errors": result.get("errors", []),
                    "warnings": result.get("warnings", []),
                },
            )

        # =====================
        # SAVE DEEPER ANALYSIS
        # =====================

        saved_analysis = HomeDeeperAnalysis(
            project_id=project_id,
            property_id=property_record.id,
            property_health_record_id=health_record.id,
            measurement_cycle_id=measurement_cycle_id,
            measurement_cycle_number=measurement_cycle_number,
            coverage_percent=coverage_percent,
            credit_product_key=credit.product_key,
            analysis_data=result.get("analysis"),
            warnings=result.get("warnings", []),
        )

        db.add(saved_analysis)
        db.flush()

        # =====================
        # MARK SELECTED CREDIT AS USED
        # =====================

        update_result = db.execute(
            text("""
                UPDATE home_wellness_transactions
                SET
                    usage_status = 'used',
                    used_at = CURRENT_TIMESTAMP
                WHERE id = :transaction_id
                  AND user_id = :user_id
                  AND project_id = :project_id
                  AND usage_status = 'not_used'
            """),
            {
                "transaction_id": credit.id,
                "user_id": str(current_user.id),
                "project_id": str(project_id),
            },
        )

        if update_result.rowcount != 1:
            db.rollback()

            raise HTTPException(
                409,
                "Deeper Analysis credit could not be reserved",
            )

        db.commit()

        return {
            "status": "ok",
            "project_id": project_id,
            "analysis_id": saved_analysis.id,
            "analysis": result.get("analysis"),
            "warnings": result.get("warnings", []),
            "credit_used": credit.product_key,
        }

    except HTTPException:
        if db.in_transaction():
            db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

# ==================================================
# GET SAVED HOME DEEPER ANALYSIS
# ==================================================

@router.get("/project/{project_id}/deeper-analysis/{analysis_id}")
def get_home_deeper_analysis(
    project_id: int,
    analysis_id: int,
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

    project_data = project.data or {}

    if project_data.get("type") != "home":
        raise HTTPException(
            status_code=400,
            detail="Deeper Analysis is available only for Home Wellness projects",
        )

    # =====================
    # LOAD SAVED ANALYSIS
    # =====================

    saved_analysis = (
        db.query(HomeDeeperAnalysis)
        .filter(
            HomeDeeperAnalysis.id == analysis_id,
            HomeDeeperAnalysis.project_id == project_id,
        )
        .first()
    )

    if not saved_analysis:
        raise HTTPException(
            status_code=404,
            detail="Deeper Analysis report not found",
        )

    return {
        "status": "ok",
        "project_id": project_id,
        "analysis_id": saved_analysis.id,
        "measurement_cycle_id": saved_analysis.measurement_cycle_id,
        "measurement_cycle_number": saved_analysis.measurement_cycle_number,
        "coverage_percent": saved_analysis.coverage_percent,
        "analysis": saved_analysis.analysis_data,
        "warnings": saved_analysis.warnings or [],
        "credit_used": saved_analysis.credit_product_key,
        "created_at": (
            saved_analysis.created_at.isoformat()
            if saved_analysis.created_at else None
        ),
    }


# ==================================================
# GENERATE SAVED HOME DEEPER ANALYSIS PDF
# ==================================================

@router.get("/project/{project_id}/deeper-analysis/{analysis_id}/pdf")
def generate_home_deeper_analysis_pdf(
    project_id: int,
    analysis_id: int,
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

    project_data = project.data or {}

    if project_data.get("type") != "home":
        raise HTTPException(
            status_code=400,
            detail="Deeper Analysis is available only for Home Wellness projects",
        )

    # LOAD SAVED ANALYSIS
    saved_analysis = (
        db.query(HomeDeeperAnalysis)
        .filter(
            HomeDeeperAnalysis.id == analysis_id,
            HomeDeeperAnalysis.project_id == project_id,
        )
        .first()
    )

    if not saved_analysis:
        raise HTTPException(
            status_code=404,
            detail="Deeper Analysis report not found",
        )

    # BUILD REPORT DATA FROM SAVED ANALYSIS
    report_data = {
        "analysis_id": saved_analysis.id,
        "measurement_cycle_id": saved_analysis.measurement_cycle_id,
        "measurement_cycle_number": saved_analysis.measurement_cycle_number,
        "coverage_percent": saved_analysis.coverage_percent,
        "analysis": saved_analysis.analysis_data,
        "warnings": saved_analysis.warnings or [],
        "credit_used": saved_analysis.credit_product_key,
        "created_at": (
            saved_analysis.created_at.isoformat()
            if saved_analysis.created_at else None
        ),
    }

    # GENERATE PDF
    try:
        pdf_content = build_deeper_analysis_pdf(report_data)
    except Exception as exc:
        print(
            "DEEPER ANALYSIS PDF ERROR:",
            str(exc),
            flush=True,
        )
        raise HTTPException(
            status_code=500,
            detail="Could not generate Deeper Analysis PDF",
        )

    filename = f"EMF_Insight_Deeper_Analysis_{analysis_id}.pdf"

    return StreamingResponse(
        BytesIO(pdf_content),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        },
    )


# ==================================================
# LIST SAVED HOME DEEPER ANALYSES
# ==================================================

@router.get("/project/{project_id}/deeper-analyses")
def get_home_deeper_analyses(
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
    # HOME WORKSPACE CHECK
    # =====================

    project_data = project.data or {}

    if project_data.get("type") != "home":
        raise HTTPException(
            status_code=400,
            detail="Deeper Analysis is available only for Home Wellness projects",
        )

    # =====================
    # LOAD SAVED ANALYSES
    # =====================

    analyses = (
        db.query(HomeDeeperAnalysis)
        .filter(
            HomeDeeperAnalysis.project_id == project_id,
        )
        .order_by(
            HomeDeeperAnalysis.created_at.desc(),
            HomeDeeperAnalysis.id.desc(),
        )
        .all()
    )

    return {
        "status": "ok",
        "project_id": project_id,
        "analyses": [
                       {
                            "analysis_id": item.id,
                            "credit_used": item.credit_product_key,
                            "measurement_cycle_id": item.measurement_cycle_id,
                            "measurement_cycle_number": item.measurement_cycle_number,
                            "coverage_percent": item.coverage_percent,
                            "created_at": (
                                item.created_at.isoformat()
                                if item.created_at else None
                            ),
                        }
            for item in analyses
        ],
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

    if professional_access is not None:
      require_active_edit(professional_access)

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

