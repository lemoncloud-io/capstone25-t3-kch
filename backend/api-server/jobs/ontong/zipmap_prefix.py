import os, csv
from typing import List, Optional

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "zip_prefix_regions.csv")

_PREFIX_MAP: dict[str, str] | None = None

COL_PREFIX = "우편번호 앞 3자리"
COL_LABEL  = "시/군/구"

#3자리 우편번호 prefix -> '시/군/구' 라벨 로딩 (예: '060' -> '서울특별시 강남구')
def load_prefix_map() -> dict[str, str]:
    global _PREFIX_MAP
    if _PREFIX_MAP is not None:
        return _PREFIX_MAP

    mp: dict[str, str] = {}
    if not os.path.exists(CSV_PATH):
        _PREFIX_MAP = {}
        return _PREFIX_MAP

    # 인코딩: utf-8-sig 먼저, 실패하면 cp949
    for enc in ("utf-8-sig", "utf-8"):
        try:
            with open(CSV_PATH, "r", encoding=enc, newline="") as f:
                rdr = csv.DictReader(f)
                # 헤더 normalize
                heads = { (h or "").strip(): h for h in (rdr.fieldnames or []) }
                pcol = heads.get(COL_PREFIX)
                lcol = heads.get(COL_LABEL)
                if not (pcol and lcol):
                    raise ValueError("헤더명이 예상과 다름")
                for row in rdr:
                    pref = (row.get(pcol) or "").strip().strip('"')
                    lab  = (row.get(lcol) or "").strip().strip('"')
                    if len(pref) != 3 or not pref.isdigit():
                        continue
                    if not lab:
                        continue
                    mp[pref] = lab
            break
        except Exception:
            mp = {}
            continue

    _PREFIX_MAP = mp
    return _PREFIX_MAP

def _bucketize(labels: List[str]) -> Optional[str]:
    
    if not labels:
        return None
    buckets: dict[str, set[str]] = {}
    singles: list[str] = []

    for lab in labels:
        parts = lab.split()
        if len(parts) >= 3:
            # 예시: '경상남도 창원시 의창구' 
            # => key='경상남도 창원시', tail='의창구'
            key  = " ".join(parts[:2])
            tail = " ".join(parts[2:])
            buckets.setdefault(key, set()).add(tail)
        elif len(parts) == 2:
            # '서울특별시 강북구' (도시 없이 바로 구)
            # => key='서울특별시', tail='강북구'
            key  = parts[0]
            tail = parts[1]
            buckets.setdefault(key, set()).add(tail)
        else:
            # '세종특별자치시' 같은 단독 라벨
            singles.append(lab)

    out = []
    for key in sorted(buckets.keys()):
        tails = buckets[key]
        if tails:
            out.append(f"{key} " + ", ".join(sorted(tails)))
        else:
            out.append(key)

    out.extend(sorted(set(singles)))

    return ", ".join(out) if out else None

def zip_list_to_region_by_prefix(zip_list: List[str]) -> Optional[str]:
    """
    5자리 우편번호 목록 -> 3자리 prefix로 매핑하여 region 문자열 생성.
    """
    if not zip_list:
        return None
    mp = load_prefix_map()
    labels = []
    for z in zip_list:
        z = (z or "").strip()
        if len(z) < 3 or not z[:3].isdigit():
            continue
        pref = z[:3]
        lab = mp.get(pref)
        if lab:
            labels.append(lab)
    # 중복 제거
    labels = list(dict.fromkeys(labels))
    return _bucketize(labels)