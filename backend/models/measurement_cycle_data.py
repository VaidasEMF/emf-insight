
from datetime import datetime

from sqlalchemy import (
    Integer,
    ForeignKey,
    DateTime,
    CheckConstraint,
    UniqueConstraint,
    func,
)

from sqlalchemy.dialects.postgresql import JSONB

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from db.base import Base


class MeasurementCycleData(Base):

    __tablename__ = "measurement_cycle_data"

    __table_args__ = (
        UniqueConstraint(
            "measurement_cycle_id",
            name="uq_measurement_cycle_data_cycle",
        ),
        CheckConstraint(
            "schema_version > 0",
            name="ck_measurement_cycle_data_schema_version",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    measurement_cycle_id: Mapped[int] = mapped_column(
        ForeignKey(
            "measurement_cycles.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    schema_version: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    data: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
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
