"""
블로그 콘텐츠 생성 관련 유틸리티 함수
"""

def add_blog_footer(content: str, policy_data: dict) -> str:
    """
    블로그 콘텐츠를 그대로 반환합니다.
    (LLM이 프롬프트에 따라 모든 내용을 생성하므로 추가 작업 불필요)
    
    Args:
        content: 블로그 본문 내용
        policy_data: 정책 데이터 (사용하지 않음)
    
    Returns:
        원본 블로그 콘텐츠
    """
    return content.strip()

