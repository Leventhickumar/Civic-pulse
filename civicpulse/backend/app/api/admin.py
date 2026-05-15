import uuid
from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_admin_user, get_db
from app.models.complaint import Complaint, ComplaintCategory, ComplaintStatus
from app.models.status_history import StatusHistory
from app.models.user import User
from app.schemas.admin import ComplaintStatusUpdate
from app.schemas.complaint import ComplaintResponse


router = APIRouter()


def apply_complaint_filters(query, status_filter: ComplaintStatus | None, category: ComplaintCategory | None, ward: str | None):
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if category:
        query = query.filter(Complaint.category == category)
    if ward:
        query = query.filter(Complaint.ward.ilike(f"%{ward.strip()}%"))
    return query


@router.get("/complaints", response_model=list[ComplaintResponse])
def list_admin_complaints(
    status_filter: ComplaintStatus | None = Query(None, alias="status"),
    category: ComplaintCategory | None = Query(None),
    ward: str | None = Query(None),
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
) -> list[Complaint]:
    query = (
        db.query(Complaint)
        .options(joinedload(Complaint.user))
        .order_by(desc(Complaint.created_at))
    )
    return apply_complaint_filters(query, status_filter, category, ward).all()


@router.patch("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: uuid.UUID,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
) -> Complaint:
    complaint = (
        db.query(Complaint)
        .options(joinedload(Complaint.user))
        .filter(Complaint.id == complaint_id)
        .first()
    )
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    previous_status = complaint.status
    complaint.status = payload.status
    complaint.resolution_note = payload.resolution_note
    db.add(
        StatusHistory(
            complaint_id=complaint.id,
            old_status=previous_status,
            new_status=payload.status,
            changed_by=current_admin.id,
            note=payload.resolution_note,
        )
    )
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/export/pdf")
def export_complaints_pdf(
    status_filter: ComplaintStatus | None = Query(None, alias="status"),
    category: ComplaintCategory | None = Query(None),
    ward: str | None = Query(None),
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
) -> StreamingResponse:
    query = apply_complaint_filters(
        db.query(Complaint).order_by(desc(Complaint.created_at)),
        status_filter,
        category,
        ward,
    )
    complaints = query.all()

    status_breakdown = {status.value: 0 for status in ComplaintStatus}
    for complaint in complaints:
        status_breakdown[complaint.status.value] += 1

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=32, rightMargin=32, topMargin=32, bottomMargin=32)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("CivicPulse - Complaint Report", styles["Title"]),
        Spacer(1, 8),
        Paragraph(f"Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]),
        Spacer(1, 16),
        Paragraph(f"Total complaints in report: {len(complaints)}", styles["Heading3"]),
        Spacer(1, 6),
    ]

    for status_name, count in status_breakdown.items():
        story.append(Paragraph(f"{status_name.replace('_', ' ').title()}: {count}", styles["Normal"]))

    story.extend([Spacer(1, 16)])

    table_data = [["#", "Title", "Category", "Ward", "Status", "Upvotes", "Filed Date"]]
    for index, complaint in enumerate(complaints, start=1):
        table_data.append(
            [
                str(index),
                complaint.title,
                complaint.category.value.title(),
                complaint.ward,
                complaint.status.value.replace("_", " ").title(),
                str(complaint.upvote_count),
                complaint.created_at.strftime("%Y-%m-%d"),
            ]
        )

    table = Table(table_data, repeatRows=1, colWidths=[24, 168, 70, 60, 78, 46, 70])
    table_style = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324d")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
    ]
    for row_index in range(1, len(table_data)):
        table_style.append(
            ("BACKGROUND", (0, row_index), (-1, row_index), colors.white if row_index % 2 else colors.HexColor("#f3f4f6"))
        )
    table.setStyle(TableStyle(table_style))
    story.extend([table, Spacer(1, 18), Paragraph("Generated by CivicPulse Admin Portal", styles["Italic"])])
    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="civicpulse_report.pdf"'},
    )
