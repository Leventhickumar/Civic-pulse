import uuid

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Upvote(Base):
    __tablename__ = "upvotes"
    __table_args__ = (UniqueConstraint("user_id", "complaint_id", name="uq_user_complaint_upvote"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    complaint_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False)

    user = relationship("User", back_populates="upvotes")
    complaint = relationship("Complaint", back_populates="upvotes")
