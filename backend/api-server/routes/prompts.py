from fastapi import APIRouter, HTTPException, Depends, Query, Path
from pydantic import BaseModel
from typing import Optional, Literal
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

from utils.llm_utils import PromptGenerator, get_openai_client
from utils.blog_utils import add_blog_footer
from openai import OpenAI

load_dotenv()
DB_URL = os.getenv("DB_URL")
if not DB_URL:
    raise RuntimeError("DB_URL이 .env에 없습니다.")

engine = create_engine(DB_URL, pool_pre_ping=True)

router = APIRouter(tags=["policies"])

# 응답 모델
class GeneratedMeta(BaseModel):
    title: str
    description: str
    keywords: list[str]
    robots: Optional[str] = "noindex,nofollow"  # 검색로봇, 개발 중 색인 방지용
    #thumbnail_img: Optional[str] = None     # 미리보기 이미지(S3 URL 삽입 예정)

class GeneratedContent(BaseModel):
    title: str
    summary: str
    blog_content: str
    meta: Optional[GeneratedMeta] = None

class GeneratedTitle(BaseModel):
    title: str

class GeneratedSummary(BaseModel):
    summary: str

class GeneratedBlogContent(BaseModel):
    blog_content: str
# ========== 헬퍼 함수: DB에서 정책 데이터 조회 ==========
def get_policy_from_db(plcy_no: str):
    """
    데이터베이스에서 정제된 정책 데이터를 조회합니다.
    """
    with engine.connect() as conn:
        sql = text("""
          SELECT plcy_no, title, category, category_auto, region,
          amount_min, amount_max,
          period_start, period_end,
          provider, summary, content_data
        FROM policy_clean
        WHERE plcy_no = :plcy_no
        LIMIT 1
        """)
        row = conn.execute(sql, {"plcy_no": plcy_no}).mappings().fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"정책을 찾을 수 없습니다: {plcy_no}")
        
        return dict(row)

def _confirm_category_for_policy(policy: dict) -> str:
    """
    policy dict에서 최종 카테고리 라벨을 확정한다.
    1) category_auto (자동/키워드 분류)가 가장 정확하므로 우선 사용
    2) 없으면 원본 category 사용
    3) 그래도 없으면 '복지' (기본값)
    """
    auto_ = (policy.get('category_auto') or '').strip()
    if auto_:
        return auto_

    label = (policy.get('category') or '').strip()
    if label:
        return label
        
    return '복지'  # 기본값

def save_blog_to_db(plcy_no: str, title: str, summary: str, content: str, 
                    category: str = None, region: str = None, keywords: list = None):
    """블로그를 DB에 저장"""
    try:
        with engine.begin() as conn:
            result = conn.execute(text("""
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
            print(f"✅ 블로그 저장 완료: plcy_no={plcy_no}, title={title[:50]}...")
            return result
    except Exception as e:
        print(f"❌ 블로그 저장 실패: plcy_no={plcy_no}, error={str(e)}")
        raise

# ========== API 엔드포인트 ==========

@router.post("/policies/{plcy_no}/content")
async def generate_policy_content(
    plcy_no: str = Path(..., description="정책 번호"),
    type: Literal["title", "summary", "blog", "meta", "full"] = Query(..., description="생성할 콘텐츠 타입"),
    client: OpenAI = Depends(get_openai_client)
):
    """
    정책 번호를 받아 DB에서 정제된 데이터를 조회하고,
    지정된 타입의 블로그 콘텐츠를 생성합니다.
    
    **지원하는 타입:**
    - `title`: SEO 최적화된 블로그 제목 생성
    - `summary`: 청년 친화적 요약문 생성  
    - `blog`: SEO 최적화된 블로그 본문 생성
    - `meta`: SEO 메타데이터 생성
    - `full`: 제목+요약+본문 전체 생성
    
    **데이터 정제 기능 활용:**
    - clean_text: HTML 태그 제거, 텍스트 정제
    - normalize_amount_span: 금액 정규화
    - classify_category_hybrid: 하이브리드 카테고리 분류
    - simplify_documents: 서류 목록 간소화
    
    **SEO 최적화:**
    - 하위/롱테일 키워드 활용
    - 연관 키워드 사용 (중복 방지)
    - 문장 구조 다양화
    - 논리적 흐름 유지
    - 메타 태그 삽입
    - 검색 로봇 지침 포함
    - 미리보기 이미지 (S3 URL 삽입 예정)
    """
    policy_data = get_policy_from_db(plcy_no)
    generator = PromptGenerator(client)
    
    try:
        if type == "title":
            generated_title = generator.generate_title(policy_data)
            return GeneratedTitle(title=generated_title)
            
        elif type == "summary":
            generated_summary = generator.generate_summary(policy_data)
            return GeneratedSummary(summary=generated_summary)
            
        elif type == "blog":
            generated_content = generator.generate_blog_content(policy_data)
            generated_content = add_blog_footer(generated_content, policy_data)
            return GeneratedBlogContent(blog_content=generated_content)

        elif type == "meta":
            meta_title = generator.generate_title(policy_data)
            meta_summary = generator.generate_summary(policy_data)
            keywords = (policy_data.get("keywords") or [])[:3]
            #thumbnail_img = policy_data.get("thumbnail_img") or None   # 썸네일 S3 URL을 policy_data에 넣어둔다고 가정함

            meta = GeneratedMeta(
                title=meta_title,
                description=meta_summary,
                keywords=keywords,
                robots="noindex,nofollow"
                #thumbnail_img=thumbnail_img
            )
            return meta

        elif type == "full":
            title = generator.generate_title(policy_data)
            summary = generator.generate_summary(policy_data)
            blog_content = generator.generate_blog_content(policy_data)
            blog_content = add_blog_footer(blog_content, policy_data)
            keywords = []
            if policy_data.get('content_data') and isinstance(policy_data['content_data'], dict):
                keywords = policy_data['content_data'].get('keywords', [])
            
            # 카테고리 확정
            confirmed_category = _confirm_category_for_policy(policy_data)
            region = policy_data.get('region')
            
            # DB에 저장
            save_blog_to_db(
                plcy_no=plcy_no,
                title=title,
                summary=summary,
                content=blog_content,
                category=confirmed_category,
                region=region,
                keywords=keywords
            )
            
            # 메타데이터 생성
            meta_keywords = keywords[:3] if keywords else []
            #thumbnail_img = policy_data.get("thumbnail_img") or None
            meta = GeneratedMeta(
                title=title,
                description=summary,
                keywords=meta_keywords,
                robots="noindex,nofollow"
                #thumbnail_img=thumbnail_img
            )
            return GeneratedContent(
                title=title,
                summary=summary,
                blog_content=blog_content,
                meta=meta
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type} 생성 중 오류 발생: {e}")
