from .database import engine
from .base import Base

# IMPORT MODELS
from models.user import User
from models.project import Project
from models.report import Report


def init_db():

    Base.metadata.create_all(
        bind=engine,
    )
