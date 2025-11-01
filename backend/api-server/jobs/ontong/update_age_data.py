"""
기존 DB의 연령 정보 업데이트 스크립트
연령 99세 이상인 경우 "연령 제한은 공식 사이트에서 확인 필요"로 변경
"""
import os
import json
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# .env 로드
load_dotenv()
DB_URL = os.getenv("DB_URL")

if not DB_URL:
    raise RuntimeError("DB_URL이 .env에 없습니다.")

engine = create_engine(DB_URL, pool_pre_ping=True)

def update_age_data():
    """연령 99세 이상 데이터를 업데이트"""
    
    with engine.begin() as conn:
        # 1. 모든 policy_clean 데이터 조회
        result = conn.execute(text("""
            SELECT id, plcy_no, target_group, content_data 
            FROM policy_clean
        """))
        
        updated_count = 0
        
        for row in result:
            row_id = row.id
            plcy_no = row.plcy_no
            target_group = row.target_group or ""
            content_data = row.content_data
            
            needs_update = False
            new_target_group = target_group
            new_content_data = content_data
            
            # target_group 업데이트 체크
            if "99" in target_group or "~99" in target_group:
                # 연령 0~0 체크
                if target_group == "연령 0~0":
                    new_target_group = ""
                else:
                    new_target_group = "연령 제한은 공식 사이트에서 확인 필요"
                needs_update = True
            elif target_group == "연령 0~0":
                new_target_group = ""
                needs_update = True
            
            # content_data 업데이트 체크
            if content_data and isinstance(content_data, dict):
                who = content_data.get("who", "")
                if "99" in who or "~99" in who:
                    new_content_data = content_data.copy()
                    if who == "연령 0~0":
                        new_content_data["who"] = ""
                    else:
                        new_content_data["who"] = "연령 제한은 공식 사이트에서 확인 필요"
                    needs_update = True
                elif who == "연령 0~0":
                    new_content_data = content_data.copy()
                    new_content_data["who"] = ""
                    needs_update = True
            
            # 업데이트 실행
            if needs_update:
                conn.execute(text("""
                    UPDATE policy_clean
                    SET target_group = :target_group,
                        content_data = :content_data,
                        updated_at = NOW()
                    WHERE id = :id
                """), {
                    "id": row_id,
                    "target_group": new_target_group,
                    "content_data": json.dumps(new_content_data, ensure_ascii=False) if new_content_data else None
                })
                updated_count += 1
                print(f"Updated: {plcy_no} - {target_group} → {new_target_group}")
    
    print(f"\n총 {updated_count}개 레코드 업데이트 완료!")

if __name__ == "__main__":
    print("연령 데이터 업데이트 시작...")
    update_age_data()
    print("완료!")

