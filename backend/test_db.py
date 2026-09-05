from db.database import engine
from db.base import Base

from models.user import User

print("Creating tables...")

Base.metadata.create_all(
    bind=engine,
)

print("Done.")
