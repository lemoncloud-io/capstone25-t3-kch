"""Centralised configuration loader for the API server.

This module ensures that `.env` files are loaded exactly once and exposes a
`Settings` object that other modules (routes, background jobs, etc.) can
reuse instead of sprinkling `os.getenv` calls everywhere.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parents[1]


def _load_env_once() -> None:
    """Load environment variables from known locations (idempotent)."""
    # `load_dotenv` is idempotent, but we call it only for existing paths.
    dotenv_candidates = [BASE_DIR / ".env", PROJECT_ROOT / ".env"]
    for dotenv_path in dotenv_candidates:
        if dotenv_path.exists():
            load_dotenv(dotenv_path=dotenv_path, override=False)


class Settings:
    def __init__(self) -> None:
        _load_env_once()

        # General
        self.environment: str = os.getenv("NODE_ENV", "development")
        self.version: str = os.getenv("VERSION", "0.0.0")

        # Storage / S3
        self.store_mode: str = os.getenv("STORE_MODE", "local").lower()
        self.s3_bucket: str = os.getenv("S3_BUCKET", "").strip()
        self.s3_prefix: str = os.getenv("S3_PREFIX", "thumbnails").strip()
        self.aws_region: str = (
            os.getenv("AWS_REGION")
            or os.getenv("AWS_DEFAULT_REGION")
            or ""
        ).strip()
        self.aws_access_key: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_key: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")

        # Default thumbnail output directory (for local mode)
        default_thumb_dir = BASE_DIR / "data" / "thumbnails"
        thumb_dir_env = os.getenv("THUMBNAIL_DIR")
        self.thumbnail_output_dir: Path = (
            Path(thumb_dir_env).resolve()
            if thumb_dir_env
            else default_thumb_dir
        )
        self.thumbnail_output_dir.mkdir(parents=True, exist_ok=True)

        # Web / API
        self.web_origin: str = os.getenv("WEB_ORIGIN", "http://localhost:5173")

        # OpenAI / external APIs
        self.openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
        self.youthcenter_api_key: Optional[str] = os.getenv("YOUTHCENTER_API_KEY")

        # Database URLs
        self.database_url: Optional[str] = os.getenv("DB_URL") or os.getenv("DATABASE_URL")

    # Convenience helpers -------------------------------------------------

    @property
    def use_s3(self) -> bool:
        return self.store_mode == "s3" and bool(self.s3_bucket)

    def ensure_database_url(self) -> str:
        if not self.database_url:
            raise RuntimeError("DB_URL 또는 DATABASE_URL 환경 변수가 필요합니다.")
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Eager instance for modules that prefer direct import
settings = get_settings()


