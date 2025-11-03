"""
로깅 설정 모듈
- 파일 로그 (app.log, error.log)
- 콘솔 로그
- 환경별 로그 레벨 설정 가능
"""
import os
import logging
from pathlib import Path
from logging.handlers import RotatingFileHandler


def setup_logging(
    log_level: str = "INFO",
    log_dir: str = "logs",
    log_file: str = "app.log",
    max_bytes: int = 5 * 1024 * 1024,  # 5MB
    backup_count: int = 3
):
    """
    로깅 시스템 초기화
    
    Args:
        log_level: 로그 레벨 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: 로그 파일 저장 디렉토리
        log_file: 로그 파일명
        max_bytes: 로그 파일 최대 크기 (기본 5MB)
        backup_count: 백업 파일 개수 (기본 3개)
    """
    # 로그 디렉토리 생성
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)
    
    # 루트 로거 가져오기
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # 기존 핸들러 제거 (중복 방지)
    logger.handlers.clear()
    
    # 상세 포맷 (파일용)
    detailed_formatter = logging.Formatter(
        '%(asctime)s %(levelname)-8s [%(name)s:%(funcName)s:%(lineno)d] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # 간단한 포맷 (콘솔용)
    simple_formatter = logging.Formatter(
        '%(asctime)s %(levelname)-8s %(message)s',
        datefmt='%H:%M:%S'
    )
    
    # 1) 파일 핸들러 - 모든 로그 (app.log)
    file_handler = RotatingFileHandler(
        log_path / log_file,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    file_handler.setFormatter(detailed_formatter)
    file_handler.setLevel(logging.DEBUG)  # 파일엔 모든 로그
    logger.addHandler(file_handler)
    
    # 2) 콘솔 핸들러 - INFO 이상만
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(simple_formatter)
    console_handler.setLevel(logging.INFO)
    logger.addHandler(console_handler)
    
    # 3) 에러 전용 파일 핸들러 (error.log)
    error_handler = RotatingFileHandler(
        log_path / "error.log",
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    error_handler.setFormatter(detailed_formatter)
    error_handler.setLevel(logging.ERROR)  # ERROR, CRITICAL만
    logger.addHandler(error_handler)
    
    # 외부 라이브러리 로그 레벨 조정 (너무 시끄러운 것들 조용하게)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("boto3").setLevel(logging.WARNING)
    logging.getLogger("botocore").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    
    logger.info("=" * 50)
    logger.info("로깅 시스템 초기화 완료")
    logger.info(f"로그 레벨: {log_level}")
    logger.info(f"로그 파일: {log_path.absolute() / log_file}")
    logger.info(f"에러 로그: {log_path.absolute() / 'error.log'}")
    logger.info("=" * 50)


def get_logger(name: str) -> logging.Logger:
    """
    모듈별 로거 가져오기 (편의 함수)
    
    Usage:
        from logging_config import get_logger
        logger = get_logger(__name__)
        logger.info("Hello")
    """
    return logging.getLogger(name)