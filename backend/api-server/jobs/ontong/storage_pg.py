import json
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

DDL_RAW = """
CREATE TABLE IF NOT EXISTS policy_raw(
  id SERIAL PRIMARY KEY,
  plcy_no TEXT,
  title TEXT,
  payload_json JSONB NOT NULL,
  content_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

DDL_CLEAN = """
CREATE TABLE IF NOT EXISTS policy_clean(
  id SERIAL PRIMARY KEY,
  plcy_no TEXT UNIQUE,              -- plcy_no 기준 최신 1건 유지(UPSERT)
  title TEXT,
  category TEXT,
  subcategory TEXT,
  category_auto TEXT,
  region TEXT,
  target_group TEXT,
  amount_min INTEGER,
  amount_max INTEGER,
  apply_method TEXT,
  apply_url TEXT,
  period_start TEXT,
  period_end TEXT,
  provider TEXT,
  summary TEXT,
  clean_json JSONB NOT NULL,
  blog_json JSONB,
  quality_json JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

def init_postgres(db_url: str) -> Engine:
    engine = create_engine(db_url, pool_pre_ping=True)
    with engine.begin() as conn:
        conn.execute(text(DDL_RAW))
        conn.execute(text(DDL_CLEAN))
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_policy_raw_content_hash ON policy_raw(content_hash);"))
    return engine

def upsert_raw_pg(engine: Engine, item: dict, plcy_no: str, title: str, content_hash: str):
    with engine.begin() as conn:
        conn.execute(text("""
        INSERT INTO policy_raw(plcy_no, title, payload_json, content_hash)
        VALUES (:plcy_no, :title, :payload_json, :content_hash)
        ON CONFLICT (content_hash) DO NOTHING
        """), {
            "plcy_no": plcy_no,
            "title": title,
            "payload_json": json.dumps(item, ensure_ascii=False),
            "content_hash": content_hash
        })

def upsert_clean_pg(engine: Engine, clean: dict, plcy_no: str, blog_json: dict, quality_json: dict):
    with engine.begin() as conn:
        conn.execute(text("""
        INSERT INTO policy_clean(
          plcy_no, title, category, subcategory, category_auto, region, target_group,
          amount_min, amount_max, apply_method, apply_url, period_start, period_end,
          provider, summary, clean_json, blog_json, quality_json, updated_at
        )
        VALUES (
          :plcy_no, :title, :category, :subcategory, :category_auto, :region, :target_group,
          :amount_min, :amount_max, :apply_method, :apply_url, :period_start, :period_end,
          :provider, :summary, :clean_json, :blog_json, :quality_json, NOW()
        )
        ON CONFLICT (plcy_no) DO UPDATE SET
          title=EXCLUDED.title,
          category=EXCLUDED.category,
          subcategory=EXCLUDED.subcategory,
          category_auto=EXCLUDED.category_auto,
          region=EXCLUDED.region,
          target_group=EXCLUDED.target_group,
          amount_min=EXCLUDED.amount_min,
          amount_max=EXCLUDED.amount_max,
          apply_method=EXCLUDED.apply_method,
          apply_url=EXCLUDED.apply_url,
          period_start=EXCLUDED.period_start,
          period_end=EXCLUDED.period_end,
          provider=EXCLUDED.provider,
          summary=EXCLUDED.summary,
          clean_json=EXCLUDED.clean_json,
          blog_json=EXCLUDED.blog_json,
          quality_json=EXCLUDED.quality_json,
          updated_at=NOW()
        """), {
            "plcy_no": plcy_no,
            "title": clean.get("title"),
            "category": clean.get("category"),
            "subcategory": clean.get("subcategory"),
            "category_auto": clean.get("category_auto"),
            "region": clean.get("region"),
            "target_group": clean.get("target_group"),
            "amount_min": clean.get("amount_min"),
            "amount_max": clean.get("amount_max"),
            "apply_method": clean.get("apply_method"),
            "apply_url": clean.get("apply_url"),
            "period_start": clean.get("period_start"),
            "period_end": clean.get("period_end"),
            "provider": clean.get("provider"),
            "summary": clean.get("summary"),
            "clean_json": json.dumps(clean, ensure_ascii=False),
            "blog_json": json.dumps(blog_json, ensure_ascii=False),
            "quality_json": json.dumps(quality_json, ensure_ascii=False),
        })