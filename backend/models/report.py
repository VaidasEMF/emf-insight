
from datetime import datetime

from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    DateTime,
    func,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from db.base import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    pdf_path: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    preview: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    workspace: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="business",
        server_default="business",
    )

    property_id: Mapped[int | None] = mapped_column(
        ForeignKey("properties.id"),
        nullable=True,
    )

    property_health_record_id: Mapped[int | None] = mapped_column(
        ForeignKey("property_health_records.id"),
        nullable=True,
    )

    assessment_id: Mapped[int | None] = mapped_column(
        ForeignKey("assessments.id"),
        nullable=True,
    )

    report_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    project = relationship(
        "Project",
        back_populates="reports",
    )
