from sqlalchemy import (
    Integer,
    String,
    Boolean,
    Float,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from db.base import Base


class Pricing(Base):

    __tablename__ = "pricing"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    region: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    product_key: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    price: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    billing: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    credits: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    available: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
