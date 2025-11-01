import os, time, requests, json, hashlib
from dotenv import load_dotenv
from .utils import log
from .preprocess import extract_clean_fields, build_content_data
from .quality import run_quality_checks
from .storage_pg import init_postgres, upsert_raw_pg, upsert_clean_pg

# 1) .env 
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"), override=False)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"), override=False)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"), override=False)
load_dotenv(override=False)

# 2) 환경 변수
API_URL   = "https://www.youthcenter.go.kr/go/ythip/getPlcy"
API_KEY   = os.getenv("YOUTHCENTER_API_KEY")
PAGE_SIZE = int(os.getenv("PAGE_SIZE", "10"))
MAX_PAGES = int(os.getenv("MAX_PAGES", "1"))
STORE_MODE= os.getenv("STORE_MODE", "PG").upper()
DB_URL    = os.getenv("DB_URL")

if not API_KEY:
    raise RuntimeError("YOUTHCENTER_API_KEY가 .env에 없습니다.")
if "PG" in STORE_MODE and not DB_URL:
    raise RuntimeError("STORE_MODE에 PG가 포함되면 DB_URL이 필요합니다.")

# 3) DB 엔진
engine = None
if "PG" in STORE_MODE:
    engine = init_postgres(DB_URL)
    log("PostgreSQL connected & ensured tables.")

# 4) 유틸
def sha256(obj) -> str:
    return hashlib.sha256(json.dumps(obj, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()

def fetch_page(page: int) -> dict:
    params = {
        "apiKeyNm": API_KEY,
        "rtnType": "json",
        "pageNum": page,
        "pageSize": PAGE_SIZE
    }
    r = requests.get(API_URL, params=params, timeout=20)
    r.raise_for_status()
    return r.json()

# 5) 메인
def main():
    processed = 0
    for page in range(1, MAX_PAGES + 1):
        data = fetch_page(page)
        items = (data.get("result") or {}).get("youthPolicyList") or []
        log(f"page {page}: {len(items)} items")
        if not items:
            break

        for it in items:
            plcy_no = (it.get("plcyNo") or "").strip() or "NONE"
            title   = (it.get("plcyNm") or "").strip()
            h       = sha256(it)

            # RAW 저장
            if engine is not None:
                upsert_raw_pg(engine, it, plcy_no, title, h)

            # 정제/분류/핵심 JSON
            clean = extract_clean_fields(it)
            content_data = build_content_data(clean)

            # 품질 점검
            quality_json = run_quality_checks(it, clean)
            if quality_json["has_issue"]:
                log(f"[QUALITY] {plcy_no} issues={quality_json['issues']}")

            # CLEAN 저장
            if engine is not None:
                upsert_clean_pg(engine, clean, plcy_no, content_data, quality_json)

            processed += 1
            log(f"saved {plcy_no} | {clean['title']} | amt=({clean.get('amount_min')}, {clean.get('amount_max')}) | cat={clean.get('category_auto')}")

        time.sleep(0.2)

    log(f"done. processed={processed}")

if __name__ == "__main__":
    main()