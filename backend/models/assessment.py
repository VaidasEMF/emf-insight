
from datetime import datetime

from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    JSON,
    DateTime,
    func,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from db.base import Base


class Assessment(Base):

    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    assessment_uid: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    property_id: Mapped[int] = mapped_column(
        ForeignKey("properties.id"),
        nullable=False,
        index=True,
    )

    property_health_record_id: Mapped[int] = mapped_column(
        ForeignKey("property_health_records.id"),
        nullable=False,
        index=True,
    )

    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id"),
        nullable=True,
        index=True,
    )

    client_project_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id"),
        nullable=True,
        index=True,
    )

    professional_request_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    professional_request_contact_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )

    professional_user_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )

    display_reference: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    assessment_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="draft",
        nullable=False,
    )

    assessment_data: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    property = relationship(
        "Property",
        back_populates="assessments",
    )

    health_record = relationship(
        "PropertyHealthRecord",
        back_populates="assessments",
    )
