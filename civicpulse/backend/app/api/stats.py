from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, desc
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

    
    ward_status_rows = db.query(Complaint.ward, Complaint.status, func.count(Complaint.id)).group_by(Complaint.ward, Complaint.status).all()
    ward_details = {}
    for w, status, count in ward_status_rows:
        if w not in ward_details:
            ward_details[w] = {"total": 0, "resolved": 0, "pending": 0}
        ward_details[w]["total"] += count
        if status == ComplaintStatus.resolved:
            ward_details[w]["resolved"] += count
        else:
            ward_details[w]["pending"] += count

    by_ward = {}
    for w, stats_data in ward_details.items():
        rate = round((stats_data["resolved"] / stats_data["total"]) * 100, 1) if stats_data["total"] else 0.0
        by_ward[w] = {
            "total": stats_data["total"],
            "resolved": stats_data["resolved"],
            "pending": stats_data["pending"],
            "resolution_rate": rate
        }

    return StatsResponse(
        total=total,
        resolved=resolved,
        pending=pending,
        filed=filed,
        acknowledged=acknowledged,
        in_progress=in_progress,
        rejected=rejected,
        by_category=by_category,
        by_ward=by_ward,
        by_date=by_date,
        resolution_rate=resolution_rate,
    )


@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    ward_status_rows = (
        db.query(Complaint.ward, Complaint.status, func.count(Complaint.id))
        .group_by(Complaint.ward, Complaint.status)
        .all()
    )
    ward_stats = {}
    for ward, status, count in ward_status_rows:
        if ward not in ward_stats:
            ward_stats[ward] = {"count": 0, "resolved": 0}
        ward_stats[ward]["count"] += count
        if status == ComplaintStatus.resolved:
            ward_stats[ward]["resolved"] += count
            
    top_wards = []
    for ward, stats in ward_stats.items():
        rate = round((stats["resolved"] / stats["count"]) * 100, 1) if stats["count"] > 0 else 0.0
        top_wards.append({
            "ward": ward,
            "count": stats["count"],
            "resolved": stats["resolved"],
            "resolution_rate": rate
        })
    top_wards = sorted(top_wards, key=lambda x: x["count"], reverse=True)[:10]

    category_rows = db.query(Complaint.category, func.count(Complaint.id)).group_by(Complaint.category).all()
    top_categories = [{"category": category.value, "count": count} for category, count in category_rows]
    top_categories = sorted(top_categories, key=lambda x: x["count"], reverse=True)

    most_upvoted_data = db.query(Complaint).order_by(desc(Complaint.upvote_count)).limit(5).all()
    most_upvoted = [
        {
            "id": c.id,
            "title": c.title,
            "ward": c.ward,
            "category": c.category.value,
            "upvote_count": c.upvote_count,
            "status": c.status.value
        }
        for c in most_upvoted_data
    ]

    return {
        "top_wards": top_wards,
        "top_categories": top_categories,
        "most_upvoted": most_upvoted
    }
