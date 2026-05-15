import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.complaint import ComplaintCategory, ComplaintStatus
from app.schemas.user import UserResponse


class ComplaintBase(BaseModel):
    title: str
    description: str
    category: ComplaintCategory
    ward: str
    latitude: float | None = None
    longitude: float | None = None


class ComplaintCreate(ComplaintBase):
    image_url: str | None = None


class ComplaintResponse(ComplaintBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: ComplaintStatus
    image_url: str | None
    upvote_count: int
    resolution_note: str | None
    created_at: datetime
    user_id: uuid.UUID
    user: UserResponse | None = None


class ComplaintListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    category: ComplaintCategory
    ward: str
    status: ComplaintStatus
    image_url: str | None
    upvote_count: int
    created_at: datetime
    user_id: uuid.UUID


class UpvoteResponse(BaseModel):
    complaint_id: uuid.UUID
    upvoted: bool
    upvote_count: int


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    complaint_id: uuid.UUID
    user_id: uuid.UUID
    content: str
    created_at: datetime
    user: UserResponse


class StatusHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    complaint_id: uuid.UUID
    old_status: ComplaintStatus
    new_status: ComplaintStatus
    changed_by: uuid.UUID
    note: str | None
    changed_at: datetime
    actor: UserResponse | None = None


class StatsResponse(BaseModel):
    total: int
    resolved: int
    pending: int
    filed: int
    acknowledged: int
    in_progress: int
    rejected: int
    by_category: dict[str, int]
    by_ward: dict[str, int]
    by_date: list[dict[str, str | int]]
    resolution_rate: float
