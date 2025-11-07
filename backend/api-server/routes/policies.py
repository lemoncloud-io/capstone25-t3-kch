from typing import Optional, List, Any
import os
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DB_URL")
if not DB_URL:
    raise RuntimeError("DB_URL이 .env에 없습니다.")

engine = create_engine(DB_URL, pool_pre_ping=True)

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

# 정책 업데이트 요청 스키마
class PolicyUpdateReq(BaseModel):
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
    target_group: Optional[str] = None
    apply_method: Optional[str] = None
    apply_url: Optional[str] = None

# 목록 API (/api/policies)
@router.get("/policies", response_model=List[PolicyCleanOut])
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
    sql = text(f"""
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
        rows = conn.execute(sql, params).mappings().all()
    return [PolicyCleanOut(**dict(r)) for r in rows]

# 상세 API (/api/policies/{plcy_no})
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

# 정책 업데이트 API (PUT /api/policies/{plcy_no})
@router.put("/policies/{plcy_no}", response_model=PolicyCleanOut)
def update_policy(plcy_no: str, req: PolicyUpdateReq):
    """정책 정보 업데이트 (기간, 금액, 요약 등 값 보정)"""
    
    # 업데이트할 필드만 수집
    update_fields = []
    params = {"plcy_no": plcy_no}
    
    if req.title is not None:
        update_fields.append("title = :title")
        params["title"] = req.title
    if req.category is not None:
        update_fields.append("category = :category")
        params["category"] = req.category
    if req.category_auto is not None:
        update_fields.append("category_auto = :category_auto")
        params["category_auto"] = req.category_auto
    if req.region is not None:
        update_fields.append("region = :region")
        params["region"] = req.region
    if req.amount_min is not None:
        update_fields.append("amount_min = :amount_min")
        params["amount_min"] = req.amount_min
    if req.amount_max is not None:
        update_fields.append("amount_max = :amount_max")
        params["amount_max"] = req.amount_max
    if req.period_start is not None:
        update_fields.append("period_start = :period_start")
        params["period_start"] = req.period_start
    if req.period_end is not None:
        update_fields.append("period_end = :period_end")
        params["period_end"] = req.period_end
    if req.provider is not None:
        update_fields.append("provider = :provider")
        params["provider"] = req.provider
    if req.summary is not None:
        update_fields.append("summary = :summary")
        params["summary"] = req.summary
    if req.target_group is not None:
        update_fields.append("target_group = :target_group")
        params["target_group"] = req.target_group
    if req.apply_method is not None:
        update_fields.append("apply_method = :apply_method")
        params["apply_method"] = req.apply_method
    if req.apply_url is not None:
        update_fields.append("apply_url = :apply_url")
        params["apply_url"] = req.apply_url
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="업데이트할 필드가 없습니다")
    
    # 정책 존재 여부 확인
    check_sql = text("SELECT plcy_no FROM policy_clean WHERE plcy_no = :plcy_no")
    with engine.begin() as conn:
        exists = conn.execute(check_sql, {"plcy_no": plcy_no}).first()
        if not exists:
            raise HTTPException(status_code=404, detail="정책을 찾을 수 없습니다")
        
        # 업데이트 실행
        update_sql = text(f"""
            UPDATE policy_clean 
            SET {', '.join(update_fields)}, updated_at = NOW()
            WHERE plcy_no = :plcy_no
        """)
        conn.execute(update_sql, params)
    
    # 업데이트된 정책 반환
    return get_policy(plcy_no)

# 정책 삭제 API (DELETE /api/policies/{plcy_no})
@router.delete("/policies/{plcy_no}")
def delete_policy(plcy_no: str):
    """정책 소프트 삭제 (is_active = false)"""
    
    # is_active 컬럼이 없으면 추가
    with engine.begin() as conn:
        # 컬럼 존재 여부 확인
        check_column_sql = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'policy_clean' AND column_name = 'is_active'
        """)
        has_column = conn.execute(check_column_sql).first()
        
        if not has_column:
            # is_active 컬럼 추가 (기본값 true)
            alter_sql = text("""
                ALTER TABLE policy_clean 
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
            """)
            conn.execute(alter_sql)
        
        # 정책 존재 여부 확인
        check_sql = text("SELECT plcy_no FROM policy_clean WHERE plcy_no = :plcy_no")
        exists = conn.execute(check_sql, {"plcy_no": plcy_no}).first()
        if not exists:
            raise HTTPException(status_code=404, detail="정책을 찾을 수 없습니다")
        
        # 소프트 삭제 실행
        delete_sql = text("""
            UPDATE policy_clean 
            SET is_active = false, updated_at = NOW()
            WHERE plcy_no = :plcy_no
        """)
        conn.execute(delete_sql, {"plcy_no": plcy_no})
    
    return {"message": "정책이 비활성화되었습니다", "plcy_no": plcy_no}