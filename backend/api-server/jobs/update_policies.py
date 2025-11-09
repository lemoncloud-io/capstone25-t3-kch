#!/usr/bin/env python3
"""
정책 자동 업데이트 크론잡 스크립트

매일 1회 실행되어:
1. youthcenter.go.kr API에서 최신 정책 목록 가져오기
2. DB와 비교하여 신규 정책만 필터링
3. 신규 정책 DB에 저장
4. 썸네일 자동 생성
5. 블로그 자동 생성

사용법:
    python update_policies.py [--dry-run] [--max-pages N]
"""
import os
import sys
import time
import json
import hashlib
import requests
import argparse
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, text
from openai import OpenAI

# 프로젝트 루트 경로 설정
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

# jobs/ontong 모듈 임포트
from jobs.ontong.preprocess import extract_clean_fields, build_content_data
from jobs.ontong.quality import run_quality_checks
from jobs.ontong.storage_pg import upsert_raw_pg, upsert_clean_pg
from utils.llm_utils import PromptGenerator
from utils.blog_utils import add_blog_footer
from settings import get_settings
from routes.blogs import normalize_category

settings = get_settings()

# 환경 변수
API_URL = "https://www.youthcenter.go.kr/go/ythip/getPlcy"
API_KEY = settings.youthcenter_api_key
PAGE_SIZE = int(os.getenv("PAGE_SIZE", "50"))
MAX_PAGES = int(os.getenv("MAX_PAGES", "5"))
DB_URL = settings.ensure_database_url()
OPENAI_API_KEY = settings.openai_api_key
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# 로그 디렉토리 설정
LOG_DIR = project_root / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / f"update_policies_{datetime.now().strftime('%Y%m%d')}.log"

def log(msg: str, level: str = "INFO"):
    """로그 출력 및 파일 저장"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_msg = f"[{timestamp}] [{level}] {msg}"
    print(log_msg)
    
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_msg + "\n")

def validate_env():
    """필수 환경 변수 검증"""
    if not API_KEY:
        raise RuntimeError("YOUTHCENTER_API_KEY가 .env에 없습니다.")
    if not DB_URL:
        raise RuntimeError("DB_URL이 .env에 없습니다.")
    if not OPENAI_API_KEY:
        log("OPENAI_API_KEY가 없습니다. 블로그/썸네일 생성이 제한됩니다.", "WARNING")

def sha256(obj) -> str:
    """객체의 SHA256 해시값 생성"""
    return hashlib.sha256(
        json.dumps(obj, ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()

def fetch_page(page: int) -> dict:
    """youthcenter API에서 정책 페이지 가져오기"""
    params = {
        "apiKeyNm": API_KEY,
        "rtnType": "json",
        "pageNum": page,
        "pageSize": PAGE_SIZE
    }
    try:
        r = requests.get(API_URL, params=params, timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        log(f"API 호출 실패 (page={page}): {e}", "ERROR")
        raise

def get_existing_policy_ids(engine) -> set:
    """DB에 이미 존재하는 정책 ID 목록 가져오기"""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT plcy_no FROM policy_raw"))
        return {row[0] for row in result}

def create_blog_table_if_not_exists(engine):
    """블로그 테이블 생성 (없는 경우)"""
    sql_file = project_root / "jobs" / "blog" / "create_blog_table.sql"
    
    if not sql_file.exists():
        log("create_blog_table.sql 파일이 없습니다. 블로그 테이블 생성을 건너뜁니다.", "WARNING")
        return
    
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        with engine.begin() as conn:
            conn.execute(text(sql))
        
        log("블로그 테이블 확인/생성 완료", "INFO")
    except Exception as e:
        log(f"블로그 테이블 생성 중 오류: {e}", "WARNING")

def call_thumbnail_api(policy_id: str, category: str) -> dict:
    """썸네일 자동 생성 API 호출"""
    url = f"{BACKEND_URL}/api/thumbnails/auto"
    payload = {
        "policy_id": policy_id,
        "category": category,
        "max_variants": 4,
        "allow_emoji": False,
        "force_two_lines": True
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        log(f"썸네일 API 호출 실패 ({policy_id}): {e}", "ERROR")
        return {"ok": False, "error": str(e)}

def generate_and_save_blog(engine, client, policy_data: dict):
    """블로그 생성 및 DB 저장"""
    plcy_no = policy_data['plcy_no']
    
    try:
        generator = PromptGenerator(client)
        
        # 블로그 생성
        log(f"블로그 생성 중: {plcy_no}", "INFO")
        blog_title = generator.generate_title(policy_data)
        time.sleep(0.5)  # Rate limit 방지
        
        blog_summary = generator.generate_summary(policy_data)
        time.sleep(0.5)
        
        blog_content = generator.generate_blog_content(policy_data)
        time.sleep(0.5)
        
        # 안내 문구 및 참조 URL 추가
        blog_content = add_blog_footer(blog_content, policy_data)
        
        # 키워드 추출
        keywords = []
        if policy_data.get('content_data') and isinstance(policy_data['content_data'], dict):
            keywords = policy_data['content_data'].get('keywords', [])
        
        # 블로그 생성/저장 시 카테고리[일자리/주거/교육/복지]로 통일
        raw_cat = policy_data.get('category') or policy_data.get('category_auto')
        confirmed_category = normalize_category(
            raw_cat,
            policy_data.get('category_auto'),
            policy_data.get('title'),
            policy_data.get('summary'),
        )

        # DB 저장
        with engine.begin() as conn:
            conn.execute(text("""
                INSERT INTO blog_posts (plcy_no, blog_title, blog_summary, blog_content, 
                                       category, region, keywords)
                VALUES (:plcy_no, :title, :summary, :content, :category, :region, :keywords)
                ON CONFLICT (plcy_no) 
                DO UPDATE SET 
                    blog_title = EXCLUDED.blog_title,
                    blog_summary = EXCLUDED.blog_summary,
                    blog_content = EXCLUDED.blog_content,
                    category = EXCLUDED.category,
                    region = EXCLUDED.region,
                    keywords = EXCLUDED.keywords,
                    updated_at = NOW(),
                    generation_status = 'completed',
                    error_message = NULL
            """), {
                "plcy_no": plcy_no,
                "title": blog_title,
                "summary": blog_summary,
                "content": blog_content,
                "category": confirmed_category,
                "region": policy_data.get('region'),
                "keywords": keywords
            })
        
        log(f"블로그 생성 완료: {plcy_no} - {blog_title[:50]}", "INFO")
        
    except Exception as e:
        log(f"블로그 생성 실패 ({plcy_no}): {e}", "ERROR")
        
        # 에러 저장
        try:
            with engine.begin() as conn:
                conn.execute(text("""
                    INSERT INTO blog_posts (plcy_no, blog_title, blog_summary, blog_content,
                                           generation_status, error_message)
                    VALUES (:plcy_no, '', '', '', 'failed', :error_msg)
                    ON CONFLICT (plcy_no)
                    DO UPDATE SET
                        generation_status = 'failed',
                        error_message = EXCLUDED.error_message,
                        updated_at = NOW()
                """), {"plcy_no": plcy_no, "error_msg": str(e)})
        except Exception as e2:
            log(f"에러 저장 실패: {e2}", "ERROR")

def main(dry_run: bool = False, max_pages: int = None):
    """메인 실행 함수"""
    log("=" * 80)
    log("정책 자동 업데이트 시작")
    log("=" * 80)
    
    # 환경 변수 검증
    validate_env()
    
    # DB 연결
    log(f"DB 연결 중: {DB_URL.split('@')[-1] if '@' in DB_URL else 'localhost'}")
    engine = create_engine(DB_URL, pool_pre_ping=True)
    
    # 블로그 테이블 생성
    create_blog_table_if_not_exists(engine)
    
    # OpenAI 클라이언트
    openai_client = None
    if OPENAI_API_KEY:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
    
    # 기존 정책 ID 조회
    log("기존 정책 목록 조회 중...")
    existing_ids = get_existing_policy_ids(engine)
    log(f"기존 정책 개수: {len(existing_ids)}개")
    
    # API에서 정책 가져오기
    pages_to_fetch = max_pages or MAX_PAGES
    log(f"API 페이지 가져오기 시작 (최대 {pages_to_fetch} 페이지)")
    
    new_policies = []
    total_fetched = 0
    
    for page in range(1, pages_to_fetch + 1):
        try:
            log(f"페이지 {page} 조회 중...")
            data = fetch_page(page)
            items = (data.get("result") or {}).get("youthPolicyList") or []
            
            log(f"페이지 {page}: {len(items)}개 정책 발견")
            total_fetched += len(items)
            
            if not items:
                log("더 이상 정책이 없습니다. 조회 종료")
                break
            
            for it in items:
                plcy_no = (it.get("plcyNo") or "").strip() or "NONE"
                
                # 신규 정책만 필터링
                if plcy_no not in existing_ids:
                    new_policies.append(it)
            
            time.sleep(0.3)  # Rate limit 방지
            
        except Exception as e:
            log(f"페이지 {page} 조회 실패: {e}", "ERROR")
            break
    
    log(f"총 {total_fetched}개 정책 조회, 신규 정책 {len(new_policies)}개 발견")
    
    # 신규 정책이 없으면 종료
    if not new_policies:
        log("신규 정책이 없습니다. 업데이트 종료")
        log("=" * 80)
        return
    
    # Dry run 모드
    if dry_run:
        log("DRY RUN 모드: 실제 저장/생성하지 않음")
        for it in new_policies:
            plcy_no = (it.get("plcyNo") or "").strip()
            title = (it.get("plcyNm") or "").strip()
            log(f"  - {plcy_no}: {title}")
        log("=" * 80)
        return
    
    # 신규 정책 처리
    success_count = 0
    thumbnail_success = 0
    blog_success = 0
    
    for idx, it in enumerate(new_policies, 1):
        plcy_no = (it.get("plcyNo") or "").strip() or "NONE"
        title = (it.get("plcyNm") or "").strip()
        h = sha256(it)
        
        log(f"[{idx}/{len(new_policies)}] 처리 중: {plcy_no} - {title[:50]}")
        
        try:
            # 1. RAW 데이터 저장
            upsert_raw_pg(engine, it, plcy_no, title, h)
            
            # 2. 정제/분류/핵심 데이터 추출
            clean = extract_clean_fields(it)
            content_data = build_content_data(clean)
            
            # 3. 품질 점검
            quality_json = run_quality_checks(it, clean)
            if quality_json["has_issue"]:
                log(f"품질 이슈 발견: {quality_json['issues']}", "WARNING")
            
            # 4. CLEAN 데이터 저장
            upsert_clean_pg(engine, clean, plcy_no, content_data, quality_json)
            
            success_count += 1
            log(f"DB 저장 완료: {plcy_no}")
            
            # 5. 썸네일 자동 생성
            category = clean.get('category_auto') or clean.get('category') or '일자리'
            
            # 카테고리 매핑 (썸네일 API에서 요구하는 형식)
            category_map = {
                '일자리': '일자리',
                '주거': '주거',
                '교육': '교육',
                '복지·문화': '복지',
                '참여·권리': '복지'
            }
            thumb_category = category_map.get(category, '일자리')
            
            if OPENAI_API_KEY:
                try:
                    result = call_thumbnail_api(plcy_no, thumb_category)
                    if result.get("ok"):
                        thumbnail_success += 1
                        log(f"썸네일 생성 완료: {plcy_no}", "INFO")
                    else:
                        log(f"썸네일 생성 실패: {result.get('error', 'Unknown')}", "WARNING")
                    time.sleep(1)  # Rate limit 방지
                except Exception as e:
                    log(f"썸네일 생성 중 예외: {e}", "ERROR")
            
            # 6. 블로그 자동 생성
            if openai_client:
                try:
                    # 블로그 생성을 위한 정책 데이터 준비
                    with engine.connect() as conn:
                        result = conn.execute(text("""
                            SELECT plcy_no, title, category, category_auto, region,
                                   amount_min, amount_max, period_start, period_end,
                                   provider, summary, content_data
                            FROM policy_clean
                            WHERE plcy_no = :plcy_no
                            LIMIT 1
                        """), {"plcy_no": plcy_no})
                        policy_row = result.mappings().first()
                    
                    if policy_row:
                        policy_dict = dict(policy_row)
                        generate_and_save_blog(engine, openai_client, policy_dict)
                        blog_success += 1
                    
                except Exception as e:
                    log(f"블로그 생성 중 예외: {e}", "ERROR")
            
            log(f"[{idx}/{len(new_policies)}] 완료: {plcy_no}")
            log("-" * 80)
            
        except Exception as e:
            log(f"정책 처리 실패 ({plcy_no}): {e}", "ERROR")
            continue
    
    # 최종 결과
    log("=" * 80)
    log("정책 자동 업데이트 완료")
    log("=" * 80)
    log(f"신규 정책 개수: {len(new_policies)}개")
    log(f"DB 저장 성공: {success_count}개")
    log(f"썸네일 생성 성공: {thumbnail_success}개")
    log(f"블로그 생성 성공: {blog_success}개")
    log("=" * 80)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="정책 자동 업데이트 크론잡")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="실제로 저장/생성하지 않고 신규 정책만 출력"
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        help="API에서 가져올 최대 페이지 수 (기본값: MAX_PAGES 환경변수)"
    )
    
    args = parser.parse_args()
    
    try:
        main(dry_run=args.dry_run, max_pages=args.max_pages)
    except Exception as e:
        log(f"치명적 오류 발생: {e}", "ERROR")
        import traceback
        log(traceback.format_exc(), "ERROR")
        sys.exit(1)

