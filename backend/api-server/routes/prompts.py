from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

from utils.llm_utils import PromptGenerator, get_openai_client
from openai import OpenAI

load_dotenv()
DB_URL = os.getenv("DB_URL")
if not DB_URL:
    raise RuntimeError("DB_URL이 .env에 없습니다.")

engine = create_engine(DB_URL, pool_pre_ping=True)

router = APIRouter(tags=["prompts"])

# 응답 모델
class GeneratedContent(BaseModel):
    title: str
    summary: str
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

@router.post("/generate-title")
async def generate_blog_title_api(
    plcy_no: str = Query(..., description="정책 번호"),
    client: OpenAI = Depends(get_openai_client)
):
    """
    정책 번호를 받아 DB에서 정제된 데이터를 조회하고, 
    SEO 최적화된 블로그 제목을 생성합니다.
    """
    policy_data = get_policy_from_db(plcy_no)
    generator = PromptGenerator(client)
    
    try:
        generated_title = generator.generate_title(policy_data)
        return {"title": generated_title, "plcy_no": plcy_no}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"제목 생성 중 오류 발생: {e}")

@router.post("/generate-summary")
async def generate_blog_summary_api(
    plcy_no: str = Query(..., description="정책 번호"),
    client: OpenAI = Depends(get_openai_client)
):
    """
    정책 번호를 받아 DB에서 정제된 데이터를 조회하고,
    청년 친화적 요약문을 생성합니다.
    """
    policy_data = get_policy_from_db(plcy_no)
    generator = PromptGenerator(client)
    
    try:
        generated_summary = generator.generate_summary(policy_data)
        return {"summary": generated_summary, "plcy_no": plcy_no}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"요약문 생성 중 오류 발생: {e}")

@router.post("/generate-blog-content")
async def generate_full_blog_content_api(
    plcy_no: str = Query(..., description="정책 번호"),
    client: OpenAI = Depends(get_openai_client)
):
    """
    정책 번호를 받아 DB에서 정제된 데이터를 조회하고,
    SEO 최적화된 블로그 본문을 생성합니다.
    """
    policy_data = get_policy_from_db(plcy_no)
    generator = PromptGenerator(client)
    
    try:
        generated_content = generator.generate_blog_content(policy_data)
        return {"blog_content": generated_content, "plcy_no": plcy_no}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"본문 생성 중 오류 발생: {e}")

@router.post("/generate-full-blog")
async def generate_full_blog_api(
    plcy_no: str = Query(..., description="정책 번호"),
    client: OpenAI = Depends(get_openai_client)
) -> GeneratedContent:
    """
    정책 번호를 받아 DB에서 정제된 데이터를 조회하고,
    제목, 요약, 본문 전체를 한 번에 생성합니다.
    
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
        title = generator.generate_title(policy_data)
        summary = generator.generate_summary(policy_data)
        blog_content = generator.generate_blog_content(policy_data)
        
        return GeneratedContent(
            title=title,
            summary=summary,
            blog_content=blog_content
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"블로그 전체 생성 중 오류 발생: {e}")
