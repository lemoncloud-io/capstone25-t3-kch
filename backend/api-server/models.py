from sqlalchemy import Column, String, Integer, Text, TIMESTAMP, func
from database import Base


class PolicyRaw(Base):
    __tablename__ = "policies_raw"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # 기본 정책 정보
    plcy_no = Column(String, unique=True, index=True, nullable=False)   # 정책 번호
    plcy_nm = Column(String, nullable=False)                           # 정책 이름
    plcy_kywd_nm = Column(String)                                      # 키워드
    plcy_expln_cn = Column(Text)                                       # 정책 설명
    lclsf_nm = Column(String)                                          # 대분류
    mclsf_nm = Column(String)                                          # 중분류
    plcy_sprt_cn = Column(Text)                                        # 지원 내용

    # 기관 정보
    sprvsn_inst_cd = Column(String)
    sprvsn_inst_cd_nm = Column(String)
    oper_inst_cd = Column(String)
    oper_inst_cd_nm = Column(String)

    # 사업 기간
    biz_prd_bgng_ymd = Column(String)
    biz_prd_end_ymd = Column(String)
    aply_ymd = Column(String)

    # 대상 연령
    sprt_trgt_min_age = Column(String)
    sprt_trgt_max_age = Column(String)

    # 신청 방법
    plcy_aply_mthd_cn = Column(Text)
    srng_mthd_cn = Column(Text)
    aply_url_addr = Column(String)
    sbmsn_dcmnt_cn = Column(Text)
    ref_url_addr1 = Column(String)
    ref_url_addr2 = Column(String)

    # 기타
    inq_cnt = Column(Integer)
    zip_cd = Column(String)
    frst_reg_dt = Column(String)
    last_mdfcn_dt = Column(String)

# 2. 전처리된 정책 데이터 (분류/정제 후 저장)
class PolicyClean(Base):
    __tablename__ = "policies_clean"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer)               # PolicyRaw.id 참조
    target_group = Column(String(100))        # 대상 그룹 (대학생, 취준생 등)
    amount = Column(Integer, nullable=True)   # 지원 금액 (숫자만 추출)
    duration = Column(String(100))            # 기간 정보 정제
    category = Column(String(100))            # 정제된 카테고리
    cleaned_content = Column(Text)            # 정제된 본문

# 3. AI 변환된 정책 데이터 (최종 사용자 노출)
class PolicyGenerated(Base):
    __tablename__ = "policies_generated"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer)               # PolicyClean.id 참조
    generated_title = Column(Text)            # 변환된 제목
    generated_summary = Column(Text)          # 변환된 요약
    generated_content = Column(Text)          # 변환된 본문
    created_at = Column(TIMESTAMP, server_default=func.now())