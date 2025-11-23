"""블로그 CRUD API - 관리자용"""

import os
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import psycopg2
import psycopg2.extras

router = APIRouter(tags=["blogs-crud"])

class BlogUpdateRequest(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

def get_conn():
    url = os.getenv("DB_URL") or os.getenv("DATABASE_URL")
    if not url:
        raise HTTPException(status_code=500, detail="DB_URL/DATABASE_URL not set")
    
    url = url.replace("postgresql+psycopg2://", "postgresql://")
    return psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor)

@router.put("/blogs/{plcy_no}")
def update_blog_post(plcy_no: str, request: BlogUpdateRequest):
    """블로그 포스트 수정"""
    
    print(f"🔄 블로그 수정 요청 - plcy_no: {plcy_no}")
    print(f"📝 요청 데이터: {request.dict()}")
    
    conn = get_conn()
    try:
        # 업데이트할 필드 수집
        update_fields = []
        params = []
        
        if request.title is not None:
            update_fields.append("blog_title = %s")
            params.append(request.title)
            
        if request.summary is not None:
            update_fields.append("blog_summary = %s")
            params.append(request.summary)
            
        if request.content is not None:
            update_fields.append("blog_content = %s")
            params.append(request.content)
            
        if request.category is not None:
            # 실제 DB에는 category 컬럼만 존재
            update_fields.append("category = %s")
            params.append(request.category)
            
            print(f"📝 카테고리 업데이트:")
            print(f"  - category: '{request.category}'")
            
            # "교육" 카테고리 특별 체크
            if request.category == '교육':
                print(f"🎓 교육 카테고리 특별 체크:")
                print(f"  - 값: '{request.category}'")
                print(f"  - 길이: {len(request.category)}")
                print(f"  - 문자 코드: {[ord(c) for c in request.category]}")
                print(f"  - UTF-8 바이트: {request.category.encode('utf-8')}")
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="수정할 필드가 없습니다")
        
        # plcy_no는 WHERE 절용으로 마지막에 추가
        params.append(plcy_no)
        
        # 업데이트 실행
        update_query = f"""
            UPDATE blog_posts 
            SET {', '.join(update_fields)}, updated_at = NOW()
            WHERE plcy_no = %s
            RETURNING plcy_no, blog_title, blog_summary, blog_content, category, updated_at
        """
        
        cur = conn.cursor()
        
        print(f"🔍 실행할 쿼리: {update_query}")
        print(f"📋 파라미터: {params}")
        
        # 카테고리 업데이트 전 현재 상태 확인
        if any('category' in field for field in update_fields):
            cur.execute("SELECT plcy_no, category FROM blog_posts WHERE plcy_no = %s", (plcy_no,))
            current = cur.fetchone()
            if current:
                print(f"🔍 업데이트 전 현재 카테고리: '{current['category']}'")
        
        cur.execute(update_query, params)
        updated_row = cur.fetchone()
        
        if not updated_row:
            raise HTTPException(status_code=404, detail="블로그 포스트를 찾을 수 없습니다")
        
        conn.commit()
        cur.close()
        
        print(f"✅ 업데이트 완료: {dict(updated_row)}")
        
        return {
            "message": "블로그 포스트가 수정되었습니다",
            "data": dict(updated_row)
        }
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"수정 실패: {str(e)}")
    finally:
        conn.close()

@router.delete("/blogs/{plcy_no}")
def delete_blog_post(plcy_no: str):
    """블로그 포스트 삭제"""
    
    conn = get_conn()
    try:
        cur = conn.cursor()
        
        # 삭제 전 존재 여부 확인
        cur.execute("SELECT plcy_no, blog_title FROM blog_posts WHERE plcy_no = %s", (plcy_no,))
        existing = cur.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="블로그 포스트를 찾을 수 없습니다")
        
        # 실제 삭제 (또는 소프트 삭제로 변경 가능)
        cur.execute("DELETE FROM blog_posts WHERE plcy_no = %s", (plcy_no,))
        
        conn.commit()
        cur.close()
        
        return {
            "message": f"블로그 포스트 '{existing['blog_title']}'가 삭제되었습니다",
            "deleted_plcy_no": plcy_no
        }
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"삭제 실패: {str(e)}")
    finally:
        conn.close()
