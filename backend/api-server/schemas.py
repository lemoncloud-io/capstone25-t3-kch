# schemas.py
from pydantic import BaseModel
from typing import Optional

# 정책 원본 데이터 스키마
class PolicyRawSchema(BaseModel):
    id: int
    plcy_no: str
    plcy_nm: str
    plcy_kywd_nm: Optional[str] = None
    plcy_expln_cn: Optional[str] = None
    lclsf_nm: Optional[str] = None
    mclsf_nm: Optional[str] = None
    plcy_sprt_cn: Optional[str] = None
    sprvsn_inst_cd: Optional[str] = None
    sprvsn_inst_cd_nm: Optional[str] = None
    oper_inst_cd: Optional[str] = None
    oper_inst_cd_nm: Optional[str] = None
    biz_prd_bgng_ymd: Optional[str] = None
    biz_prd_end_ymd: Optional[str] = None
    aply_ymd: Optional[str] = None
    sprt_trgt_min_age: Optional[str] = None
    sprt_trgt_max_age: Optional[str] = None
    plcy_aply_mthd_cn: Optional[str] = None
    srng_mthd_cn: Optional[str] = None
    aply_url_addr: Optional[str] = None
    sbmsn_dcmnt_cn: Optional[str] = None
    ref_url_addr1: Optional[str] = None
    ref_url_addr2: Optional[str] = None
    inq_cnt: Optional[str] = None
    zip_cd: Optional[str] = None
    frst_reg_dt: Optional[str] = None
    last_mdfcn_dt: Optional[str] = None

    class Config:
        orm_mode = True