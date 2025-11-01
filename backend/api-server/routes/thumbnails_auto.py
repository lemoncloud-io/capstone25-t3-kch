# routes/thumbnails_auto.py
from __future__ import annotations
import os, re, json
from pathlib import Path
from typing import Optional, List, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# ==== 기능 스위치 ============================================================
USE_DB: bool = os.getenv("FEATURE_USE_DB", "false").lower() == "true"

# DB 세션 / ORM 모델
try:
    from jobs.ontong.storage_pg import get_session  # Session factory
except Exception:
    get_session = None  # type: ignore

# ORM 모델 (PolicyClean)
try:
    from jobs.ontong.preprocess import PolicyClean  # declarative_base 모델
except Exception:
    PolicyClean = None  # type: ignore

# ==== OpenAI ================================================================
try:
    from openai import OpenAI
except Exception:
    OpenAI = None  # type: ignore

# 기존 썸네일 렌더러 재사용
from .thumbnails import generate as generate_thumbnail, Req as ThumbReq

router = APIRouter(prefix="/thumbnails", tags=["thumbnails"])

OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
FIXTURE: Path = Path(__file__).resolve().parents[1] / "fixtures" / "policies.json"


# ==== 요청 모델 ==============================================================
class AutoReq(BaseModel):
    policy_id: str
    category: str                # "주거/일자리/복지/교육"
    max_variants: int = 4
    allow_emoji: bool = False
    force_two_lines: bool = True


class DirectReq(BaseModel):
    policy_id: str
    category: str
    title: str
    region: Optional[str] = None
    benefit: Optional[str] = None
    benefit_amount: Optional[str] = None
    target: Optional[str] = None
    deadline: Optional[str] = None
    summary: Optional[str] = None
    max_variants: int = 4
    allow_emoji: bool = False
    force_two_lines: bool = True


# ==== 유틸: 텍스트 처리/스코어링 ============================================
def _hard_limit(s: str, max_len: int) -> str:
    s = re.sub(r"\s+", " ", s or "").strip()
    return s if len(s) <= max_len else (s[: max_len - 1] + "…")


def _split_two_lines(s: str) -> str:
    s = re.sub(r"\s+", " ", s or "").strip()
    if "\n" in s:
        return s
    if len(s) <= 16:
        return s
    mid = len(s) // 2
    left = s.rfind(" ", 0, mid)
    right = s.find(" ", mid + 1)
    idx = left if left != -1 else (right if right != -1 else mid)
    return (s[:idx].strip() + "\n" + s[idx:].strip())


def _score(caption: str) -> int:
    score = 0
    plain = (caption or "").replace("\n", "")
    L = len(plain)
    if 8 <= L <= 20:
        score += 3
    if re.search(r"[0-9]", caption or ""):
        score += 2
    if any(k in (caption or "") for k in ["지원", "신청", "마감", "최대", "월세", "장학", "채용"]):
        score += 2
    if "\n" in (caption or ""):
        score += 1
    return score


# ==== OpenAI 클라이언트 =====================================================
def _get_openai_client() -> OpenAI:
    if OpenAI is None:
        raise HTTPException(status_code=500, detail="openai 패키지가 설치되어 있지 않습니다 (pip install openai).")
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY가 설정되어 있지 않습니다.")
    return OpenAI(api_key=api_key)


# ==== LLM 프롬프트 ==========================================================
def _prompt_for_thumbnail(policy: Dict, allow_emoji: bool, max_variants: int) -> List[str]:
    system = (
        "너는 정부·지자체 청년정책을 홍보하는 전문 카피라이터야. "
        "문구는 짧고 강렬해야 하고, 친구에게 말하듯 친근해야 해. "
        "시선을 끄는 어투는 좋지만, 거짓이나 과장은 절대 안 돼. "
        "이모지나 특수기호는 쓰지 말고, 느낌표나 물음표만 자연스럽게 사용해."
    )
    rules = [
        "항상 최대 2줄. 첫 줄은 '후킹(이득/공감/질문형)', 둘째 줄은 '구체 혜택+행동 유도'.",
        "각 줄 6~9자 권장. 전체 18자 이내.",
        "핵심 수치/횟수/금액은 반드시 포함 (예: 20만원, 8회, 3개월 등).",
        "대상/지역이 있다면 포함 (예: 청년, 대학생, 서울 등).",
        "행동 유도 동사 포함: 신청, 받기, 확인, 마감 전 등.",
        "이모티콘, 이모지, 해시태그 금지.",
        "느낌표(!)와 물음표(?)는 자연스럽게 사용 가능.",
        "허위·과장 표현(대박, 무조건, 최고, 100% 등) 금지.",
    ]
    if not allow_emoji:
        rules.append("이모지 사용 금지.")
    else:
        rules.append("이모지는 최대 1개만, 남발 금지.")

    user = {
        "policy": {
            "title": policy.get("title"),
            "region": policy.get("region"),
            "benefit": policy.get("benefit"),
            "amount": policy.get("benefit_amount"),
            "who": policy.get("target"),
            "deadline": policy.get("deadline"),
            "summary": policy.get("summary"),
            "category": policy.get("category"),
        },
        "make": max_variants,
    }

    content = (
        "아래 '정책' 내용을 바탕으로 썸네일 문구 후보를 2~5개 만들어줘. "
        "반드시 JSON 형식으로만 답해야 해.\n\n"
        "[출력형식]\n"
        '{ \"candidates\": [\"문구A\", \"문구B\", \"문구C\"] }\n\n'
        "좋은 예시:\n"
        '- \"월세 부담 끝!\n서울 청년 20만원 지원\"\n'
        '- \"취준생 주목!\n최대 300만원 지원금\"\n'
        '- \"혼자 고민 말고!\n심리상담 8회 무료\"\n'
        "나쁜 예시(금지): '대박 지원금!', '무조건 신청', '월세 지원', '#서울청년'\n\n"
        f"[정책]\n{json.dumps(user, ensure_ascii=False)}"
    )

    client = _get_openai_client()
    rsp = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": content}],
        temperature=0.7,
        response_format={"type": "json_object"},
    )
    txt = (rsp.choices[0].message.content or "").strip()

    try:
        data = json.loads(txt)
        cands = data.get("candidates") or []
        clean: List[str] = []
        for s in cands:
            s = str(s).strip().replace("  ", " ")
            s = re.sub(r'[\"\'`]+', "", s)
            if s:
                clean.append(s)
        return clean or _fallback_candidates(policy)
    except Exception:
        return _fallback_candidates(policy)


def _fallback_candidates(policy: Dict) -> List[str]:
    t = (policy.get("title") or "").strip()
    b = (policy.get("benefit") or "") or (policy.get("benefit_amount") or "")
    r = (policy.get("region") or "")
    base = f"{r} {b}".strip() if (r or b) else (t or "청년 혜택 한눈에")
    a = _hard_limit(base, 18)
    b2 = _hard_limit(f"{base} 신청 요약", 18)
    return [a, b2]


# ==== 데이터 로더(픽스처) ====================================================
def _load_fixture_or_min(policy_id: str, fallback_category: str) -> Dict:
    try:
        if FIXTURE.exists():
            arr = json.loads(FIXTURE.read_text(encoding="utf-8"))
            item = next((x for x in arr if x.get("policy_id") == policy_id), None)
            if item:
                return {
                    "title": item.get("title", ""),
                    "region": item.get("region"),
                    "benefit": item.get("benefit"),
                    "benefit_amount": item.get("benefit_amount"),
                    "target": item.get("target"),
                    "deadline": item.get("deadline"),
                    "summary": item.get("summary"),
                    "category": item.get("category") or fallback_category,
                }
    except Exception as e:
        print(f"[WARN] fixture load failed: {e!r}")

    return {
        "title": f"{policy_id} 정책",
        "region": None,
        "benefit": None,
        "benefit_amount": None,
        "target": None,
        "deadline": None,
        "summary": None,
        "category": fallback_category,
    }


# ==== 라우트 ================================================================
@router.post("/auto")
def generate_from_policy(req: AutoReq):
    """
    정책 ID 기반 자동 생성
    - USE_DB=true: DB(policy_clean)에서 로드 → LLM 후보 → 최적 캡션 → 이미지 생성
    - USE_DB=false: fixtures 또는 최소 정보로 진행
    """
    # 1) 정책 로드
    if USE_DB:
        if not (get_session and PolicyClean):
            raise HTTPException(status_code=500, detail="DB 모듈이 준비되지 않았습니다.")
        with get_session() as ses:  # SQLAlchemy Session
            pol: PolicyClean | None = ses.query(PolicyClean).filter_by(plcy_no=req.policy_id).first()  # type: ignore
            if not pol:
                raise HTTPException(status_code=404, detail=f"policy not found: {req.policy_id}")

            policy_dict = {
                "title": pol.title,
                "region": pol.region,
                "benefit": None,                    # 텍스트형 혜택 컬럼 없음 → 필요시 조합
                "benefit_amount": pol.amount_max,   # 숫자(최대 금액) 사용
                "target": pol.target_group,
                "deadline": pol.period_end,
                "summary": pol.summary,
                "category": (pol.category_auto or pol.category or req.category),
            }
    else:
        policy_dict = _load_fixture_or_min(req.policy_id, fallback_category=req.category)

    # 2) LLM 후보 생성
    cands = _prompt_for_thumbnail(policy_dict, req.allow_emoji, max_variants=req.max_variants)

    # 3) 후처리 + 스코어링
    cooked: List[str] = []
    for s in cands:
        s = re.sub(r"\s+", " ", s).strip()
        s = _hard_limit(s, 22)  # 전체 길이 상한 (렌더 안전)
        s = _split_two_lines(s) if req.force_two_lines else s
        cooked.append(s)
    best = max(cooked, key=_score) if cooked else "한눈에 보는\n핵심 꿀팁"

    # 4) 이미지 생성
    thumb_req = ThumbReq(policy_id=req.policy_id, category=req.category, caption=best)
    result = generate_thumbnail(thumb_req)

    return {"ok": True, "caption": best, "candidates": cooked, "result": result}


@router.post("/auto/direct")
def generate_from_direct(req: DirectReq):
    policy_dict = {
        "title": req.title,
        "region": req.region,
        "benefit": req.benefit,
        "benefit_amount": req.benefit_amount,
        "target": req.target,
        "deadline": req.deadline,
        "summary": req.summary,
        "category": req.category,
    }

    cands = _prompt_for_thumbnail(policy_dict, req.allow_emoji, req.max_variants)

    cooked: List[str] = []
    for s in cands:
        s = re.sub(r"\s+", " ", s).strip()
        s = _hard_limit(s, 22)
        s = _split_two_lines(s) if req.force_two_lines else s
        cooked.append(s)

    best = max(cooked, key=_score) if cooked else _hard_limit(req.title, 18)

    thumb_req = ThumbReq(policy_id=req.policy_id, category=req.category, caption=best)
    result = generate_thumbnail(thumb_req)

    return {"ok": True, "caption": best, "candidates": cooked, "result": result}