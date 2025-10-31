from typing import Optional, List, Generic, TypeVar
import re
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from database import engine
from schemas import PostCreate, PostUpdate, PostOut, CategoryOut

# Note: Database table must be initialized first with: python init_db.py
router = APIRouter(tags=["posts"])

# SQL field list for consistent SELECT queries
POST_FIELDS = """id, slug, title, summary, content, category, thumbnail, author,
                 view_count, is_published, created_at, updated_at, published_at, plcy_no"""

# Paginated response schema
T = TypeVar('T')
class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    limit: int
    offset: int


def generate_slug(title: str, post_id: int) -> str:
    """Generate URL-friendly slug from title"""
    # Remove special characters and normalize Korean text
    slug_base = re.sub(r'[^\w\s-]', '', title.lower())
    slug_base = re.sub(r'[-\s]+', '-', slug_base).strip('-')
    # Limit length and add ID for uniqueness
    slug_base = slug_base[:50]
    return f"{slug_base}-{post_id}" if slug_base else f"post-{post_id}"


@router.post("/posts", response_model=PostOut)
def create_post(post: PostCreate):
    """Create new blog post (draft by default)"""
    with engine.begin() as conn:
        # Insert post and get generated ID
        result = conn.execute(text("""
            INSERT INTO blog_posts(title, summary, content, category, thumbnail, plcy_no, is_published, slug)
            VALUES (:title, :summary, :content, :category, :thumbnail, :plcy_no, false, 'temp')
            RETURNING id
        """), {
            "title": post.title,
            "summary": post.summary,
            "content": post.content,
            "category": post.category,
            "thumbnail": post.thumbnail,
            "plcy_no": post.plcy_no,
        }).mappings().first()

        post_id = result["id"]

        # Generate and update slug using the ID
        slug = generate_slug(post.title, post_id)
        conn.execute(text("""
            UPDATE blog_posts SET slug = :slug WHERE id = :id
        """), {"slug": slug, "id": post_id})

        # Fetch complete post
        row = conn.execute(text(f"""
            SELECT {POST_FIELDS}
            FROM blog_posts WHERE id = :id
        """), {"id": post_id}).mappings().first()

    return PostOut(**dict(row))


@router.get("/posts", response_model=PaginatedResponse[PostOut])
def list_posts(
    q: Optional[str] = Query(None, description="제목/요약 검색어"),
    category: Optional[str] = Query(None, description="카테고리 필터"),
    is_published: Optional[bool] = Query(None, description="발행 상태 필터"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """List blog posts with filters and pagination"""
    conds = []
    params = {}

    if q:
        conds.append("(title ILIKE :q OR summary ILIKE :q)")
        params["q"] = f"%{q}%"

    if category:
        conds.append("category = :category")
        params["category"] = category

    if is_published is not None:
        conds.append("is_published = :is_published")
        params["is_published"] = is_published

    where = "WHERE " + " AND ".join(conds) if conds else ""

    # Count query
    count_sql = text(f"""
        SELECT COUNT(*) as total
        FROM blog_posts
        {where}
    """)

    # Data query
    data_sql = text(f"""
        SELECT {POST_FIELDS}
        FROM blog_posts
        {where}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    params["limit"] = limit
    params["offset"] = offset

    with engine.begin() as conn:
        # Get total count
        count_result = conn.execute(count_sql, {k: v for k, v in params.items() if k not in ['limit', 'offset']}).mappings().first()
        total = count_result["total"] if count_result else 0

        # Get data
        rows = conn.execute(data_sql, params).mappings().all()
        items = [PostOut(**dict(r)) for r in rows]

    return PaginatedResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/posts/{slug}", response_model=PostOut)
def get_post(slug: str):
    """Get single post by slug"""
    sql = text(f"""
        SELECT {POST_FIELDS}
        FROM blog_posts
        WHERE slug = :slug
        LIMIT 1
    """)

    with engine.begin() as conn:
        row = conn.execute(sql, {"slug": slug}).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Post not found")

    return PostOut(**dict(row))


@router.put("/posts/{slug}", response_model=PostOut)
def update_post(slug: str, post: PostUpdate):
    """Update existing post"""
    with engine.begin() as conn:
        # Build dynamic UPDATE query
        updates = []
        params = {"slug": slug}

        if post.title is not None:
            updates.append("title = :title")
            params["title"] = post.title

        if post.summary is not None:
            updates.append("summary = :summary")
            params["summary"] = post.summary

        if post.content is not None:
            updates.append("content = :content")
            params["content"] = post.content

        if post.category is not None:
            updates.append("category = :category")
            params["category"] = post.category

        if post.thumbnail is not None:
            updates.append("thumbnail = :thumbnail")
            params["thumbnail"] = post.thumbnail

        if post.plcy_no is not None:
            updates.append("plcy_no = :plcy_no")
            # Empty string means set to NULL
            params["plcy_no"] = post.plcy_no if post.plcy_no != "" else None

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        updates.append("updated_at = NOW()")
        update_clause = ", ".join(updates)

        sql = text(f"""
            UPDATE blog_posts
            SET {update_clause}
            WHERE slug = :slug
            RETURNING {POST_FIELDS}
        """)

        row = conn.execute(sql, params).mappings().first()

        if not row:
            raise HTTPException(status_code=404, detail="Post not found")

    return PostOut(**dict(row))


@router.delete("/posts/{slug}")
def delete_post(slug: str):
    """Delete post"""
    with engine.begin() as conn:
        result = conn.execute(text("""
            DELETE FROM blog_posts WHERE slug = :slug
        """), {"slug": slug})

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Post not found")

    return {"message": "Post deleted successfully"}


@router.post("/posts/{slug}/publish", response_model=PostOut)
def toggle_publish(slug: str):
    """Toggle publish status"""
    with engine.begin() as conn:
        # Get current status
        row = conn.execute(text("""
            SELECT is_published FROM blog_posts WHERE slug = :slug
        """), {"slug": slug}).mappings().first()

        if not row:
            raise HTTPException(status_code=404, detail="Post not found")

        new_status = not row["is_published"]

        # Update status
        sql = text(f"""
            UPDATE blog_posts
            SET is_published = :is_published,
                published_at = CASE WHEN :is_published THEN NOW() ELSE NULL END,
                updated_at = NOW()
            WHERE slug = :slug
            RETURNING {POST_FIELDS}
        """)

        updated_row = conn.execute(sql, {
            "slug": slug,
            "is_published": new_status
        }).mappings().first()

    return PostOut(**dict(updated_row))


@router.post("/posts/{slug}/increment-views", response_model=PostOut)
def increment_views(slug: str):
    """Increment view count"""
    with engine.begin() as conn:
        sql = text(f"""
            UPDATE blog_posts
            SET view_count = view_count + 1
            WHERE slug = :slug
            RETURNING {POST_FIELDS}
        """)

        row = conn.execute(sql, {"slug": slug}).mappings().first()

        if not row:
            raise HTTPException(status_code=404, detail="Post not found")

    return PostOut(**dict(row))


@router.get("/categories", response_model=List[CategoryOut])
def list_categories(is_published: Optional[bool] = Query(None, description="발행 상태 필터")):
    """Get all categories with post counts"""
    where_clause = "WHERE is_published = :is_published" if is_published is not None else ""
    params = {"is_published": is_published} if is_published is not None else {}

    sql = text(f"""
        SELECT category, COUNT(*) as count
        FROM blog_posts
        {where_clause}
        GROUP BY category
        ORDER BY category
    """)

    with engine.begin() as conn:
        rows = conn.execute(sql, params).mappings().all()

    return [CategoryOut(**dict(r)) for r in rows]
