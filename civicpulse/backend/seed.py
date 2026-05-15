from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.user import User, UserRole


def seed_admin() -> None:
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@civicpulse.com").first()
        if admin:
            print("Admin user already exists")
            return

        admin = User(
            name="CivicPulse Admin",
            email="admin@civicpulse.com",
            hashed_password=hash_password("admin123"),
            role=UserRole.admin,
        )
        db.add(admin)
        db.commit()
        print("Admin user created: admin@civicpulse.com / admin123")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
