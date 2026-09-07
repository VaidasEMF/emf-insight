from datetime import datetime

from sqlalchemy import (
    DateTime,
    Integer,
    String,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from db.base import Base


class User(Base):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    credits: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    plan: Mapped[str] = mapped_column(
        String,
        default="free",
    )

    access_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    password_reset_token: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    password_reset_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    is_admin: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )


    company_name: Mapped[str] = mapped_column(
        String,
        default="",
    )

    company_email: Mapped[str] = mapped_column(
        String,
        default="",
    )

    logo_path: Mapped[str] = mapped_column(
        String,
        default="",
    )

    # =====================
    # RELATIONSHIPS
    # =====================

    projects = relationship(
        "Project",
        back_populates="user",
    )
