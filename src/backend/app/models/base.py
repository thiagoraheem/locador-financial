"""Base model for all database models"""
from app.core.database import Base

# Re-export Base for models that import from .base
__all__ = ['Base']