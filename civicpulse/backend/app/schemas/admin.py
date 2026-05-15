from pydantic import BaseModel

from app.models.complaint import ComplaintStatus


class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    resolution_note: str | None = None
