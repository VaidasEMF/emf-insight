import os

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from auth.dependencies import (
    get_current_user,
    get_db,
)

from models.report import Report

router = APIRouter()

# =====================
# DOWNLOAD REPORT
# =====================


@router.get("/reports/{report_id}/download")
def download_report(
    report_id: int,
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:

        raise HTTPException(
            404,
            "Report not found",
        )

    project = report.project

    # =====================
    # OWNERSHIP CHECK
    # =====================

    if project.user_id != current_user.id:

        raise HTTPException(
            403,
            "Forbidden",
        )

    if not os.path.exists(
        report.pdf_path,
    ):

        raise HTTPException(
            404,
            "PDF file missing",
        )

    return FileResponse(
        report.pdf_path,
        media_type="application/pdf",
    )


# =====================
# MY REPORTS
# =====================


@router.get("/reports/me")
def my_reports(
    current_user=Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    reports = db.query(Report).all()

    result = []

    for r in reports:

        project = r.project

        if project.user_id != current_user.id:
            continue

        result.append(
            {
                "id": r.id,
                "project_id": project.id,
                "project_name": project.name,
                "preview": bool(r.preview),
            }
        )

    return result
