from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from db.base import Base


class Report(Base):

    __tablename__ = "reports"

    # =====================
    # PRIMARY KEY
    # =====================

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # =====================
    # PDF FILE
    # =====================

    pdf_path: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    # =====================
    # PREVIEW
    # =====================

    preview: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    # =====================
    # PROJECT
    # =====================

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
    )

    project = relationship(
        "Project",
        back_populates="reports",
    )
