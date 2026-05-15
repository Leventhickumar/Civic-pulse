import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ComplaintCategory(str, enum.Enum):
    pothole = "pothole"
    water = "water"
    electricity = "electricity"
    garbage = "garbage"
    other = "other"


class ComplaintStatus(str, enum.Enum):
    filed = "filed"
    acknowledged = "acknowledged"
    in_progress = "in_progress"
    resolved = "resolved"
    rejected = "rejected"


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[ComplaintCategory] = mapped_column(
        Enum(ComplaintCategory, name="complaint_category"),
        nullable=False,
    )
    ward: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    status: Mapped[ComplaintStatus] = mapped_column(
        Enum(ComplaintStatus, name="complaint_status"),
        default=ComplaintStatus.filed,
        nullable=False,
    )
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    upvote_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resolution_note: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="complaints")
    upvotes = relationship("Upvote", back_populates="complaint", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="complaint", cascade="all, delete-orphan")
    status_history = relationship("StatusHistory", back_populates="complaint", cascade="all, delete-orphan")
