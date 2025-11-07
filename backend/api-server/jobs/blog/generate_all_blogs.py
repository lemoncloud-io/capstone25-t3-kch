"""
DB에 있는 모든 정책에 대해 블로그를 생성하고 저장하는 스크립트
"""
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from openai import OpenAI

# 프로젝트 루트를 sys.path에 추가
project_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(project_root))

from utils.llm_utils import PromptGenerator

# .env 로드
load_dotenv()
DB_URL = os.getenv("DB_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not DB_URL:
    raise RuntimeError("DB_URL이 .env에 없습니다.")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY가 .env에 없습니다.")

engine = create_engine(DB_URL, pool_pre_ping=True)
client = OpenAI(api_key=OPENAI_API_KEY)

def create_blog_table():
    """블로그 테이블 생성"""
    print("블로그 테이블 생성 중")
    sql_file = Path(__file__).parent / "create_blog_table.sql"
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    with engine.begin() as conn:
        conn.execute(text(sql))
    print("블로그 테이블 생성 완료")

def get_all_policies():
    """모든 정책 조회"""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT plcy_no, title, category, category_auto, region,
                   amount_min, amount_max, period_start, period_end,
                   provider, summary, content_data
            FROM policy_clean
            ORDER BY updated_at DESC
        """))
        return [dict(row) for row in result.mappings()]

def check_existing_blog(plcy_no: str) -> bool:
    """이미 생성된 블로그인지 확인"""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT COUNT(*) as cnt FROM blog_posts WHERE plcy_no = :plcy_no
        """), {"plcy_no": plcy_no})
        row = result.fetchone()
        return row[0] > 0

def save_blog_to_db(plcy_no: str, title: str, summary: str, content: str, 
                    category: str = None, region: str = None, keywords: list = None):
    """블로그를 DB에 저장"""
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
            "title": title,
            "summary": summary,
            "content": content,
            "category": category,
            "region": region,
            "keywords": keywords
        })

def save_error_to_db(plcy_no: str, error_msg: str):
    """에러 발생 시 DB에 기록"""
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
        """), {"plcy_no": plcy_no, "error_msg": error_msg})

def generate_all_blogs(skip_existing: bool = True, limit: int = None):
    """모든 정책에 대해 블로그 생성"""
    
    # 테이블 생성
    create_blog_table()
    
    # 정책 조회
    print("정책 데이터 조회 중")
    policies = get_all_policies()
    total = len(policies)
    
    if limit:
        policies = policies[:limit]
        print(f"⚠️  테스트 모드: {limit}개만 생성합니다.")
    
    print(f"총 {total}개 정책 중 {len(policies)}개 처리 예정\n")
    
    generator = PromptGenerator(client)
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for idx, policy in enumerate(policies, 1):
        plcy_no = policy['plcy_no']
        title = policy['title']
        
        try:
            # 이미 생성된 블로그는 건너뛰기
            if skip_existing and check_existing_blog(plcy_no):
                print(f"[{idx}/{len(policies)}] ⏭️  건너뛰기: {plcy_no} - {title}")
                skip_count += 1
                continue
            
            print(f"[{idx}/{len(policies)}] 🔄 생성 중: {plcy_no} - {title}")
            
            # 블로그 생성
            blog_title = generator.generate_title(policy)
            time.sleep(0.5)  # Rate limit 방지
            
            blog_summary = generator.generate_summary(policy)
            time.sleep(0.5)
            
            blog_content = generator.generate_blog_content(policy)
            time.sleep(0.5)
            
            # 참조 URL 추출
            ref_urls = []
            if policy.get('content_data') and isinstance(policy['content_data'], dict):
                ref_url1 = policy['content_data'].get('ref_url1')
                ref_url2 = policy['content_data'].get('ref_url2')
                if ref_url1:
                    ref_urls.append(ref_url1)
                if ref_url2:
                    ref_urls.append(ref_url2)
            
            # 안내 문구 추가
            disclaimer = "\n\n이 정책의 연령, 소득 기준 등 세부 조건은 실제와 다를 수 있으니, 신청 전 반드시 공식 웹사이트에서 최신 정보를 확인하시기 바랍니다."
            
            # 참조 URL이 있으면 추가
            if ref_urls:
                disclaimer += "\n\n자세한 사항은 아래 홈페이지를 참고하시길 바랍니다."
                for i, url in enumerate(ref_urls, 1):
                    disclaimer += f"\n- 참고 링크 {i}: {url}"
            
            blog_content = blog_content.strip() + disclaimer
            
            # DB 저장
            keywords = []
            if policy.get('content_data') and isinstance(policy['content_data'], dict):
                keywords = policy['content_data'].get('keywords', [])
            
            save_blog_to_db(
                plcy_no=plcy_no,
                title=blog_title,
                summary=blog_summary,
                content=blog_content,
                category=policy.get('category_auto'),
                region=policy.get('region'),
                keywords=keywords
            )
            
            success_count += 1
            print(f"[{idx}/{len(policies)}] 완료: {plcy_no}")
            print(f"   제목: {blog_title[:50]}...")
            print()
            
        except Exception as e:
            error_count += 1
            error_msg = str(e)
            print(f"[{idx}/{len(policies)}] 실패: {plcy_no} - {error_msg}")
            save_error_to_db(plcy_no, error_msg)
            time.sleep(1)  # 에러 후 잠시 대기
    
    # 최종 결과
    print("\n" + "="*60)
    print("생성 결과")
    print("="*60)
    print(f"성공: {success_count}개")
    print(f"건너뛰기: {skip_count}개")
    print(f"실패: {error_count}개")
    print(f"총 처리: {success_count + skip_count + error_count}개")
    print("="*60)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='블로그 일괄 생성')
    parser.add_argument('--no-skip', action='store_true', help='기존 블로그도 다시 생성')
    parser.add_argument('--limit', type=int, help='생성할 개수 제한 (테스트용)')
    
    args = parser.parse_args()
    
    print("블로그 일괄 생성 시작\n")
    generate_all_blogs(skip_existing=not args.no_skip, limit=args.limit)
    print("\n완료!")

