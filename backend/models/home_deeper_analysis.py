
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
)

from db.base import Base


class HomeDeeperAnalysis(Base):

    __tablename__ = "home_deeper_analyses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
        index=True,
    )

    property_id: Mapped[int | None] = mapped_column(
        ForeignKey("properties.id"),
        nullable=True,
        index=True,
    )

    property_health_record_id: Mapped[int | None] = mapped_column(
        ForeignKey("property_health_records.id"),
        nullable=True,
        index=True,
    )

    measurement_cycle_id: Mapped[int | None] = mapped_column(
        ForeignKey("measurement_cycles.id"),
        nullable=True,
        index=True,
    )

    measurement_cycle_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    coverage_percent: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    credit_product_key: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    analysis_data: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    warnings: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
