import re
from typing import Optional, Tuple, Dict, Any
from .zipmap_prefix import zip_list_to_region_by_prefix



# 날짜/금액 정규화 -------------------------
def _normalize_ymd_token(tok: str) -> Optional[str]:
    if not tok: return None
    t = re.sub(r"[^\d]", "", tok)
    if len(t) == 8:  # YYYYMMDD
        return f"{t[0:4]}-{t[4:6]}-{t[6:8]}"
    if len(t) == 6:  # YYYYMM
        return f"{t[0:4]}-{t[4:6]}-01"
    if len(t) == 4:  # YYYY
        return f"{t}-01-01"
    return None

def normalize_period_text(period_text: str) -> Tuple[Optional[str], Optional[str]]:
    if not period_text: return (None, None)
    m = re.search(r"([0-9.\-/]{4,})\s*[~\-–]\s*([0-9.\-/]{4,})", period_text)
    if m:
        return (_normalize_ymd_token(m.group(1)), _normalize_ymd_token(m.group(2)))
    m2 = re.search(r"([0-9.\-/]{4,})", period_text)
    if m2:
        return (_normalize_ymd_token(m2.group(1)), None)
    return (None, None)

def normalize_amount_span(text: str):
    """
    금액 범위=>  숫자로 추출(min/max)
    금액 해석에 영향을 주는 단서 => notes에 담아 반환. *llm 변환시 활용 용도

    반환: (amount_min:int|None, amount_max:int|None, notes: list[str])
    """
    if not text:
        return (None, None, [])

    notes = []

    # 1) 주기/횟수 감지 → "연 2회 한도", "월 1회 한도"
    #   - "연 2회", "월 3회", "1인 연 2회" 등
    m_period = re.search(r"(연|월)\s*([0-9]+)\s*회", text)
    if m_period:
        unit = m_period.group(1)  # 연/월
        cnt  = m_period.group(2)
        notes.append(f"{unit} {cnt}회 한도")

    # 2) '1인' 제한 감지 → "1인 기준" 노트
    if re.search(r"1\s*인", text):
        notes.append("1인 기준")

    # 3) '최대/한도' 감지 → "최대 한도 있음"
    if ("최대" in text) and ("한도" in text):
        notes.append("최대 한도 있음")

    # 4) 지급/지원 문맥 → "지원/지급 형태"
    if ("지원" in text) or ("지급" in text):
        notes.append("지원/지급 형태")

    # 5) 금액 숫자 추출 (원/만원/억 지원)
    amounts = []
    for m in re.finditer(r"(\d{1,3}(?:,\d{3})*|\d+)\s*(원|만원|억)", text):
        n = int(m.group(1).replace(",", ""))
        unit = m.group(2)
        if unit == "만원":
            n *= 10_000
        elif unit == "억":
            n *= 100_000_000
        amounts.append(n)

    # 6) 결과 정리
    #   - notes는 중복 제거(순서 유지)
    notes = list(dict.fromkeys(notes))

    if not amounts:
        return (None, None, notes)

    return (min(amounts), max(amounts), notes)

# -------------------------
# FR-17/18/19: 텍스트 정제
#  - HTML 태그/특수문자 제거
#  - 공백/줄바꿈 통일
#  - 연속 반복 단어 제거(간단 규칙)
# -------------------------
TAG_RE = re.compile(r"<[^>]+>")
MULTI_WS = re.compile(r"\s+")

def clean_text(s: Optional[str]) -> str:
    if not s: return ""
    s = TAG_RE.sub(" ", s)                  # HTML 태그 제거
    s = s.replace("\u00A0", " ")            # NBSP 등
    s = re.sub(r"[■◆●◦•▶▪︎➤]+", " ", s)    # 불릿 문자 제거
    s = s.replace("\r", " ").replace("\n", " ")
    s = MULTI_WS.sub(" ", s).strip()
    # 연속 반복 단어(예: "지원 지원")를 1회로
    s = re.sub(r"\b(\w+)\s+\1\b", r"\1", s)
    return s

# -------------------------
# FR-20: 카테고리 분류(하이브리드 방식)
# 1차: 정부 원본 분류 매핑
# 2차: 키워드 기반 보정
# 3차: 제목/내용 분석
# -------------------------

# 정부 원본 분류 → 우리 카테고리 매핑
GOVT_CATEGORY_MAPPING = {
    # 대분류(mclsfNm) 매핑
    "취업": "취업 지원",
    "재직자": "취업 지원",
    "일자리": "취업 지원",
    "창업": "창업",
    "교육비지원": "교육·자격증",
    "미래역량강화": "교육·자격증",
    "주택 및 거주지": "주거",
    "전월세 및 주거급여 지원": "주거",
    "기숙사": "주거",
    "취약계층 및 금융지원": "대출·금융",
    "문화활동": "문화·여가",
    "청년국제교류": "해외 기회",
    "청년참여": "청년 참여",
    "정책인프라구축": "청년 참여",
    
    # 소분류(lclsfNm) 매핑
    "일자리": "취업 지원",
    "교육": "교육·자격증",
    "주거": "주거",
    "복지문화": "문화·여가",
    "참여권리": "청년 참여",
}

# 키워드 규칙
CATEGORY_RULES = {
    "취업 지원": [
        "취업", "채용", "구직", "일자리", "면접", "구인", "고용",
        "취업수당", "면접수당", "구직활동", "채용연계", "직장",
        "정규직", "비정규직", "인턴", "인턴십", "현장실습"
    ],
    "교육·자격증": [
        "교육", "훈련", "강좌", "학습", "수강", "자격증", "면허",
        "학원", "과정", "프로그램", "아카데미", "학자금", "등록금",
        "장학금", "교육비", "수강료", "응시료", "학비"
    ],
    "창업": [
        "창업", "사업화", "스타트업", "액셀러레이터", "보육",
        "시제품", "사업자", "창업가", "기업", "벤처",
        "소상공인", "점포", "매장", "트라이얼", "창업교육"
    ],
    "주거": [
        "주거", "전세", "월세", "보증금", "임대", "임차",
        "청년주택", "LH", "주택", "거주", "주거비",
        "임대료", "주거환경", "주거지", "보금자리", "학사", "자립"
    ],
    "대출·금융": [
        "대출", "융자", "이자", "이차보전", "학자금대출",
        "금융", "신용", "상환", "채무", "저축", "적금",
        "통장", "금리", "대출금", "신용회복"
    ],
    "생활비 지원": [
        "생활비", "지원금", "수당", "바우처", "교통비",
        "통신비", "교통", "버스", "지하철", "패스",
        "생활지원", "현금", "장려금", "생활안정", "정착금"
    ],
    "문화·여가": [
        "문화", "공연", "전시", "문화패스", "문화활동",
        "도서", "독서", "책", "영화", "음악", "관람",
        "축제", "여행", "관광", "체육", "스포츠",
        "운동", "레저", "힐링", "핫플레이스"
    ],
    "건강·상담": [
        "건강", "건강검진", "의료", "병원", "진료", "치료",
        "정신건강", "상담", "심리", "멘탈", "스트레스",
        "우울", "마음", "돌봄", "건강보험", "검진", "고독사", "고립", "은둔"
    ],
    "해외 기회": [
        "해외", "해외취업", "K-Move", "워킹홀리데이",
        "해외인턴", "글로벌인턴", "연수", "해외연수",
        "유학", "어학", "국제", "글로벌", "외국", "IFWY"
    ],
    "청년 참여": [
        "위원회", "참여", "정책참여", "청년위원", "조정위원회",
        "청년정책", "실무위원", "콘텐츠제작", "영상",
        "소셜미디어", "플랫폼", "홍보", "미디어", "네트워킹",
        "커뮤니티", "모임", "청년의날"
    ],
}

def classify_category_hybrid(govt_mclsf: Optional[str], govt_lclsf: Optional[str], texts: list[str]) -> str:
    """
    하이브리드 카테고리 분류
    1차: 정부 원본 분류 매핑 (구체적인 분류만)
    2차: 키워드 기반 분류 (주력)
    """
    # 너무 포괄적인 정부 분류는 제외 (키워드로 재분류)
    SKIP_GOVT_CATEGORIES = ["취약계층 및 금융지원", "복지문화", "참여권리"]
    
    # 1차: 정부 원본 분류 - 소분류(lclsf)를 먼저 확인
    if govt_lclsf and govt_lclsf in GOVT_CATEGORY_MAPPING:
        if govt_lclsf not in SKIP_GOVT_CATEGORIES and "," not in govt_lclsf:
            return GOVT_CATEGORY_MAPPING[govt_lclsf]
    
    # 대분류(mclsf)는 보조적으로 사용
    if govt_mclsf and govt_mclsf in GOVT_CATEGORY_MAPPING:
        if govt_mclsf not in SKIP_GOVT_CATEGORIES and "," not in govt_mclsf:
            return GOVT_CATEGORY_MAPPING[govt_mclsf]
    
    # 2차: 키워드 기반 분류 (메인)
    return classify_category_by_keywords(texts)

def classify_category_by_keywords(texts: list[str]) -> str:
    blob = " ".join([t for t in texts if t]).lower()
    score = {k:0 for k in CATEGORY_RULES.keys()}
    for cat, kws in CATEGORY_RULES.items():
        for kw in kws:
            if kw.lower() in blob:
                score[cat] += 1
    # 최고 득점 카테고리, 동점이면 사전순 먼저
    cat = max(score.items(), key=lambda x: (x[1], x[0]))[0]
    return cat if score[cat] > 0 else "기타"

# -------------------------
# 핵심 필드 추출(F-03) + 텍스트 정제 및 구조화
# -------------------------
def summarize_target(item: dict) -> str:
    min_age = (item.get("sprtTrgtMinAge") or "").strip()
    max_age = (item.get("sprtTrgtMaxAge") or "").strip()
    etc = clean_text(item.get("addAplyQlfcCndCn"))
    parts = []
    if min_age or max_age:
        parts.append(f"연령 {min_age}~{max_age}".strip("~"))
    if etc:
        parts.append(etc[:160])
    return ", ".join([p for p in parts if p])

def resolve_provider(item: dict) -> str:
    for k in ("sprvsnInstCdNm", "rgtrInstCdNm", "operInstCdNm"):
        v = (item.get(k) or "").strip()
        if v: return v
    return ""

def parse_zip_list(s: str) -> list[str]:
    s = (s or "").strip()
    if not s: return []
    return [z.strip() for z in s.split(",") if z.strip()]

def extract_clean_fields(item: dict) -> Dict[str, Any]:
    # 원문 주요 텍스트 정제(HTML/개행 제거 등)  ← FR-17/18/19
    title = clean_text(item.get("plcyNm"))
    lclsf = clean_text(item.get("lclsfNm"))
    mclsf = clean_text(item.get("mclsfNm"))
    expln = clean_text(item.get("plcyExplnCn"))
    sprt  = clean_text(item.get("plcySprtCn"))
    aply  = clean_text(item.get("plcyAplyMthdCn"))
    url   = (item.get("aplyUrlAddr") or "").strip()

    # 기간 정규화
    period_text = (item.get("aplyYmd") or "").strip()
    if not period_text:
        bg = (item.get("bizPrdBgngYmd") or "").strip()
        ed = (item.get("bizPrdEndYmd") or "").strip()
        period_text = f"{bg} ~ {ed}".strip(" ~")
    p_start, p_end = normalize_period_text(period_text)

    # 지역(우편번호 3자리 prefix 기반)  ← FR-22
    zips = parse_zip_list(item.get("zipCd"))
    region_value = zip_list_to_region_by_prefix(zips) 

    # 금액 범위
    a_min, a_max, notes = normalize_amount_span(f"{sprt}\n{expln}")

    # 카테고리 분류(하이브리드: 정부 원본 + 키워드)  ← FR-20
    category_auto = classify_category_hybrid(mclsf, lclsf, [title, expln, sprt])

    # 클린 구조  ← FR-21
    clean = {
        "policy_uid": f"ONTONG-{(item.get('plcyNo') or '')[:20] or 'NONE'}",
        "title": title,
        "summary": (expln[:150] + "...") if expln and len(expln) > 150 else expln,
        "category": lclsf or None,
        "subcategory": mclsf or None,
        "category_auto": category_auto,
        "region": region_value,
        "target_group": summarize_target(item),
        "amount_min": a_min,
        "amount_max": a_max,
        "apply_method": aply or None,
        "apply_url": url or None,
        "period_start": p_start,
        "period_end": p_end,
        "provider": resolve_provider(item) or None,
        "extra": {
            "raw_period_text": period_text,
            "amount_notes": notes,
            "zip_list": zips,
            "plcyKywdNm": item.get("plcyKywdNm"),
            "sbmsnDcmntCn": clean_text(item.get("sbmsnDcmntCn")),
            "refUrlAddr1": item.get("refUrlAddr1"),
            "refUrlAddr2": item.get("refUrlAddr2"),
            "zip_list": parse_zip_list(item.get("zipCd")),
            "aplyPrdSeCd": item.get("aplyPrdSeCd"),
            "bizPrdSeCd": item.get("bizPrdSeCd"),
            "inqCnt": item.get("inqCnt"),
            "frstRegDt": item.get("frstRegDt"),
            "lastMdfcnDt": item.get("lastMdfcnDt"),
            "sbizCd": item.get("sbizCd"),
            "source": "ontong",
            "plcyNo": item.get("plcyNo"),
        }
    }
    return clean

# 사용자 표시용 콘텐츠 데이터 생성 (요구 형식)  ← FR-21
# 청년 친화적 구조: 단순하고 사용하기 쉬운 flat 구조
def build_content_data(clean: Dict[str, Any]) -> Dict[str, Any]:
    # 금액을 읽기 쉽게
    benefit_text = format_benefit_simple(clean.get("amount_min"), clean.get("amount_max"))
    
    # 기간 상태
    status = get_simple_status(clean.get("period_start"), clean.get("period_end"))
    
    # 키워드
    keywords = []
    if clean["extra"].get("plcyKywdNm"):
        keywords = [k.strip() for k in clean["extra"]["plcyKywdNm"].split(",") if k.strip()]
    
    return {
        "id": clean["extra"]["plcyNo"],
        "title": clean["title"],
        "category": clean.get("category_auto") or clean.get("category") or "기타",
        "summary": clean.get("summary"),
        "keywords": keywords[:5] if keywords else [],
        
        # 혜택 (금액이든 서비스든 텍스트로)
        "benefit": benefit_text,
        "amount": clean.get("amount_max") or clean.get("amount_min"),  # 정렬/필터용
        
        # 대상
        "who": clean.get("target_group"),
        "where": clean.get("region"),
        "provider": clean.get("provider"),
        
        # 기간
        "deadline": clean.get("period_end"),
        "period_start": clean.get("period_start"),
        "status": status,
        
        # 신청
        "apply_url": clean.get("apply_url"),
        "apply_method": clean.get("apply_method"),
        "documents": clean["extra"].get("sbmsnDcmntCn"),
        
        # 참고
        "ref_url1": clean["extra"].get("refUrlAddr1"),
        "ref_url2": clean["extra"].get("refUrlAddr2"),
    }

def format_benefit_simple(amount_min: Optional[int], amount_max: Optional[int]) -> str:
    """
    혜택을 간단하게 표시
    """
    if not amount_min and not amount_max:
        return "혜택 제공"
    
    def to_korean(n: int) -> str:
        if n >= 100_000_000:  # 1억
            ok = n // 100_000_000
            man = (n % 100_000_000) // 10_000
            return f"{ok}억 {man}만원" if man else f"{ok}억원"
        elif n >= 10_000:  # 1만
            return f"{n // 10_000}만원"
        else:
            return f"{n:,}원"
    
    if amount_min == amount_max and amount_min:
        return to_korean(amount_min)
    elif amount_min and amount_max:
        return f"{to_korean(amount_min)} ~ {to_korean(amount_max)}"
    elif amount_max:
        return f"최대 {to_korean(amount_max)}"
    else:
        return f"최소 {to_korean(amount_min)}"

def get_simple_status(start_date: Optional[str], end_date: Optional[str]) -> str:
    """
    신청 기간 상태
    """
    from datetime import datetime
    
    if not end_date:
        return "상시 모집"
    
    try:
        end = datetime.strptime(end_date, "%Y-%m-%d")
        now = datetime.now()
        days_left = (end - now).days
        
        if days_left < 0:
            return "마감"
        elif days_left <= 7:
            return "🔥 마감 임박"
        else:
            return "진행 중"
    except:
        return "기간 미정"