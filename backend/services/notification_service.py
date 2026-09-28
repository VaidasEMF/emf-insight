from sqlalchemy.orm import Session

from models.user import User
from models.project import Project
from models.report import Report
from models.pricing import Pricing
from models.report_credit_ledger import ReportCreditLedger
from models.project_version import ProjectVersion
from models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "info",
    source_workspace: str | None = None,
    action_label: str | None = None,
    action_url: str | None = None,
):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        source_workspace=source_workspace,
        action_label=action_label,
        action_url=action_url,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification