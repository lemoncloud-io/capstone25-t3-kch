import os
from openai import OpenAI
from fastapi import HTTPException
from typing import Dict, Any
import json

def get_openai_client() -> OpenAI:
    """OpenAI 클라이언트를 초기화하고 반환합니다."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)

class PromptGenerator:
    def __init__(self, client: OpenAI):
        self.client = client
        self.model = "gpt-4o-mini" # 또는 다른 적절한 모델

    def _generate_text_with_llm(self, system_prompt: str, user_prompt: str, max_tokens: int = 600, temperature: float = 0.7) -> str:
        """
        주어진 프롬프트를 사용하여 LLM으로부터 텍스트를 생성합니다.
        """
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
        blog_summary = policy_info.get("blog_json", {}).get("summary", summary_main)
        category = policy_info.get("category", "정책")

        system_prompt = (
            "너는 지금부터 청년 정책을 소개하는 블로그의 에디터야. "
            "아래의 정책 정보를 바탕으로, 20대 대학생과 취업준비생이 흥미를 느끼고 클릭하고 싶게 "
            "만드는 블로그 제목을 1개만 생성해줘. 제목에는 반드시 정책의 핵심 혜택이 "
            "드러나야 하고, 재치있는 이모지를 1개만 앞에 붙여줘. 30자 이내로 간결하게 "
            "만들어줘."
        )
        user_prompt = (
            "[정책 정보]\n"
            f"- 지역: {region}\n"
            f"- 정책명: {title}\n"
            f"- 정책 요약: {blog_summary}\n"
            f"- 카테고리: {category}"
        )
        return self._generate_text_with_llm(system_prompt, user_prompt, max_tokens=50, temperature=0.9)

    def generate_summary(self, policy_info: Dict[str, Any]) -> str:
        """
        정책 정보를 바탕으로 요약문을 생성합니다.
        """
        title = policy_info.get("title", "")
        summary_main = policy_info.get("summary", "")
        blog_summary = policy_info.get("blog_json", {}).get("summary", summary_main)
        target = policy_info.get("blog_json", {}).get("conditions", {}).get("target", "청년")

        system_prompt = (
            "너는 지금부터 청년 정책을 소개하는 블로그의 에디터야. "
            "아래의 정책 정보를 보고, 이 정책이 누구에게 어떤 도움을 주는지 핵심만 요약해서 "
            "1~2문장으로 설명해줘. 부드러운 구어체로 작성하고, 마지막에는 "
            "\"~해보세요!\"와 같은 Call-to-Action 문구를 넣어줘."
        )
        user_prompt = (
            "[정책 정보]\n"
            f"- 정책명: {title}\n"
            f"- 정책 요약: {summary_main}\n"
            f"- 지원 대상: {target}\n"
            f"- 핵심 혜택: {blog_summary}"
        )
        return self._generate_text_with_llm(system_prompt, user_prompt, max_tokens=100)

    def generate_blog_content(self, policy_data: Dict[str, Any]) -> str:
        """
        정책 정보를 바탕으로 블로그 본문을 생성합니다.
        """
        policy_summary = policy_data.get("summary", "")
        blog_json_summary = policy_data.get("blog_json", {}).get("summary", policy_summary)
        target = policy_data.get("blog_json", {}).get("conditions", {}).get("target", "청년")
        apply_method = policy_data.get("blog_json", {}).get("apply", {}).get("method", "온라인 신청")

        system_prompt = (
            "너는 지금부터 청년 정책을 소개하는 블로그의 에디터야. 아래의 정책 "
            "정보를 바탕으로, 블로그 본문을 작성해줘. 각 정보는 아래 항목에 맞춰서 "
            "명확하고 이해하기 쉽게 정리해줘."
        )
        user_prompt = (
            "[작성 항목]\n"
            "1. 어떤 정책인가요?: {summary} 내용을 바탕으로 정책을 소개해줘.\n"
            "2. 누가 신청할 수 있나요?: {blog_json.conditions.target} 정보를 풀어서 설명해줘.\n"
            "3. 어떤 혜택을 받을 수 있나요?: {blog_json.summary} 내용을 구체적으로 작성해줘.\n"
            "4. 어떻게 신청하나요?: {blog_json.apply.method} 정보를 안내해줘.\n\n"
            "[정책 정보]\n"
            f"{json.dumps(policy_data, ensure_ascii=False, indent=2)}"
        )
        return self._generate_text_with_llm(system_prompt, user_prompt, max_tokens=1000, temperature=0.8)