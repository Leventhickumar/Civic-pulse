import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.complaint import ComplaintStatus


class StatusHistory(Base):
    __tablename__ = "status_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False)
    old_status: Mapped[ComplaintStatus] = mapped_column(Enum(ComplaintStatus, name="complaint_status"), nullable=False)
    new_status: Mapped[ComplaintStatus] = mapped_column(Enum(ComplaintStatus, name="complaint_status"), nullable=False)
    changed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    complaint = relationship("Complaint", back_populates="status_history")
    actor = relationship("User", back_populates="status_changes", foreign_keys=[changed_by])
