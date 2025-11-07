"""
블로그 콘텐츠 생성 관련 유틸리티 함수
"""

def add_blog_footer(content: str, policy_data: dict) -> str:
    """
    블로그 콘텐츠에 안내 문구와 참조 URL을 추가합니다.
    
    Args:
        content: 블로그 본문 내용
        policy_data: 정책 데이터 (content_data 포함)
    
    Returns:
        안내 문구와 참조 URL이 추가된 블로그 콘텐츠
    """
    # 참조 URL 추출
    ref_urls = []
    if policy_data.get('content_data') and isinstance(policy_data['content_data'], dict):
        ref_url1 = policy_data['content_data'].get('ref_url1')
        ref_url2 = policy_data['content_data'].get('ref_url2')
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
    
    return content.strip() + disclaimer

