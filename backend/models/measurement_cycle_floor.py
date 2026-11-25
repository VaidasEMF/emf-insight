
from datetime import datetime

from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    DateTime,
    UniqueConstraint,
    Index,
    func,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from db.base import Base


class MeasurementCycleFloor(Base):

    __tablename__ = "measurement_cycle_floors"

    __table_args__ = (
        UniqueConstraint(
            "measurement_cycle_id",
            "floor_id",
            name="uq_measurement_cycle_floors_cycle_floor",
        ),
        Index(
            "ix_measurement_cycle_floors_floor_id",
            "floor_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    measurement_cycle_id: Mapped[int] = mapped_column(
        ForeignKey(
            "measurement_cycles.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    floor_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    plan_version_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
