from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.complaints import router as complaints_router
from app.api.stats import router as stats_router
from app.api.upload import router as upload_router
from app.core.config import settings
from app.core.database import Base, engine
from app.models import comment, complaint, status_history, upvote, user  # noqa: F401


Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = Path(__file__).resolve().parent / "static"
static_dir.mkdir(parents=True, exist_ok=True)
(static_dir / "uploads").mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(complaints_router, prefix="/api/complaints", tags=["complaints"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(stats_router, prefix="/api", tags=["stats"])


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "CivicPulse API is running"}
