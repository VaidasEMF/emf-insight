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
