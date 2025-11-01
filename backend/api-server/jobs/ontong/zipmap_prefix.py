import os, csv
from typing import List, Optional, Dict

# CSV 경로
CSV_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "zip_prefix_regions.csv")
)

_PREFIX_MAP: Optional[Dict[str, str]] = None

COL_PREFIX = "우편번호 앞 3자리"
COL_LABEL  = "시/군/구"

def load_prefix_map() -> Dict[str, str]:
    """
    3자리 우편번호 prefix -> '시/군/구' 라벨 매핑
    - 인코딩: utf-8-sig → utf-8 → cp949 순서로 시도
    """
    global _PREFIX_MAP
    if _PREFIX_MAP is not None:
        return _PREFIX_MAP

    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV 파일이 없습니다: {CSV_PATH}")

    encodings = ("utf-8-sig", "utf-8", "cp949")
    last_decode_err: Optional[UnicodeDecodeError] = None

    for enc in encodings:
        try:
            mp: Dict[str, str] = {}
            with open(CSV_PATH, "r", encoding=enc, newline="") as f:
                rdr = csv.DictReader(f)

                # 헤더 normalize: 공백 제거, None 방지
                heads = { (h or "").strip(): h for h in (rdr.fieldnames or []) }

                pcol = heads.get(COL_PREFIX)
                lcol = heads.get(COL_LABEL)
                if not (pcol and lcol):
                    # 어떤 헤더들이 들어왔는지 보여줌
                    actual = list(heads.keys())
                    raise ValueError(
                        f"헤더명이 예상과 다릅니다 (enc={enc}). "
                        f"기대한 헤더: {COL_PREFIX!r}, {COL_LABEL!r} / 실제: {actual!r}"
                    )

                for row in rdr:
                    pref = (row.get(pcol) or "").strip().strip('"')
                    lab  = (row.get(lcol) or "").strip().strip('"')

                    # 3자리 숫자만 허용
                    if len(pref) == 3 and pref.isdigit() and lab:
                        mp[pref] = lab

            _PREFIX_MAP = mp
            return _PREFIX_MAP

        except UnicodeDecodeError as e:
            # 인코딩 실패만 다음 후보로
            last_decode_err = e
            continue
        except Exception:
            # 헤더/경로/CSV 포맷 문제 등은 바로 올려서 원인을 숨기지 않음
            raise

    # 여기까지 왔다면 인코딩 후보 전부 실패
    raise UnicodeDecodeError(
        last_decode_err.encoding if last_decode_err else "unknown",
        last_decode_err.object if last_decode_err else b"",
        last_decode_err.start if last_decode_err else 0,
        last_decode_err.end if last_decode_err else 0,
        f"CSV 인코딩을 {encodings} 순서로 모두 시도했지만 실패했습니다."
    )

def _bucketize(labels: List[str]) -> Optional[str]:
    if not labels:
        return None

    buckets: Dict[str, set[str]] = {}
    singles: List[str] = []

    for lab in labels:
        parts = lab.split()
        if len(parts) >= 3:
            # 예: '경상남도 창원시 의창구' → key='경상남도 창원시', tail='의창구'
            key  = " ".join(parts[:2])
            tail = " ".join(parts[2:])
            buckets.setdefault(key, set()).add(tail)
        elif len(parts) == 2:
            # 예: '서울특별시 강북구' → key='서울특별시', tail='강북구'
            key, tail = parts
            buckets.setdefault(key, set()).add(tail)
        else:
            # 예: '세종특별자치시'
            singles.append(lab)

    out: List[str] = []
    for key in sorted(buckets.keys()):
        tails = buckets[key]
        out.append(f"{key} " + ", ".join(sorted(tails)) if tails else key)

    out.extend(sorted(set(singles)))
    return ", ".join(out) if out else None

def zip_list_to_region_by_prefix(zip_list: List[str]) -> Optional[str]:
    """
    5자리 우편번호 목록 -> 3자리 prefix로 매핑하여 region 문자열 생성.
    """
    if not zip_list:
        return None

    mp = load_prefix_map()
    labels: List[str] = []

    for z in zip_list:
        z = (z or "").strip()
        if len(z) >= 3 and z[:3].isdigit():
            lab = mp.get(z[:3])
            if lab:
                labels.append(lab)

    # 입력 순서 유지한 채 중복 제거
    labels = list(dict.fromkeys(labels))
    return _bucketize(labels)