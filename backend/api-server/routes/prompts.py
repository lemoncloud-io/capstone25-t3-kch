print("Executing prompts.py module...") # 추가
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

from utils.llm_utils import PromptGenerator, get_openai_client
from utils.data_utils import get_dummy_policy_data, get_dummy_policy_data_full
from openai import OpenAI

router = APIRouter(tags=["prompts"])
print("APIRouter for prompts initialized.") # 추가

# 중첩 스키마 정의: blog_json 내부 구조를 Pydantic 모델로 명확히 정의
class PolicyConditions(BaseModel):
    target: Optional[str] = None

class PolicyApply(BaseModel):
    method: Optional[str] = None

class BlogJson(BaseModel):
    conditions: Optional[PolicyConditions] = Field(default_factory=PolicyConditions)
    summary: Optional[str] = None
    apply: Optional[PolicyApply] = Field(default_factory=PolicyApply)

# 메인 PolicyInput 모델 정의: 모든 필드를 Optional로 변경하고 기본값 설정
class PolicyInput(BaseModel):
    # 실제 정책 데이터 구조에 맞춰 조정 필요
    plcy_no: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    summary: Optional[str] = None
    blog_json: Optional[BlogJson] = Field(default_factory=BlogJson)

class GeneratedContent(BaseModel):
    title: str
    summary: str
    blog_content: str

@router.post("/generate-title")
async def generate_blog_title_api(
    # 요청 본문이 없을 경우 None을 받기 위해 Union[PolicyInput, None] 또는 Optional 사용
    # 그리고 Body(...)를 사용하여 FastAPI가 이를 요청 본문으로 처리하도록 명시
    policy_info: Optional[PolicyInput] = None,
    client: OpenAI = Depends(get_openai_client)
):
    print("Registering API: generate_blog_title_api") # 추가
    """
    정책 정보를 바탕으로 블로그 제목을 생성합니다.
    테스트를 위해 정책 정보가 제공되지 않으면 더미 데이터를 사용합니다.
    """
    if policy_info is None or (not policy_info.plcy_no and not policy_info.title):
        # policy_info가 None이거나 주요 필드가 비어있으면 더미 데이터 사용
        policy_info_dict = get_dummy_policy_data()
    else:
        # Pydantic 모델을 딕셔너리로 변환 시, None 값 필드 제외
        # by_alias=True는 별칭(alias) 사용 시 유용하지만, 여기서는 필드명이 같으므로 생략 가능
        policy_info_dict = policy_info.dict(exclude_none=True)

    generator = PromptGenerator(client)
    try:
        generated_title = generator.generate_title(policy_info_dict)
        return {"title": generated_title}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"제목 생성 중 오류 발생: {e}")

@router.post("/generate-summary")
async def generate_blog_summary_api(
    policy_info: Optional[PolicyInput] = None,
    client: OpenAI = Depends(get_openai_client)
):
    """
    정책 정보를 바탕으로 블로그 요약문을 생성합니다.
    테스트를 위해 정책 정보가 제공되지 않으면 더미 데이터를 사용합니다.
    """
    if policy_info is None or (not policy_info.plcy_no and not policy_info.title):
        policy_info_dict = get_dummy_policy_data()
    else:
        policy_info_dict = policy_info.dict(exclude_none=True)

    generator = PromptGenerator(client)
    try:
        generated_summary = generator.generate_summary(policy_info_dict)
        return {"summary": generated_summary}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"요약문 생성 중 오류 발생: {e}")

@router.post("/generate-blog-content")
async def generate_full_blog_content_api(
    policy_data: Optional[PolicyInput] = None,
    client: OpenAI = Depends(get_openai_client)
):
    """
    정책 정보를 바탕으로 블로그 본문을 생성합니다.
    테스트를 위해 정책 정보가 제공되지 않으면 더미 데이터를 사용합니다.
    """
    if policy_data is None or (not policy_data.plcy_no and not policy_data.title):
        policy_data_dict = get_dummy_policy_data_full() # 본문 생성을 위해 더미 full 데이터 사용
    else:
        policy_data_dict = policy_data.dict(exclude_none=True)

    generator = PromptGenerator(client)
    try:
        generated_content = generator.generate_blog_content(policy_data_dict)
        return {"blog_content": generated_content}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"본문 생성 중 오류 발생: {e}")

@router.post("/generate-full-blog")
async def generate_full_blog_api(
    policy_data: Optional[PolicyInput] = None,
    client: OpenAI = Depends(get_openai_client)
) -> GeneratedContent:
    """
    정책 정보를 바탕으로 제목, 요약, 본문 전체를 생성합니다.
    테스트를 위해 정책 정보가 제공되지 않으면 더미 데이터를 사용합니다.
    """
    if policy_data is None or (not policy_data.plcy_no and not policy_data.title):
        policy_data_dict = get_dummy_policy_data_full() # 본문 생성을 위해 더미 full 데이터 사용
    else:
        policy_data_dict = policy_data.dict(exclude_none=True)

    generator = PromptGenerator(client)
    try:
        title = generator.generate_title(policy_data_dict)
        summary = generator.generate_summary(policy_data_dict)
        blog_content = generator.generate_blog_content(policy_data_dict)
        return GeneratedContent(title=title, summary=summary, blog_content=blog_content)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"블로그 전체 생성 중 오류 발생: {e}")