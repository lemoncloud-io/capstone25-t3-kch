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
# FR-20: 카테고리 분류(키워드 기반)
# -------------------------
CATEGORY_RULES = {
    "주거 지원": ["전세", "월세", "보증금", "주거", "임대", "청년주택", "LH"],
    "대출": ["대출", "융자", "이자", "이차보전", "학자금대출"],
    "해외 취업": ["해외취업", "K-Move", "워킹홀리데이", "해외 인턴", "글로벌 인턴"],
    "건강": ["건강검진", "의료", "정신건강", "상담", "치료", "건강"],
    "문화활동": ["공연", "전시", "문화패스", "문화활동", "도서", "관람비", "문화"],
    "취업/교육": ["자격증", "면접", "취업", "채용", "교육", "훈련", "강좌"],
    "창업": ["창업", "사업화", "액셀러레이터", "보육", "시제품"],
    "생활/복지": ["바우처", "생활", "교통", "통신비", "복지", "지원금"],
}

def classify_category(texts: list[str]) -> str:
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

    # 카테고리 분류(키워드 기반)  ← FR-20
    category_auto = classify_category([title, lclsf, mclsf, expln, sprt])

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

# 블로그용 핵심 JSON(요구 형식)  ← FR-21
def build_blog_json(clean: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "no": clean["extra"]["plcyNo"],
        "name": clean["title"],
        "category": clean.get("category_auto") or clean.get("category") or "기타",
        "conditions": {
            "target": clean.get("target_group"),
            "provider": clean.get("provider"),
        },
        "amount": {
            "min": clean.get("amount_min"),
            "max": clean.get("amount_max"),
            "notes": clean["extra"]["amount_notes"],
        },
        "period": {
            "start": clean.get("period_start"),
            "end": clean.get("period_end"),
            "raw": clean["extra"]["raw_period_text"],
        },
        "apply": {
            "method": clean.get("apply_method"),
            "url": clean.get("apply_url"),
        },
        "summary": clean.get("summary"),
    }