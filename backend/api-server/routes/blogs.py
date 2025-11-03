# routes/blogs.py
import os, psycopg2, psycopg2.extras
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["blogs"])

def get_conn():
    url = os.getenv("DB_URL") or os.getenv("DATABASE_URL")
    if not url:
        raise HTTPException(500, "DB_URL/DATABASE_URL not set")

    # psycopg2는 'postgresql://...' 형식만 이해
    url = url.replace("postgresql+psycopg2://", "postgresql://")

    return psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor)

@router.get("/blogs")
def list_blogs(limit: int = 12):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("""
        SELECT plcy_no, blog_title, blog_summary, category, region, thumbnail_url, updated_at
        FROM blog_posts
        WHERE generation_status = 'completed'
        ORDER BY updated_at DESC
        LIMIT %s
    """, (limit,))
    rows = cur.fetchall()
    cur.close(); conn.close()
    return {"items": rows, "count": len(rows)}

@router.get("/blogs/{plcy_no}")
def get_blog(plcy_no: str):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("""
        SELECT plcy_no, blog_title, blog_summary, blog_content,
               category, region, thumbnail_url, updated_at
        FROM blog_posts
        WHERE plcy_no = %s
    """, (plcy_no,))
    row = cur.fetchone()
    cur.close(); conn.close()
    if not row:
        raise HTTPException(404, "Blog post not found")
    return row