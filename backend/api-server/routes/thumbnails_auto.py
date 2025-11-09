from __future__ import annotations
import os
import re
import json
import hashlib
from pathlib import Path
from typing import Optional, List, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from cachetools import TTLCache

# ==== DB (선택) ==============================================================
# 프로젝트 경로/이름에 맞게 import 되어 있어야 합니다.
# FEATURE_USE_DB=false 인 경우, 아래 import 실패해도 동작하도록 try/except 처리
DB_READY = False
try:
    from sqlalchemy.orm import Session
    from sqlalchemy import text
    from db import get_session, PolicyClean  # 실제 경로/이름에 맞게 조정
    DB_READY = True
except Exception:  # pragma: no cover
    Session = None  # type: ignore
    get_session = None  # type: ignore
    PolicyClean = None  # type: ignore

# ==== OpenAI ================================================================
# openai 패키지 (>=1.x) 사용 권장
try:
    from openai import OpenAI
except Exception as e:  # pragma: no cover
    OpenAI = None  # type: ignore

# 기존 썸네일 생성 함수 재사용
from .thumbnails import generate as generate_thumbnail, Req as ThumbReq

# 로거 설정
from logging_config import get_logger
logger = get_logger(__name__)

router = APIRouter(prefix="/thumbnails", tags=["thumbnails"])

# ==== 환경 스위치/경로 =======================================================
USE_DB: bool = (
    os.getenv("FEATURE_USE_DB", "false").lower() == "true"
    and DB_READY
)
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
FIXTURE: Path = Path(__file__).resolve().parents[1] / "fixtures" / "policies.json"

# ==== 캐시 설정 ============================================================
# LLM 응답 캐시 (최대 100개, 1시간 유지)
llm_cache = TTLCache(maxsize=100, ttl=3600)
# Fixture 파일 캐시 (최대 1개, 5분 유지)
fixture_cache = TTLCache(maxsize=1, ttl=300)

logger.info("썸네일 자동 생성 모듈 로드 완료")
logger.info(f"USE_DB: {USE_DB}, OPENAI_MODEL: {OPENAI_MODEL}")

# ==== 요청 모델 ==============================================================
class AutoReq(BaseModel):
    policy_id: str
    category: Optional[str] = None    # "주거/일자리/복지/교육"
    max_variants: int = 4        # 후보 개수(2~5 권장)
    allow_emoji: bool = False    # 이모지 허용 여부
    force_two_lines: bool = True # 2줄 강제 여부

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
    """
    정책 딕셔너리 -> 썸네일 문구 후보 리스트
    OpenAI Chat Completions(JSON) 사용 + 캐싱
    """
    # 캐시 키 생성
    cache_key = hashlib.md5(
        json.dumps({
            "policy": policy,
            "emoji": allow_emoji,
            "variants": max_variants
        }, sort_keys=True, ensure_ascii=False).encode()
    ).hexdigest()
    
    # 캐시 확인
    if cache_key in llm_cache:
        logger.info("캐시 히트!", extra={
            "cache_key": cache_key[:8],
            "policy_id": policy.get("policy_id"),
            "title": policy.get("title", "")[:30]
        })
        return llm_cache[cache_key]
    
    logger.info("캐시 미스. LLM 호출 시작", extra={
        "policy_id": policy.get("policy_id"),
        "title": policy.get("title", "")[:30],
        "category": policy.get("category")
    })
    
    system = (
        "너는 정부·지자체 청년정책을 홍보하는 전문 카피라이터야. "
        "너의 목표는 **최대한 많은 청년의 시선을 사로잡아 정책 내용을 클릭하게 만드는 것**이야. "
        "문구는 **짧고 강렬하게, 그리고 친구에게 말하듯 친근하게** 작성해야 해. "
        "특히, **가장 중요한 혜택이나 공감 요소를 첫 줄에 배치**하여 즉각적인 흥미를 유발해야 해. "
        "시선을 끄는 어투는 좋지만, **절대 거짓이나 과장은 사용하지 마**. "
        "**이모지나 특수기호는 일절 사용하지 말고**, 느낌표나 물음표만 자연스럽게 사용해."
        "**가장 중요한 규칙은 단어가 잘려서는 안 된다는 점이야. 말줄임표(...)도 절대 사용하지 마.**"
    )
    
    rules = [
        "**필수 규칙: 항상 최대 2줄.**",
        "**첫 줄:** '후킹(가장 큰 이득/강한 공감/핵심 질문)'. 청년들이 '내 이야기'라고 느끼게 해.",
        "**둘째 줄:** '구체 혜택 + 명확한 행동 유도'. 핵심 지원 내용과 다음 액션을 제시.",
        "**길이 엄수:** 각 줄은 6~10자를 권장하며, 전체 20자 이내로 짧고 간결하게 작성해.",
        "**절대 금지: 단어가 잘리는 경우 또는 불완전한 단어 및 문장 (예: '도...', '무료 심리상…').**",
        "**절대 금지: 말 줄임표(...) 사용.**",
        "**핵심 정보 포함:** 금액, 횟수, 기간 등 **핵심 수치**는 반드시 포함해야 해 (예: 20만원, 8회, 3개월 등).",
        "**대상/지역 포함 (가능하다면):** 청년, 대학생, 서울 등 대상이나 지역을 명확히 해.",
        "**강력한 행동 유도 동사:** 신청, 받기, 확인, 놓치지 마, 마감 전 등.",
        "**절대 금지:** 이모티콘, 이모지, 해시태그.",
        "**절대 금지:** 허위·과장 표현 (대박, 무조건, 최고, 100% 등) 및 추상적인 미사여구.",
    ]

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
        "**좋은 예시 (이런 느낌으로 만들어줘!):**\n"
        '- "월세 부담 끝!\n서울 청년 20만원 지원"\n'
        '- "취준생 주목!\n최대 300만원 지원금"\n'
        '- "혼자 고민 말고!\n심리상담 8회 무료"\n'
        '- "복잡한 서류 없이?\n나에게 맞는 정책 확인!"\n'
        '- "힘내라 청년! 월세\n20만원 든든 지원"\n'
        "**나쁜 예시 (절대 금지):** '대박 지원금!', '무조건 신청', '월세 지원', '#서울청년', '🤗지원받으세요', '서울 청년 20만...', '당신에게 필요한 도…', '무료 심리상…' (말줄임표, 단어 끊김 절대 금지)\n\n"
        f"[정책]\n{json.dumps(user, ensure_ascii=False)}"
    )

    try:
        client = _get_openai_client()
        rsp = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": content},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        txt = (rsp.choices[0].message.content or "").strip()
        
        logger.info("LLM 응답 수신 완료", extra={
            "policy_id": policy.get("policy_id"),
            "response_length": len(txt),
            "model": OPENAI_MODEL
        })

        data = json.loads(txt)
        cands = data.get("candidates") or []
        clean: List[str] = []
        for s in cands:
            s = str(s).strip().replace("  ", " ")
            s = re.sub(r'[\"\'`]+', "", s)
            if s:
                clean.append(s)
        
        result = clean or _fallback_candidates(policy)
        
        # 캐시 저장
        llm_cache[cache_key] = result
        logger.info("LLM 결과 캐시 저장", extra={
            "cache_key": cache_key[:8],
            "candidates_count": len(result)
        })
        
        return result
        
    except json.JSONDecodeError as e:
        logger.error("LLM 응답 JSON 파싱 실패", extra={
            "policy_id": policy.get("policy_id"),
            "error": str(e),
            "response_preview": txt[:200] if txt else "None"
        })
        return _fallback_candidates(policy)
    
    except Exception as e:
        logger.exception("LLM 호출 중 예외 발생", extra={
            "policy_id": policy.get("policy_id")
        })
        return _fallback_candidates(policy)

def _fallback_candidates(policy: Dict) -> List[str]:
    logger.warning("폴백 후보 생성", extra={"policy_id": policy.get("policy_id")})
    t = (policy.get("title") or "").strip()
    b = (policy.get("benefit") or "") or (policy.get("benefit_amount") or "")
    r = (policy.get("region") or "")
    base = f"{r} {b}".strip() if (r or b) else (t or "청년 혜택 한눈에")
    a = _hard_limit(base, 18)
    b2 = _hard_limit(f"{base} 신청 요약", 18)
    return [a, b2]

# ==== 픽스처 로더 ===========================================================
def _load_fixture_or_min(policy_id: str, fallback_category: str) -> Dict:
    """DB 미사용 시 fixtures/policies.json에서 읽거나, 최소 정보로 구성"""
    
    # 캐싱된 fixture 데이터 사용
    if "fixture_data" not in fixture_cache:
        try:
            if FIXTURE.exists():
                arr = json.loads(FIXTURE.read_text(encoding="utf-8"))
                fixture_cache["fixture_data"] = arr
                logger.info("Fixture 파일 로드 성공", extra={
                    "path": str(FIXTURE),
                    "policies_count": len(arr)
                })
            else:
                logger.warning("Fixture 파일 없음", extra={"path": str(FIXTURE)})
                fixture_cache["fixture_data"] = []
        except Exception as e:
            logger.error("Fixture 파일 로드 실패", extra={
                "path": str(FIXTURE),
                "error": str(e)
            }, exc_info=True)
            fixture_cache["fixture_data"] = []
    
    arr = fixture_cache.get("fixture_data", [])
    item = next((x for x in arr if x.get("policy_id") == policy_id), None)
    
    if item:
        logger.info("Fixture에서 정책 발견", extra={"policy_id": policy_id})
        return {
            "policy_id": policy_id,
            "title": item.get("title", ""),
            "region": item.get("region"),
            "benefit": item.get("benefit"),
            "benefit_amount": item.get("benefit_amount"),
            "target": item.get("target"),
            "deadline": item.get("deadline"),
            "summary": item.get("summary"),
            "category": item.get("category") or fallback_category,
        }
    
    # 최소 정보로 구성
    logger.warning("정책 못 찾음, 최소 정보로 구성", extra={
        "policy_id": policy_id,
        "fallback_category": fallback_category
    })
    return {
        "policy_id": policy_id,
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
    - USE_DB=true: DB에서 정책 로드
    - USE_DB=false: fixtures 또는 최소 값으로 LLM 실행
    """
    req.category = (req.category or None)
    logger.info("📸 썸네일 자동 생성 요청", extra={
        "policy_id": req.policy_id,
        "category": req.category,
        "max_variants": req.max_variants,
        "allow_emoji": req.allow_emoji
    })
    
    # 1) 정책 로드
    if USE_DB:
        if not (get_session and PolicyClean and Session):
            logger.error("DB 모듈이 준비되지 않았습니다")
            raise HTTPException(status_code=500, detail="DB 모듈이 준비되지 않았습니다.")
        with get_session() as ses:  # type: ignore
            pol: PolicyClean | None = ses.query(PolicyClean).filter_by(plcy_no=req.policy_id).first()  # type: ignore
            if not pol:
                logger.error("DB에서 정책 못 찾음", extra={"policy_id": req.policy_id})
                raise HTTPException(status_code=404, detail=f"policy not found: {req.policy_id}")
            confirmed_cat = None
            try:
                row = ses.execute(
                    text("SELECT category FROM blog_posts WHERE plcy_no = :p"),
                    {"p": req.policy_id}
                ).first()
                if row and row[0]:
                    confirmed_cat = row[0]
            except Exception:
                confirmed_cat = None  # 실패해도 무시

            policy_dict = {
                "policy_id": req.policy_id,
                "title": pol.title,
                "region": pol.region,
                "benefit": pol.benefit,
                "benefit_amount": getattr(pol, "benefit_amount", None),
                "target": pol.target,
                "deadline": pol.deadline,
                "summary": pol.summary,
                "category": confirmed_cat or (pol.category or req.category) or "기타",
            } 
    else:
        policy_dict = _load_fixture_or_min(req.policy_id, fallback_category=req.category)

    # 2) LLM 후보 생성
    cands = _prompt_for_thumbnail(policy_dict, req.allow_emoji, max_variants=req.max_variants)

    # 3) 후처리 + 스코어링
    cooked: List[str] = []
    for s in cands:
        s = re.sub(r"\s+", " ", s).strip()
        s = _hard_limit(s, 22)  # 전체 길이 상한
        s = _split_two_lines(s) if req.force_two_lines else s
        cooked.append(s)
    best = max(cooked, key=_score) if cooked else "한눈에 보는\n핵심 꿀팁"

    logger.info("최종 문구 선정", extra={
        "policy_id": req.policy_id,
        "caption": best,
        "score": _score(best)
    })

    # 4) 이미지 생성
    final_category = (policy_dict.get("category") or req.category or "기타").strip()
    logger.info("카테고리 확정", extra={
        "policy_id": req.policy_id,
        "final_category": final_category,
        "source": ("db" if final_category == confirmed_cat else
                "policy_clean" if getattr(pol, "category", None) == final_category else
                "request_or_default")
    })
    thumb_req = ThumbReq(policy_id=req.policy_id, category=final_category, caption=best)
    result = generate_thumbnail(thumb_req)

    logger.info("썸네일 생성 완료", extra={
        "policy_id": req.policy_id,
        "storage": result.get("storage"),
        "url": result.get("url", result.get("path", ""))[:100]
    })

    return {
        "ok": True,
        "caption": best,
        "candidates": cooked,
        "result": result,
    }

@router.post("/auto/direct")
def generate_from_direct(req: DirectReq):
    """
    정책 내용을 직접 바디로 넣어서 LLM→썸네일까지 즉시 생성 (DB/픽스처 불필요)
    """
    logger.info("썸네일 직접 생성 요청", extra={
        "policy_id": req.policy_id,
        "title": req.title[:30]
    })
    
    policy_dict = {
        "policy_id": req.policy_id,
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

    logger.info("썸네일 직접 생성 완료", extra={
        "policy_id": req.policy_id,
        "caption": best
    })

    return {
        "ok": True,
        "caption": best,
        "candidates": cooked,
        "result": result,
    }