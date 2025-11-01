import json
from typing import Dict, Any

def get_dummy_policy_data() -> Dict[str, Any]:
    """
    테스트를 위한 더미 정책 데이터를 반환합니다.
    실제 데이터 전처리가 완료되면 이 함수를 제거하고 실제 DB 또는 API에서 데이터를 가져오도록 변경합니다.
    """
    return {
        "plcy_no": "20230001",
        "title": "청년 디지털 역량 강화 교육",
        "category": "교육",
        "category_auto": "취업/교육",
        "region": "서울특별시",
        "amount_min": 0,
        "amount_max": 0,
        "period_start": "2023-09-01",
        "period_end": "2023-12-31",
        "provider": "서울시청",
        "summary": "미래 디지털 인재 양성을 위한 교육 프로그램입니다. 수료 시 인턴십 기회와 취업 연계 혜택을 제공합니다.",
        "blog_json": {
            "conditions": {
                "target": "만 18세 이상 34세 이하 서울시 거주 청년 중 미취업자"
            },
            "summary": "총 3개월간의 웹 개발, 데이터 분석, AI 기초 등 디지털 역량 강화 교육을 무료로 제공하며, 교육 수료 시 협력 기업 인턴십 및 취업 연계 기회를 받을 수 있습니다.",
            "apply": {
                "method": "서울시 청년몽땅정보통 웹사이트에서 온라인 신청. 선착순 마감."
            }
        }
    }

def get_dummy_policy_data_full() -> Dict[str, Any]:
    """
    블로그 본문 생성을 위한 더미 정책 데이터 (blog_json 포함)
    """
    return {
        "plcy_no": "20230002",
        "title": "경기도 청년 기본소득",
        "category": "복지",
        "category_auto": "금융지원",
        "region": "경기도",
        "amount_min": 250000,
        "amount_max": 1000000,
        "period_start": "2023-01-01",
        "period_end": "2023-12-31",
        "provider": "경기도청",
        "summary": "분기별 25만원씩 연 100만원을 지역화폐로 지급하여 청년의 사회활동을 지원합니다.",
        "blog_json": {
            "conditions": {
                "target": "만 24세 경기도 거주 청년 (3년 이상 계속 거주 또는 합산 10년 이상 거주)"
            },
            "summary": "경기도에 거주하는 만 24세 청년에게 분기별 25만원, 연간 최대 100만원을 지역화폐로 지급하여 경제적 어려움을 덜고 사회 활동을 독려합니다. 취업, 학업, 자기계발 등 다양한 목적으로 활용 가능합니다.",
            "apply": {
                "method": "경기도 청년 기본소득 웹사이트에서 온라인 신청. 주민등록초본, 개인정보 동의서 등 필요 서류 제출."
            }
        }
    }