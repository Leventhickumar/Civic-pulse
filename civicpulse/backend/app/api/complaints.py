import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user, get_db
from app.models.comment import Comment
from app.models.complaint import Complaint, ComplaintCategory, ComplaintStatus
from app.models.status_history import StatusHistory
from app.models.upvote import Upvote
from app.models.user import User
from app.schemas.complaint import (
    CommentCreate,
    CommentResponse,
    ComplaintListResponse,
    ComplaintResponse,
    StatusHistoryResponse,
    UpvoteResponse,
)


router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "static" / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024


def save_upload_file(image: UploadFile) -> str:
    extension = Path(image.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only jpg, png, and webp images are allowed")

    contents = image.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image must be 5MB or smaller")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4()}{extension}"
    file_path = UPLOAD_DIR / filename
    file_path.write_bytes(contents)
    return f"/static/uploads/{filename}"


def get_complaint_or_404(db: Session, complaint_id: uuid.UUID) -> Complaint:
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    return complaint


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    category: ComplaintCategory = Form(...),
    ward: str = Form(...),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ComplaintResponse:
    image_url = save_upload_file(image) if image else None

    complaint = Complaint(
        title=title.strip(),
        description=description.strip(),
        category=category,
        ward=ward.strip(),
        latitude=latitude,
        longitude=longitude,
        image_url=image_url,
        user_id=current_user.id,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("", response_model=list[ComplaintListResponse])
def list_complaints(
    category: ComplaintCategory | None = Query(None),
    status_filter: ComplaintStatus | None = Query(None, alias="status"),
    ward: str | None = Query(None),
    search: str = Query(""),
    sort_by: str = Query("upvotes"),
    db: Session = Depends(get_db),
) -> list[Complaint]:
    query = db.query(Complaint)

    if category:
        query = query.filter(Complaint.category == category)
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if ward:
        query = query.filter(Complaint.ward.ilike(f"%{ward.strip()}%"))
    if search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.title.ilike(search_term),
                Complaint.description.ilike(search_term),
                Complaint.ward.ilike(search_term),
            )
        )

    if sort_by == "recent":
        query = query.order_by(desc(Complaint.created_at))
    else:
        query = query.order_by(desc(Complaint.upvote_count), desc(Complaint.created_at))

    return query.all()


@router.get("/search-suggestions", response_model=list[str])
def search_suggestions(
    q: str = Query(""),
    db: Session = Depends(get_db),
) -> list[str]:
    term = q.strip()
    if not term:
        return []

    rows = (
        db.query(Complaint.title)
        .filter(Complaint.title.ilike(f"%{term}%"))
        .order_by(desc(Complaint.created_at))
        .limit(5)
        .all()
    )
    return [title for (title,) in rows]


@router.get("/mine", response_model=list[ComplaintListResponse])
def list_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Complaint]:
    return (
        db.query(Complaint)
        .filter(Complaint.user_id == current_user.id)
        .order_by(desc(Complaint.created_at))
        .all()
    )


@router.get("/{complaint_id}/comments", response_model=list[CommentResponse])
def list_comments(complaint_id: uuid.UUID, db: Session = Depends(get_db)) -> list[Comment]:
    get_complaint_or_404(db, complaint_id)
    return (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.complaint_id == complaint_id)
        .order_by(desc(Comment.created_at))
        .all()
    )


@router.post("/{complaint_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    complaint_id: uuid.UUID,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Comment:
    get_complaint_or_404(db, complaint_id)
    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Comment cannot be empty")

    comment = Comment(
        complaint_id=complaint_id,
        user_id=current_user.id,
        content=content,
    )
    db.add(comment)
    db.commit()

    created_comment = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.id == comment.id)
        .first()
    )
    return created_comment


@router.get("/{complaint_id}/history", response_model=list[StatusHistoryResponse])
def list_status_history(complaint_id: uuid.UUID, db: Session = Depends(get_db)) -> list[StatusHistory]:
    get_complaint_or_404(db, complaint_id)
    return (
        db.query(StatusHistory)
        .options(joinedload(StatusHistory.actor))
        .filter(StatusHistory.complaint_id == complaint_id)
        .order_by(desc(StatusHistory.changed_at))
        .all()
    )


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: uuid.UUID, db: Session = Depends(get_db)) -> Complaint:
    complaint = (
        db.query(Complaint)
        .options(joinedload(Complaint.user))
        .filter(Complaint.id == complaint_id)
        .first()
    )
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    return complaint


@router.post("/{complaint_id}/upvote", response_model=UpvoteResponse)
def toggle_upvote(
    complaint_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UpvoteResponse:
    complaint = get_complaint_or_404(db, complaint_id)

    upvote = (
        db.query(Upvote)
        .filter(Upvote.user_id == current_user.id, Upvote.complaint_id == complaint_id)
        .first()
    )

    if upvote:
        db.delete(upvote)
        complaint.upvote_count = max(0, complaint.upvote_count - 1)
        upvoted = False
    else:
        db.add(Upvote(user_id=current_user.id, complaint_id=complaint_id))
        complaint.upvote_count += 1
        upvoted = True

    db.commit()
    db.refresh(complaint)
    return UpvoteResponse(complaint_id=complaint.id, upvoted=upvoted, upvote_count=complaint.upvote_count)
