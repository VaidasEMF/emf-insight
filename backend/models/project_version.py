from sqlalchemy import (
    Integer,
    ForeignKey,
    JSON,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from db.base import Base


class ProjectVersion(Base):

    __tablename__ = "project_versions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
    )

    data: Mapped[dict] = mapped_column(
        JSON,
    )

    project = relationship(
        "Project",
        back_populates="versions",
    )