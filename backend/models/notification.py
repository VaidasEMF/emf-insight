from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from db.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    type: Mapped[str] = mapped_column(
        String(50),
        default="info",
        nullable=False
    )

    source_workspace: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    action_label: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    action_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="notifications"
    )