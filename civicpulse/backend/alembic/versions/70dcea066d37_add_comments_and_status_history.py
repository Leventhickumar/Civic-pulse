"""add_comments_and_status_history"""

revision = '70dcea066d37'
down_revision = '0001_create_initial_tables'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = set(inspector.get_table_names())

    if "comments" not in table_names:
        op.create_table(
            "comments",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("complaint_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["complaint_id"], ["complaints.id"]),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if "status_history" not in table_names:
        op.create_table(
            "status_history",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("complaint_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column(
                "old_status",
                postgresql.ENUM(
                    "filed",
                    "acknowledged",
                    "in_progress",
                    "resolved",
                    "rejected",
                    name="complaint_status",
                    create_type=False,
                ),
                nullable=False,
            ),
            sa.Column(
                "new_status",
                postgresql.ENUM(
                    "filed",
                    "acknowledged",
                    "in_progress",
                    "resolved",
                    "rejected",
                    name="complaint_status",
                    create_type=False,
                ),
                nullable=False,
            ),
            sa.Column("changed_by", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("note", sa.String(length=500), nullable=True),
            sa.Column("changed_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["changed_by"], ["users.id"]),
            sa.ForeignKeyConstraint(["complaint_id"], ["complaints.id"]),
            sa.PrimaryKeyConstraint("id"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = set(inspector.get_table_names())

    if "status_history" in table_names:
        op.drop_table("status_history")
    if "comments" in table_names:
        op.drop_table("comments")
