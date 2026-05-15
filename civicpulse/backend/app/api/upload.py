import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status


router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "static" / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("/upload")
def upload_image(file: UploadFile = File(...)) -> dict[str, str]:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only jpg, png, and webp images are allowed")

    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image must be 5MB or smaller")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4()}{extension}"
    (UPLOAD_DIR / filename).write_bytes(contents)
    return {"url": f"/static/uploads/{filename}"}
