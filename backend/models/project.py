from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    JSON,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from db.base import Base


class Project(Base):

    __tablename__ = "projects"

    # =====================
    # PRIMARY KEY
    # =====================

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # =====================
    # DATA
    # =====================

    name: Mapped[str] = mapped_column(
        String,
        default="Project",
    )

    data: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    # =====================
    # USER RELATION
    # =====================

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="projects",
    )

    versions = relationship(
        "ProjectVersion",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    # =====================
    # REPORTS
    # =====================

    reports = relationship(
        "Report",
        back_populates="project",
    )
