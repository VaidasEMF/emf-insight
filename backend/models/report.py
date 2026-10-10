
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

    project = relationship(
        "Project",
        back_populates="reports",
    )
