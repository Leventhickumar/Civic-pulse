from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.complaint import Complaint, ComplaintCategory, ComplaintStatus
from app.schemas.complaint import StatsResponse


router = APIRouter()


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)) -> StatsResponse:
    total = db.query(func.count(Complaint.id)).scalar() or 0
    status_rows = db.query(Complaint.status, func.count(Complaint.id)).group_by(Complaint.status).all()
    status_counts = {status.value: 0 for status in ComplaintStatus}
    status_counts.update({status.value: count for status, count in status_rows})

    resolved = status_counts[ComplaintStatus.resolved.value]
    pending = total - resolved
    filed = status_counts[ComplaintStatus.filed.value]
    acknowledged = status_counts[ComplaintStatus.acknowledged.value]
    in_progress = status_counts[ComplaintStatus.in_progress.value]
    rejected = status_counts[ComplaintStatus.rejected.value]

    category_rows = db.query(Complaint.category, func.count(Complaint.id)).group_by(Complaint.category).all()
    ward_rows = (
        db.query(Complaint.ward, func.count(Complaint.id).label("count"))
        .group_by(Complaint.ward)
        .order_by(func.count(Complaint.id).desc(), Complaint.ward.asc())
        .limit(10)
        .all()
    )

    today = datetime.utcnow().date()
    start_date = today - timedelta(days=29)
    date_rows = (
        db.query(func.date(Complaint.created_at), func.count(Complaint.id))
        .filter(Complaint.created_at >= datetime.combine(start_date, datetime.min.time()))
        .group_by(func.date(Complaint.created_at))
        .order_by(func.date(Complaint.created_at))
        .all()
    )
    counts_by_date = {}
    for row_date, count in date_rows:
        normalized_date = row_date if isinstance(row_date, date) else date.fromisoformat(str(row_date))
        counts_by_date[normalized_date.isoformat()] = count

    by_date = []
    for offset in range(30):
        current_date = start_date + timedelta(days=offset)
        iso_date = current_date.isoformat()
        by_date.append({"date": iso_date, "count": counts_by_date.get(iso_date, 0)})

    by_category = {category.value: 0 for category in ComplaintCategory}
    by_category.update({str(category.value): count for category, count in category_rows})
    resolution_rate = round((resolved / total) * 100, 1) if total else 0.0

    return StatsResponse(
        total=total,
        resolved=resolved,
        pending=pending,
        filed=filed,
        acknowledged=acknowledged,
        in_progress=in_progress,
        rejected=rejected,
        by_category=by_category,
        by_ward={ward: count for ward, count in ward_rows},
        by_date=by_date,
        resolution_rate=resolution_rate,
    )
