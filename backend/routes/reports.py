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

from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    DateTime,
    func,
)

from datetime import datetime

from sqlalchemy import DateTime, func


from models.report import Report

from models.report_credit_ledger import ReportCreditLedger

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
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(Report)
        .join(Report.project)
        .filter(Report.project.has(user_id=current_user.id))
        .order_by(Report.id.desc())
        .all()
    )

    result = []

    for report in reports:
        project = report.project

        result.append({
            "id": report.id,
            "project_id": project.id,
            "project_name": project.name,
            "preview": bool(report.preview),
            "workspace": (
                report.workspace.title()
                if report.workspace
                else "Business"
            ),
            "credits_used": 0 if report.preview else None,
            "credit_transaction_at": None,
            "created_at": (
                report.created_at.isoformat()
                if report.created_at
                else None
            ),
        })

    return result