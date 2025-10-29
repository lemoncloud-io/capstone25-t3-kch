"""
Shared database engine and utilities for all routers.

This module provides a centralized database connection pool to avoid
creating duplicate SQLAlchemy engines across different route modules.
"""
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DB_URL")
if not DB_URL:
    raise RuntimeError("DB_URL이 .env에 없습니다.")

# Single shared engine instance with connection pooling
engine = create_engine(DB_URL, pool_pre_ping=True)
