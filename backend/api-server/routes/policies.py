from typing import Optional, List, Any, Generic, TypeVar
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from database import engine

router = APIRouter(tags=["policies"])

# 응답 스키마
class PolicyCleanOut(BaseModel):
    plcy_no: str
    title: Optional[str] = None
    category: Optional[str] = None
    category_auto: Optional[str] = None
    region: Optional[str] = None
    amount_min: Optional[int] = None
    amount_max: Optional[int] = None
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    provider: Optional[str] = None
    summary: Optional[str] = None
    content_data: Optional[Any] = None   # 프론트가 바로 쓰게 전체 전달

# Paginated response schema
T = TypeVar('T')
class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    limit: int
    offset: int

# Filter options schema
class PolicyFiltersOut(BaseModel):
    regions: List[str]
    categories: List[str]

# 목록 API (/api/policies)
@router.get("/policies", response_model=PaginatedResponse[PolicyCleanOut])
def list_policies(
    q: Optional[str] = Query(None, description="제목/요약 검색어"),
    region: Optional[str] = Query(None, description="지역 접두어 검색 (예: '경상남도', '서울특별시 강남구')"),
    category: Optional[str] = Query(None, description="원본 카테고리(예: 일자리)"),
    category_auto: Optional[str] = Query(None, description="자동 분류(예: 취업/교육)"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    conds = []
    params = {}
    if q:
        conds.append("(title ILIKE :q OR summary ILIKE :q)")
        params["q"] = f"%{q}%"
    if region:
        conds.append("region ILIKE :region")
        params["region"] = f"{region}%"
    if category:
        conds.append("category = :category")
        params["category"] = category
    if category_auto:
        conds.append("category_auto = :category_auto")
        params["category_auto"] = category_auto

    where = "WHERE " + " AND ".join(conds) if conds else ""

    # Count query
    count_sql = text(f"""
        SELECT COUNT(*) as total
        FROM policy_clean
        {where}
    """)

    # Data query
    data_sql = text(f"""
        SELECT
          plcy_no, title, category, category_auto, region,
          amount_min, amount_max,
          period_start AS period_start,
          period_end   AS period_end,
          provider, summary, content_data
        FROM policy_clean
        {where}
        ORDER BY updated_at DESC NULLS LAST
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
        items = [PolicyCleanOut(**dict(r)) for r in rows]

    return PaginatedResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset
    )

# 필터 옵션 API (/api/policies/filters) - 동적 경로보다 먼저 정의!
@router.get("/policies/filters", response_model=PolicyFiltersOut)
def get_policy_filters():
    """Get all available filter options (regions and categories)"""
    regions_sql = text("""
        SELECT DISTINCT region
        FROM policy_clean
        WHERE region IS NOT NULL
        ORDER BY region
    """)

    categories_sql = text("""
        SELECT DISTINCT category_auto
        FROM policy_clean
        WHERE category_auto IS NOT NULL
        ORDER BY category_auto
    """)

    with engine.begin() as conn:
        region_rows = conn.execute(regions_sql).fetchall()
        category_rows = conn.execute(categories_sql).fetchall()

        regions = [row[0] for row in region_rows]
        categories = [row[0] for row in category_rows]

    return PolicyFiltersOut(regions=regions, categories=categories)

# 상세 API (/api/policies/{plcy_no}) - 동적 경로는 나중에!
@router.get("/policies/{plcy_no}", response_model=PolicyCleanOut)
def get_policy(plcy_no: str):
    sql = text("""
        SELECT
          plcy_no, title, category, category_auto, region,
          amount_min, amount_max,
          period_start AS period_start,
          period_end   AS period_end,
          provider, summary, content_data
        FROM policy_clean
        WHERE plcy_no = :plcy_no
        LIMIT 1
    """)
    with engine.begin() as conn:
        row = conn.execute(sql, {"plcy_no": plcy_no}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    return PolicyCleanOut(**dict(row))