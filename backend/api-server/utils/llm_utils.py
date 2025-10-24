import os
from openai import OpenAI
from fastapi import HTTPException
from typing import Dict, Any
import json
from pathlib import Path # Path 임포트 추가

# PROMPT_CONFIG_DIR를 프로젝트 루트 기준으로 설정하거나, llm_utils.py 파일 기준으로 상대 경로 설정
# 여기서는 llm_utils.py 파일 기준으로 상위 디렉토리 (api-server)로 이동 후 prompts_config를 찾도록 설정
PROMPT_CONFIG_DIR = Path(__file__).parent.parent / "prompts_config"

def get_openai_client() -> OpenAI:
    """OpenAI 클라이언트를 초기화하고 반환합니다."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)

class PromptGenerator:
    def __init__(self, client: OpenAI):
        self.client = client
        self.model = "gpt-4o-mini"
        self._load_system_prompts()
        
    def _load_system_prompts(self):
        """JSON 파일에서 시스템 프롬프트를 로드합니다."""
        self.system_prompts = {}
        for prompt_file in PROMPT_CONFIG_DIR.glob("*.json"):
            try:
                with open(prompt_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    key = prompt_file.stem.replace("_system_prompt", "")
                    self.system_prompts[key] = data.get("system_prompt")
            except Exception as e:
                print(f"Error loading prompt from {prompt_file}: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to load prompt configuration: {e}")
        
        if not all(key in self.system_prompts for key in ["title", "summary", "blog_content"]):
            raise HTTPException(status_code=500, detail="Missing one or more system prompts in configuration files.")    
   
    def _generate_text_with_llm(self, system_prompt_key: str, user_prompt: str, max_tokens: int = 600, temperature: float = 0.7) -> str:
        """
        주어진 프롬프트 키를 사용하여 LLM으로부터 텍스트를 생성합니다.
        """
        system_prompt = self.system_prompts.get(system_prompt_key) 
        if not system_prompt:
            raise HTTPException(status_code=500, detail=f"System prompt for key '{system_prompt_key}' not found.")
        try:
            rsp = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return (rsp.choices[0].message.content or "").strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM 호출 중 오류 발생: {e}")

    def generate_title(self, policy_info: Dict[str, Any]) -> str:
        """
        정책 정보를 바탕으로 블로그 제목을 생성합니다.
        """
        region = policy_info.get("region", "전국")
        title = policy_info.get("title", "")
        summary_main = policy_info.get("summary", "")
        content_data = policy_info.get("content_data", {})
        benefit = content_data.get("benefit", "혜택 제공") if isinstance(content_data, dict) else "혜택 제공"
        category = policy_info.get("category_auto") or policy_info.get("category", "정책")

        user_prompt = (
            "[정책 정보]\n"
            f"- 지역: {region}\n"
            f"- 정책명: {title}\n"
            f"- 정책 요약: {summary_main}\n"
            f"- 카테고리: {category}\n"
            f"- 혜택: {benefit}"
        )
        return self._generate_text_with_llm("title", user_prompt, max_tokens=50, temperature=0.9)

    def generate_summary(self, policy_info: Dict[str, Any]) -> str:
        """
        정책 정보를 바탕으로 요약문을 생성합니다.
        """
        title = policy_info.get("title", "")
        summary_main = policy_info.get("summary", "")
        content_data = policy_info.get("content_data", {})
        target = content_data.get("who", "청년") if isinstance(content_data, dict) else "청년"
        benefit = content_data.get("benefit", summary_main) if isinstance(content_data, dict) else summary_main
        
        user_prompt = (
            "[정책 정보]\n"
            f"- 정책명: {title}\n"
            f"- 정책 요약: {summary_main}\n"
            f"- 지원 대상: {target}\n"
            f"- 핵심 혜택: {benefit}"
        )
        return self._generate_text_with_llm("summary", user_prompt, max_tokens=100)

    def generate_blog_content(self, policy_data: Dict[str, Any]) -> str:
        """
        정책 정보를 바탕으로 블로그 본문을 생성합니다.
        """
        policy_summary = policy_data.get("summary", "")
        content_data = policy_data.get("content_data", {})
        
        if isinstance(content_data, dict):
            target = content_data.get("who", "청년")
            benefit = content_data.get("benefit", policy_summary)
            apply_method = content_data.get("apply_method", "온라인 신청")
            documents = content_data.get("documents", "신청 시 안내")
        else:
            target = "청년"
            benefit = policy_summary
            apply_method = "온라인 신청"
            documents = "신청 시 안내"
        
        user_prompt = (
            "[작성 항목]\n"
            f"1. 어떤 정책인가요?: {policy_summary} 내용을 바탕으로 정책을 소개해줘.\n"
            f"2. 누가 신청할 수 있나요?: {target} 정보를 풀어서 설명해줘.\n"
            f"3. 어떤 혜택을 받을 수 있나요?: {benefit} 내용을 구체적으로 작성해줘.\n"
            f"4. 어떻게 신청하나요?: {apply_method} 정보를 안내해줘.\n"
            f"5. 필요한 서류: {documents}\n\n"
            "[정책 정보]\n"
            f"{json.dumps(policy_data, ensure_ascii=False, indent=2)}"
        )
        return self._generate_text_with_llm("blog_content", user_prompt, max_tokens=1000, temperature=0.8)