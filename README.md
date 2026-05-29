CivicPulse — Civic Grievance Tracking Platform

Citizens deserve to know their complaints are heard. CivicPulse is a full-stack public grievance platform where residents file civic complaints with photo evidence and track resolution in real time — replacing the silence of unanswered municipal reports with a transparent, accountable pipeline.


The Problem It Solves
In most cities, filing a civic complaint means submitting a form and never hearing back. CivicPulse replaces that dead end with a 5-stage resolution pipeline — giving citizens live status updates on every complaint they file, and giving administrators a structured, audited queue to action and close them.

Tech Stack
LayerTechnologyBackend APIPython · FastAPI · PostgreSQL · SQLAlchemyAuthenticationJWT · Role-Based Access Control (citizen / admin)MigrationsAlembicFrontendReact · Tailwind CSSFile StorageUUID-based local image uploadPDF ReportsReportLabDeploymentRender (backend) · Vercel (frontend)

Core Features

Civic complaint filing — citizens submit complaints (road damage, drainage, lighting, etc.) with photo evidence
5-stage resolution pipeline — every complaint moves through Filed → Acknowledged → In Progress → Resolved → Rejected with full citizen visibility
Real-time status tracking — citizens monitor the current stage of every complaint from their dashboard
Upvoting system — community members upvote urgent issues, surfacing high-priority complaints to admins
JWT authentication with RBAC — strict citizen and admin roles with route-level access control enforced across all endpoints
UUID-based image storage — collision-safe photo uploads stored under static/ with universally unique filenames
Status history audit trail — every admin action is logged in status_history with a timestamp, creating a full accountability record
Admin dashboard — dedicated admin interface to manage, update, and close complaints in bulk
Stats dashboard — live metrics on complaint volume, resolution rates, and pipeline health
Leaderboard — gamified citizen engagement showing top reporters by resolved complaints
PDF report export — admins export complaint summaries as structured PDF reports via ReportLab


Project Structure
Civic-pulse/
└── civicpulse/
    ├── backend/
    │   ├── app/
    │   │   ├── api/
    │   │   │   ├── complaints.py     # Complaint CRUD endpoints
    │   │   │   ├── admin.py          # Admin management endpoints
    │   │   │   ├── auth.py           # Login, register, token endpoints
    │   │   │   ├── stats.py          # Dashboard metrics endpoints
    │   │   │   └── upload.py         # Image upload handler
    │   │   ├── core/
    │   │   │   ├── database.py       # PostgreSQL connection (SQLAlchemy)
    │   │   │   ├── settings.py       # Environment config
    │   │   │   └── security.py       # JWT token logic
    │   │   ├── models/
    │   │   │   ├── complaint.py      # Complaint model + ComplaintStatus enum
    │   │   │   ├── user.py           # User model with role field
    │   │   │   └── status_history.py # Audit trail model
    │   │   ├── schemas/              # Pydantic request/response schemas
    │   │   ├── static/               # Uploaded images (UUID-named)
    │   │   └── main.py               # FastAPI app entry point
    │   ├── alembic/                  # Database migration scripts
    │   ├── alembic.ini
    │   ├── requirements.txt
    │   └── Dockerfile
    └── frontend/
        ├── src/
        │   ├── pages/
        │   │   ├── Landing.jsx
        │   │   ├── Home.jsx
        │   │   ├── FileComplaint.jsx
        │   │   ├── MyComplaints.jsx
        │   │   ├── ComplaintDetail.jsx
        │   │   ├── AdminDashboard.jsx
        │   │   ├── StatsDashboard.jsx
        │   │   └── Leaderboard.jsx
        │   ├── components/
        │   │   ├── ComplaintCard.jsx
        │   │   ├── StatusTimeline.jsx
        │   │   ├── Navbar.jsx
        │   │   └── Toast.jsx
        │   ├── api/                  # Axios API client utilities
        │   └── utils/                # Helper scripts
        └── package.json

How to Run It Locally
Prerequisites

Python 3.10+
Node.js 18+
PostgreSQL running locally

1. Clone the repository
bashgit clone https://github.com/Leventhickumar/Civic-pulse.git
cd Civic-pulse/civicpulse
2. Set up the backend
bashcd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
3. Configure environment variables
Create a .env file inside civicpulse/backend/:
envDATABASE_URL=postgresql://your_user:your_password@localhost:5432/civicpulse
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
4. Run database migrations
bashalembic upgrade head
5. Start the backend server
bashuvicorn app.main:app --reload
Backend runs at → http://localhost:8000
Interactive API docs → http://localhost:8000/docs
6. Set up and start the frontend
bashcd ../frontend
npm install
npm run dev
Frontend runs at → http://localhost:5173

Live Demo

Frontend: civic-pulse-chi-gray.vercel.app
API Docs: http://localhost:8000/docs (Swagger UI, auto-generated by FastAPI)


Author
Leventhic kumar — github.com/Leventhickumar
