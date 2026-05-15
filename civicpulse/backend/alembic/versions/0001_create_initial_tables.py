"""create initial tables"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_create_initial_tables"
down_revision = None
branch_labels = None
depends_on = None


user_role = sa.Enum("citizen", "admin", name="user_role")
complaint_category = sa.Enum("pothole", "water", "electricity", "garbage", "other", name="complaint_category")
complaint_status = sa.Enum(
    "filed",
    "acknowledged",
    "in_progress",
    "resolved",
    "rejected",
    name="complaint_status",
)

user_role_existing = postgresql.ENUM("citizen", "admin", name="user_role", create_type=False)
complaint_category_existing = postgresql.ENUM(
    "pothole",
    "water",
    "electricity",
    "garbage",
    "other",
    name="complaint_category",
    create_type=False,
)
complaint_status_existing = postgresql.ENUM(
    "filed",
    "acknowledged",
    "in_progress",
    "resolved",
    "rejected",
    name="complaint_status",
    create_type=False,
)


def upgrade() -> None:
    user_role.create(op.get_bind(), checkfirst=True)
    complaint_category.create(op.get_bind(), checkfirst=True)
    complaint_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", user_role_existing, nullable=False, server_default="citizen"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "complaints",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", complaint_category_existing, nullable=False),
        sa.Column("ward", sa.String(length=255), nullable=False),
        sa.Column("status", complaint_status_existing, nullable=False, server_default="filed"),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("upvote_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("resolution_note", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
    )
    op.create_index(op.f("ix_complaints_ward"), "complaints", ["ward"], unique=False)

    op.create_table(
        "upvotes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("complaint_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("complaints.id"), nullable=False),
        sa.UniqueConstraint("user_id", "complaint_id", name="uq_user_complaint_upvote"),
    )


def downgrade() -> None:
    op.drop_table("upvotes")
    op.drop_index(op.f("ix_complaints_ward"), table_name="complaints")
    op.drop_table("complaints")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    complaint_status.drop(op.get_bind(), checkfirst=True)
    complaint_category.drop(op.get_bind(), checkfirst=True)
    user_role.drop(op.get_bind(), checkfirst=True)
