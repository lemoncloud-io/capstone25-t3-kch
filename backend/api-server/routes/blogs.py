from .thumbnails_auto import generate_from_policy, AutoReq
import os, psycopg2, psycopg2.extras
from fastapi import APIRouter, HTTPException

# ← router 정의 추가!
router = APIRouter(tags=["blogs"])

S3_BUCKET = "youth-policy-thumbnails-kch"
S3_REGION = "ap-northeast-2"

def normalize_category(raw_category: str) -> str:
    """DB 카테고리를 썸네일 카테고리로 변환"""
    cat = (raw_category or "").strip()
    
    if any(k in cat for k in ["일자리", "취업", "취업 지원", "창업"]):
        return "일자리"
    if "주거" in cat:
        return "주거"
    if any(k in cat for k in ["복지", "건강", "건강·상담", "상담", "청년 참여"]):
        return "복지"
    if any(k in cat for k in ["교육", "해외 기회"]):
        return "교육"
    
    return "교육"

def s3_url_from_key(key: str) -> str:
    """DB에 저장된 key를 완전한 S3 URL로 변환"""
    if not key:
        return ""
    return f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{key}"

def get_conn():
    url = os.getenv("DB_URL") or os.getenv("DATABASE_URL")
    if not url:
        raise HTTPException(500, "DB_URL/DATABASE_URL not set")
    url = url.replace("postgresql+psycopg2://", "postgresql://")
    return psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor)

@router.get("/blogs")
def list_blogs(limit: int = 12):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT plcy_no, blog_title, blog_summary, category, region, thumbnail_key, updated_at
        FROM blog_posts
        WHERE generation_status = 'completed'
        ORDER BY updated_at DESC
        LIMIT %s
    """, (limit,))
    rows = cur.fetchall()

    for row in rows:
        if not row.get("thumbnail_key"):
            try:
                req = AutoReq(
                    policy_id=row["plcy_no"],
                    category=normalize_category(row.get("category")),
                    max_variants=2,
                    allow_emoji=False
                )
                result = generate_from_policy(req)
                if result.get("ok"):
                    row["thumbnail_key"] = result["result"]["key"]
                    
                    # ✅ DB에 저장!
                    cur2 = conn.cursor()
                    cur2.execute(
                        "UPDATE blog_posts SET thumbnail_key = %s WHERE plcy_no = %s",
                        (result["result"]["key"], row["plcy_no"])
                    )
                    conn.commit()
                    cur2.close()
                    print(f"✅ 썸네일 생성 & DB 저장: {row['plcy_no']}")
            except Exception as e:
                print(f"❌ 썸네일 생성 실패: {row['plcy_no']} - {e}")
        
        row["thumbnail_url"] = s3_url_from_key(row.get("thumbnail_key"))
    
    cur.close()
    conn.close()
    return {"items": rows, "count": len(rows)}

@router.get("/blogs/{plcy_no}")
def get_blog(plcy_no: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT plcy_no, blog_title, blog_summary, blog_content,
               category, region, thumbnail_key, updated_at
        FROM blog_posts
        WHERE plcy_no = %s
    """, (plcy_no,))
    row = cur.fetchone()
    
    if not row:
        cur.close()
        conn.close()
        raise HTTPException(404, "Blog post not found")
    
    if not row.get("thumbnail_key"):
        try:
            req = AutoReq(
                policy_id=row["plcy_no"],
                category=normalize_category(row.get("category")),
                max_variants=2,
                allow_emoji=False
            )
            result = generate_from_policy(req)
            if result.get("ok"):
                row["thumbnail_key"] = result["result"]["key"]
                
                # ✅ DB에 저장!
                cur2 = conn.cursor()
                cur2.execute(
                    "UPDATE blog_posts SET thumbnail_key = %s WHERE plcy_no = %s",
                    (result["result"]["key"], plcy_no)
                )
                conn.commit()
                cur2.close()
                print(f"✅ 썸네일 생성 & DB 저장: {plcy_no}")
        except Exception as e:
            print(f"❌ 썸네일 생성 실패: {plcy_no} - {e}")
    
    row["thumbnail_url"] = s3_url_from_key(row.get("thumbnail_key"))
    cur.close()
    conn.close()
    return row