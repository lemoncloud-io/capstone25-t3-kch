import re, json, hashlib
from datetime import datetime
from typing import Dict, Any

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

def is_date_str(s) -> bool:
    if not s or not isinstance(s, str): return False
    return bool(DATE_RE.match(s))

def run_quality_checks(raw: Dict[str, Any], clean: Dict[str, Any]) -> Dict[str, Any]:
    issues = []
    # FR-14: 필드 누락 확인
    must = {
        "title": clean.get("title"),
        "apply_method": clean.get("apply_method"),
        "target_group": clean.get("target_group"),
    }
    missing = [k for k,v in must.items() if not v]
    if missing:
        issues.append({"type":"missing_fields","fields":missing})

    # FR-15: 데이터 타입
    type_err = []
    if clean.get("amount_min") is not None and not isinstance(clean["amount_min"], int):
        type_err.append("amount_min")
    if clean.get("amount_max") is not None and not isinstance(clean["amount_max"], int):
        type_err.append("amount_max")
    if clean.get("period_start") and not is_date_str(clean["period_start"]):
        type_err.append("period_start")
    if clean.get("period_end") and not is_date_str(clean["period_end"]):
        type_err.append("period_end")
    if type_err:
        issues.append({"type":"type_error","fields":type_err})

    # FR-16: 중복 여부(원문 전체 해시) 확인
    content_hash = hashlib.sha256(
        json.dumps(raw, ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()

    # 결과 요약
    return {
        "checked_at": datetime.utcnow().isoformat(),
        "content_hash": content_hash,
        "has_issue": len(issues) > 0,
        "issues": issues,
        # 간단한 점수(이슈 없으면 100, 있으면 70)
        "score": 100 if not issues else 70
    }