from fastapi import APIRouter, HTTPException, Depends, Query, Path
from pydantic import BaseModel
from typing import Optional, Literal
from sqlalchemy import text

from utils.llm_utils import PromptGenerator, get_openai_client
from openai import OpenAI
from database import engine

router = APIRouter(tags=["policies"])

# 응답 모델
class GeneratedContent(BaseModel):
    title: str
    summary: str
    blog_content: str

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

# ========== API 엔드포인트 ==========

@router.post("/policies/{plcy_no}/content")
async def generate_policy_content(
    plcy_no: str = Path(..., description="정책 번호"),
    type: Literal["title", "summary", "blog", "full"] = Query(..., description="생성할 콘텐츠 타입"),
    client: OpenAI = Depends(get_openai_client)
):
    """
    정책 번호를 받아 DB에서 정제된 데이터를 조회하고,
    지정된 타입의 블로그 콘텐츠를 생성합니다.
    
    **지원하는 타입:**
    - `title`: SEO 최적화된 블로그 제목 생성
    - `summary`: 청년 친화적 요약문 생성  
    - `blog`: SEO 최적화된 블로그 본문 생성
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
            return GeneratedBlogContent(blog_content=generated_content)
            
        elif type == "full":
            title = generator.generate_title(policy_data)
            summary = generator.generate_summary(policy_data)
            blog_content = generator.generate_blog_content(policy_data)
            return GeneratedContent(
                title=title,
                summary=summary,
                blog_content=blog_content
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type} 생성 중 오류 발생: {e}")
