
from datetime import datetime

from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    DateTime,
    CheckConstraint,
    UniqueConstraint,
    Index,
    func,
    text,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from db.base import Base


class MeasurementCycle(Base):

    __tablename__ = "measurement_cycles"

    __table_args__ = (
        UniqueConstraint(
            "property_id",
            "cycle_number",
            name="uq_measurement_cycles_property_number",
        ),
        CheckConstraint(
            "cycle_number > 0",
            name="ck_measurement_cycles_number_positive",
        ),
        CheckConstraint(
            "status IN ('in_progress', 'completed')",
            name="ck_measurement_cycles_status",
        ),
        Index(
            "uq_measurement_cycles_active_project",
            "project_id",
            unique=True,
            postgresql_where=text("status = 'in_progress'"),
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    cycle_uid: Mapped[str] = mapped_column(
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

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
        index=True,
    )

    cycle_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="in_progress",
        nullable=False,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
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
