import os
import requests
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import PolicyRaw
from dotenv import load_dotenv

router = APIRouter()
load_dotenv()  # .env 불러오기

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 환경변수에서 API 키 불러오기
API_URL = "https://www.youthcenter.go.kr/go/ythip/getPlcy"
API_KEY = os.getenv("YOUTHCENTER_API_KEY")

@router.post("/collect")
def collect_policies(page: int = 1, size: int = 10, db: Session = Depends(get_db)):
    params = {
        "apiKeyNm": API_KEY,
        "pageNum": page,
        "pageSize": size,
        "rtnType": "json"
    }
    res = requests.get(API_URL, params=params)
    data = res.json()

    count = 0
    for item in data.get("result", {}).get("youthPolicyList", []):
        # plcy_no 중복 체크
        exists = db.query(PolicyRaw).filter(PolicyRaw.plcy_no == item.get("plcyNo")).first()
        if exists:
            continue  # 이미 있으면 skip

        policy = PolicyRaw(
            plcy_no=item.get("plcyNo"),
            plcy_nm=item.get("plcyNm"),
            plcy_expln_cn=item.get("plcyExplnCn"),
            plcy_kywd_nm=item.get("plcyKywdNm"),
            lclsf_nm=item.get("lclsfNm"),
            mclsf_nm=item.get("mclsfNm"),
            sprt_trgt_min_age=item.get("sprtTrgtMinAge"),
            sprt_trgt_max_age=item.get("sprtTrgtMaxAge"),
            biz_prd_bgng_ymd=item.get("bizPrdBgngYmd"),
            biz_prd_end_ymd=item.get("bizPrdEndYmd"),
            plcy_aply_mthd_cn=item.get("plcyAplyMthdCn"),
            srng_mthd_cn=item.get("srngMthdCn"),
            aply_url_addr=item.get("aplyUrlAddr"),
            sbmsn_dcmnt_cn=item.get("sbmsnDcmntCn"),
            ref_url_addr1=item.get("refUrlAddr1")
        )
        db.add(policy)
        count += 1

    db.commit()
    return {"message": f"{count}개 정책 데이터 저장 완료 (중복 제외됨)"}