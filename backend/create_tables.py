from db.database import engine
from db.base import Base

# IMPORT MODELS
from models.user import User
from models.project import Project
from models.report import Report

print("Creating tables...")

Base.metadata.create_all(
    bind=engine,
)

print("Done.")
