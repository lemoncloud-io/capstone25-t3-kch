import type { Policy } from '../types'

/**
 * Mock policy data for development without backend
 * 50+ realistic Korean youth policies across various categories and regions
 */
export const mockPolicies: Policy[] = [
    // 서울특별시 - 취업 지원
    {
        plcy_no: 'R2024010001',
        title: '서울시 청년 일자리 도전 지원사업',
        category: '일자리',
        category_auto: '취업',
        region: '서울특별시',
        amount_min: 500000,
        amount_max: 3000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '서울특별시',
        summary: '구직활동을 하는 만 18~34세 서울시 청년에게 월 50만원씩 최대 6개월 지원',
        blog_json: {
            conditions: {
                target: '만 18~34세 서울시 거주 미취업 청년',
            },
            summary: '구직활동 중인 청년에게 매월 50만원씩 최대 6개월간 지원하여 안정적인 취업준비 환경을 조성합니다.',
            apply: {
                method: '서울시 청년포털 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024010002',
        title: '청년 취업 성공 패키지',
        category: '취업',
        category_auto: '취업',
        region: '서울특별시 강남구',
        amount_min: 2000000,
        amount_max: 5000000,
        period_start: '2024-03-01',
        period_end: '2024-10-31',
        provider: '강남구청',
        summary: '청년들의 취업 역량 강화를 위한 교육 및 취업 알선 프로그램',
        blog_json: {
            conditions: {
                target: '만 19~34세 강남구 거주 구직 청년',
            },
            summary: '직업훈련, 취업상담, 인턴십 지원을 통해 청년 취업을 돕는 종합 패키지 프로그램입니다.',
            apply: {
                method: '강남구 일자리센터 방문 또는 온라인 신청',
            },
        },
    },
    // 경기도 - 창업 지원
    {
        plcy_no: 'R2024020001',
        title: '경기도 청년 창업지원금',
        category: '창업',
        category_auto: '창업',
        region: '경기도',
        amount_min: 10000000,
        amount_max: 50000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '경기도청',
        summary: '예비 창업자 및 초기 창업자에게 최대 5천만원 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 경기도 내 예비 또는 3년 이내 창업자',
            },
            summary: '창업 초기 자금 부담을 줄이고 안정적인 사업 기반을 마련할 수 있도록 창업지원금을 제공합니다.',
            apply: {
                method: '경기도 청년포털 온라인 접수',
            },
        },
    },
    {
        plcy_no: 'R2024020002',
        title: '판교 스타트업 육성 프로그램',
        category: '창업',
        category_auto: '창업',
        region: '경기도 성남시',
        amount_min: 20000000,
        amount_max: 100000000,
        period_start: '2024-01-15',
        period_end: '2024-12-15',
        provider: '경기도 경제과학진흥원',
        summary: 'IT 및 테크 스타트업을 위한 멘토링과 투자 연계 프로그램',
        blog_json: {
            conditions: {
                target: '만 19~39세 기술 기반 창업 청년',
            },
            summary: '판교 테크노밸리 입주 지원, 멘토링, 투자 유치 연계를 통해 스타트업 성장을 지원합니다.',
            apply: {
                method: '경기도 경제과학진흥원 홈페이지 신청',
            },
        },
    },
    // 부산광역시 - 주거 지원
    {
        plcy_no: 'R2024030001',
        title: '부산 청년 월세 지원사업',
        category: '주거',
        category_auto: '주거',
        region: '부산광역시',
        amount_min: 2400000,
        amount_max: 3600000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '부산광역시',
        summary: '월세 부담을 덜어주는 청년 주거비 지원, 월 최대 30만원',
        blog_json: {
            conditions: {
                target: '만 19~34세 부산시 거주 무주택 청년',
            },
            summary: '청년들의 주거 안정을 위해 월세의 일부를 최대 1년간 지원합니다.',
            apply: {
                method: '부산시 청년정책 포털 신청',
            },
        },
    },
    {
        plcy_no: 'R2024030002',
        title: '청년 전세자금 이자 지원',
        category: '주거',
        category_auto: '주거',
        region: '부산광역시 해운대구',
        amount_min: 1000000,
        amount_max: 5000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '해운대구청',
        summary: '전세 대출 이자의 일부를 지원하여 주거비 부담 경감',
        blog_json: {
            conditions: {
                target: '만 19~34세 해운대구 거주 청년 세대주',
            },
            summary: '전세 자금 대출 이자를 최대 연 2% 한도로 지원하여 주거 안정을 돕습니다.',
            apply: {
                method: '해운대구청 주거복지과 방문 또는 온라인 신청',
            },
        },
    },
    // 대구광역시 - 교육 지원
    {
        plcy_no: 'R2024040001',
        title: '대구 청년 직업훈련 지원',
        category: '교육',
        category_auto: '교육',
        region: '대구광역시',
        amount_min: 1000000,
        amount_max: 5000000,
        period_start: '2024-03-01',
        period_end: '2024-12-31',
        provider: '대구광역시',
        summary: '직업교육 및 자격증 취득 비용 지원',
        blog_json: {
            conditions: {
                target: '만 18~34세 대구시 거주 청년',
            },
            summary: '취업 경쟁력 향상을 위한 직업훈련 및 자격증 취득 비용을 지원합니다.',
            apply: {
                method: '대구시 일자리센터 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024040002',
        title: '청년 해외 연수 지원 프로그램',
        category: '교육',
        category_auto: '교육',
        region: '대구광역시',
        amount_min: 5000000,
        amount_max: 15000000,
        period_start: '2024-04-01',
        period_end: '2024-09-30',
        provider: '대구광역시 인재육성재단',
        summary: '글로벌 역량 강화를 위한 해외 연수 및 어학 연수 지원',
        blog_json: {
            conditions: {
                target: '만 20~35세 대구시 거주 또는 대구 소재 대학 재학생',
            },
            summary: '청년들의 글로벌 경쟁력을 높이기 위해 해외 연수 기회와 경비를 지원합니다.',
            apply: {
                method: '대구 인재육성재단 홈페이지 신청',
            },
        },
    },
    // 인천광역시 - 복지 지원
    {
        plcy_no: 'R2024050001',
        title: '인천 청년 건강검진 지원',
        category: '복지',
        category_auto: '복지',
        region: '인천광역시',
        amount_min: 100000,
        amount_max: 300000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '인천광역시',
        summary: '청년들의 건강관리를 위한 건강검진 비용 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 인천시 거주 청년',
            },
            summary: '청년 건강 증진을 위해 정기 건강검진 비용을 지원합니다.',
            apply: {
                method: '인천시 보건소 및 지정 의료기관 이용',
            },
        },
    },
    {
        plcy_no: 'R2024050002',
        title: '청년 문화생활 지원 바우처',
        category: '복지',
        category_auto: '복지',
        region: '인천광역시',
        amount_min: 200000,
        amount_max: 500000,
        period_start: '2024-03-01',
        period_end: '2024-11-30',
        provider: '인천광역시 문화관광국',
        summary: '문화·여가 활동 지원을 위한 바우처 제공',
        blog_json: {
            conditions: {
                target: '만 19~34세 인천시 거주 청년',
            },
            summary: '청년들의 문화 향유 기회 확대를 위해 공연, 영화, 전시 등에 사용 가능한 바우처를 제공합니다.',
            apply: {
                method: '인천시 문화포털 온라인 신청',
            },
        },
    },
    // 광주광역시 - 취업 지원
    {
        plcy_no: 'R2024060001',
        title: '광주 청년 구직활동 지원금',
        category: '취업',
        category_auto: '취업',
        region: '광주광역시',
        amount_min: 3000000,
        amount_max: 6000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '광주광역시',
        summary: '구직활동 청년에게 월 50만원씩 최대 6개월 지급',
        blog_json: {
            conditions: {
                target: '만 18~34세 광주시 거주 미취업 청년',
            },
            summary: '안정적인 구직활동을 위해 생활비를 지원하고, 취업 프로그램과 연계합니다.',
            apply: {
                method: '광주시 청년센터 온라인 접수',
            },
        },
    },
    {
        plcy_no: 'R2024060002',
        title: '광주 청년 일자리 매칭 프로그램',
        category: '취업',
        category_auto: '취업',
        region: '광주광역시',
        amount_min: 1000000,
        amount_max: 3000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '광주광역시 일자리정책과',
        summary: '청년 맞춤형 일자리 매칭 및 취업 준비 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 광주시 거주 구직 청년',
            },
            summary: '개인별 역량 분석을 통한 맞춤형 일자리 매칭과 취업 준비 컨설팅을 제공합니다.',
            apply: {
                method: '광주 일자리센터 방문 또는 온라인 신청',
            },
        },
    },
    // 대전광역시 - 창업 지원
    {
        plcy_no: 'R2024070001',
        title: '대전 청년 창업 인큐베이팅',
        category: '창업',
        category_auto: '창업',
        region: '대전광역시',
        amount_min: 10000000,
        amount_max: 30000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '대전광역시',
        summary: '예비 창업자를 위한 사무 공간 제공 및 창업 자금 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 대전시 예비 또는 초기 창업자',
            },
            summary: '창업 공간, 멘토링, 자금 지원을 통해 청년 창업의 성공률을 높입니다.',
            apply: {
                method: '대전시 창업지원센터 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024070002',
        title: '청년 소상공인 지원사업',
        category: '창업',
        category_auto: '창업',
        region: '대전광역시',
        amount_min: 5000000,
        amount_max: 20000000,
        period_start: '2024-03-01',
        period_end: '2024-10-31',
        provider: '대전광역시 소상공인지원센터',
        summary: '소상공인 창업 청년을 위한 초기 운영자금 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 대전시 내 소상공인 창업 청년',
            },
            summary: '카페, 음식점 등 소상공인 업종 창업 시 초기 운영자금을 지원합니다.',
            apply: {
                method: '대전 소상공인지원센터 방문 상담 후 신청',
            },
        },
    },
    // 울산광역시 - 주거 지원
    {
        plcy_no: 'R2024080001',
        title: '울산 청년 주거안정 지원',
        category: '주거',
        category_auto: '주거',
        region: '울산광역시',
        amount_min: 2000000,
        amount_max: 4000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '울산광역시',
        summary: '청년 1인 가구의 주거비 지원, 월 최대 30만원',
        blog_json: {
            conditions: {
                target: '만 19~34세 울산시 거주 무주택 청년',
            },
            summary: '청년 1인 가구의 주거 안정을 위해 월세 일부를 지원합니다.',
            apply: {
                method: '울산시 청년정책과 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024080002',
        title: '청년 공유주택 지원',
        category: '주거',
        category_auto: '주거',
        region: '울산광역시',
        amount_min: 1000000,
        amount_max: 3000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '울산광역시 도시주택과',
        summary: '공유주택 입주 청년에게 임대료 및 관리비 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 울산시 거주 희망 청년',
            },
            summary: '청년들이 함께 생활하며 주거비를 절감할 수 있도록 공유주택 입주를 지원합니다.',
            apply: {
                method: '울산시 도시주택과 방문 또는 온라인 신청',
            },
        },
    },
    // 세종특별자치시 - 교육 지원
    {
        plcy_no: 'R2024090001',
        title: '세종 청년 학자금 대출 이자 지원',
        category: '교육',
        category_auto: '교육',
        region: '세종특별자치시',
        amount_min: 500000,
        amount_max: 2000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '세종특별자치시',
        summary: '청년들의 학자금 대출 이자 부담 경감',
        blog_json: {
            conditions: {
                target: '만 19~34세 세종시 거주 학자금 대출 청년',
            },
            summary: '학자금 대출 이자의 일부를 지원하여 청년들의 경제적 부담을 줄입니다.',
            apply: {
                method: '세종시 교육청소년과 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024090002',
        title: '청년 IT 교육 지원 프로그램',
        category: '교육',
        category_auto: '교육',
        region: '세종특별자치시',
        amount_min: 2000000,
        amount_max: 5000000,
        period_start: '2024-03-01',
        period_end: '2024-10-31',
        provider: '세종시 일자리경제진흥원',
        summary: '4차 산업혁명 대비 IT 역량 강화 교육 무료 제공',
        blog_json: {
            conditions: {
                target: '만 19~34세 세종시 거주 또는 근무 청년',
            },
            summary: 'AI, 빅데이터, 클라우드 등 최신 IT 기술 교육을 무료로 제공합니다.',
            apply: {
                method: '세종시 일자리경제진흥원 홈페이지 신청',
            },
        },
    },
    // 경상남도 - 취업/창업 지원
    {
        plcy_no: 'R2024100001',
        title: '경남 청년 취업 장려금',
        category: '취업',
        category_auto: '취업',
        region: '경상남도',
        amount_min: 3000000,
        amount_max: 9000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '경상남도',
        summary: '청년 고용 기업에 인센티브 지급 및 취업 청년에게 장려금 지원',
        blog_json: {
            conditions: {
                target: '만 18~34세 경남 지역 취업 청년',
            },
            summary: '취업 청년에게 3개월 근속 시 100만원, 6개월 200만원, 12개월 300만원 지급',
            apply: {
                method: '경남 일자리진흥원 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024100002',
        title: '경남 청년 농업 창업 지원',
        category: '창업',
        category_auto: '창업',
        region: '경상남도',
        amount_min: 30000000,
        amount_max: 100000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '경상남도 농업기술원',
        summary: '귀농·귀촌 청년 농업인 육성 및 스마트팜 창업 지원',
        blog_json: {
            conditions: {
                target: '만 18~40세 경남 지역 귀농 희망 또는 초기 농업 창업 청년',
            },
            summary: '스마트팜 시설 구축 비용, 영농 기술 교육, 멘토링을 종합 지원합니다.',
            apply: {
                method: '경남 농업기술원 방문 상담 후 신청',
            },
        },
    },
    // 경상북도 - 주거/교육 지원
    {
        plcy_no: 'R2024110001',
        title: '경북 청년 전세금 지원',
        category: '주거',
        category_auto: '주거',
        region: '경상북도',
        amount_min: 5000000,
        amount_max: 30000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '경상북도',
        summary: '청년 신혼부부 및 청년 1인 가구 전세자금 무이자 대출',
        blog_json: {
            conditions: {
                target: '만 19~34세 경북 지역 거주 무주택 청년',
            },
            summary: '최대 3천만원까지 무이자로 전세자금을 대출하여 주거 안정을 지원합니다.',
            apply: {
                method: '경북도청 주거복지과 또는 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024110002',
        title: '경북 청년 문화예술 인재 육성',
        category: '교육',
        category_auto: '교육',
        region: '경상북도',
        amount_min: 3000000,
        amount_max: 10000000,
        period_start: '2024-03-01',
        period_end: '2024-10-31',
        provider: '경상북도 문화관광체육국',
        summary: '청년 예술가 창작 활동 지원 및 전시·공연 기회 제공',
        blog_json: {
            conditions: {
                target: '만 19~39세 경북 지역 거주 또는 활동하는 예술인',
            },
            summary: '창작 지원금, 작품 전시 및 공연 기회, 해외 레지던시 프로그램을 지원합니다.',
            apply: {
                method: '경북 문화재단 홈페이지 신청',
            },
        },
    },
    // 전라남도 - 복지/취업 지원
    {
        plcy_no: 'R2024120001',
        title: '전남 청년 건강관리 지원',
        category: '복지',
        category_auto: '복지',
        region: '전라남도',
        amount_min: 150000,
        amount_max: 400000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '전라남도',
        summary: '청년 건강검진 및 예방접종 비용 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 전남 지역 거주 청년',
            },
            summary: '건강검진, 예방접종, 심리상담 서비스를 무료 또는 저렴하게 이용할 수 있습니다.',
            apply: {
                method: '전남도 보건소 및 지정 병원 이용',
            },
        },
    },
    {
        plcy_no: 'R2024120002',
        title: '전남 청년 어촌 일자리 지원',
        category: '취업',
        category_auto: '취업',
        region: '전라남도',
        amount_min: 18000000,
        amount_max: 24000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '전라남도 해양수산국',
        summary: '어촌 지역 청년 일자리 창출 및 정착 지원금 지급',
        blog_json: {
            conditions: {
                target: '만 18~39세 전남 어촌 지역 거주 또는 정착 희망 청년',
            },
            summary: '어촌 정착 청년에게 월 150만원씩 최대 12개월 지원하고, 주거 및 교육도 지원합니다.',
            apply: {
                method: '전남도청 해양수산국 방문 또는 온라인 신청',
            },
        },
    },
    // 전라북도 - 창업/교육 지원
    {
        plcy_no: 'R2024130001',
        title: '전북 청년 혁신 창업 지원',
        category: '창업',
        category_auto: '창업',
        region: '전라북도',
        amount_min: 20000000,
        amount_max: 50000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '전라북도',
        summary: '혁신 기술 기반 청년 창업 자금 및 멘토링 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 전북 지역 기술 창업 청년',
            },
            summary: 'AI, IoT, 바이오 등 혁신 기술 기반 창업 시 자금과 전문가 멘토링을 지원합니다.',
            apply: {
                method: '전북테크노파크 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024130002',
        title: '전북 청년 글로벌 인재 양성',
        category: '교육',
        category_auto: '교육',
        region: '전라북도',
        amount_min: 5000000,
        amount_max: 15000000,
        period_start: '2024-03-01',
        period_end: '2024-10-31',
        provider: '전라북도 인재육성재단',
        summary: '해외 연수 및 어학 교육 지원으로 글로벌 역량 강화',
        blog_json: {
            conditions: {
                target: '만 19~34세 전북 지역 거주 또는 대학 재학생',
            },
            summary: '해외 인턴십, 어학연수, 국제 컨퍼런스 참가 기회와 경비를 지원합니다.',
            apply: {
                method: '전북 인재육성재단 홈페이지 신청',
            },
        },
    },
    // 충청남도 - 주거/복지 지원
    {
        plcy_no: 'R2024140001',
        title: '충남 청년 주거비 지원',
        category: '주거',
        category_auto: '주거',
        region: '충청남도',
        amount_min: 3000000,
        amount_max: 6000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '충청남도',
        summary: '청년 월세 및 전세 보증금 지원으로 주거 안정 도모',
        blog_json: {
            conditions: {
                target: '만 19~34세 충남 지역 거주 무주택 청년',
            },
            summary: '월세는 월 최대 25만원, 전세는 최대 500만원까지 지원합니다.',
            apply: {
                method: '충남도청 주거복지센터 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024140002',
        title: '충남 청년 심리상담 지원',
        category: '복지',
        category_auto: '복지',
        region: '충청남도',
        amount_min: 100000,
        amount_max: 500000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '충청남도 정신건강복지센터',
        summary: '청년 정신건강 증진을 위한 무료 심리상담 서비스',
        blog_json: {
            conditions: {
                target: '만 19~34세 충남 지역 거주 청년',
            },
            summary: '전문 상담사의 개인 및 집단 상담 프로그램을 무료로 이용할 수 있습니다.',
            apply: {
                method: '충남 정신건강복지센터 전화 또는 온라인 예약',
            },
        },
    },
    // 충청북도 - 취업/창업 지원
    {
        plcy_no: 'R2024150001',
        title: '충북 청년 구직 활동비 지원',
        category: '취업',
        category_auto: '취업',
        region: '충청북도',
        amount_min: 3000000,
        amount_max: 6000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '충청북도',
        summary: '미취업 청년에게 구직활동비로 월 50만원씩 최대 6개월 지원',
        blog_json: {
            conditions: {
                target: '만 18~34세 충북 지역 거주 미취업 청년',
            },
            summary: '안정적인 구직활동을 위해 생활비와 교통비를 지원하고 취업 프로그램을 제공합니다.',
            apply: {
                method: '충북도청 일자리정책과 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024150002',
        title: '충북 청년 로컬 크리에이터 지원',
        category: '창업',
        category_auto: '창업',
        region: '충청북도',
        amount_min: 10000000,
        amount_max: 30000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '충청북도 문화산업진흥원',
        summary: '지역 콘텐츠 제작 청년 크리에이터 육성 및 창업 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 충북 지역 콘텐츠 제작 창업 청년',
            },
            summary: '영상, 웹툰, 음악 등 콘텐츠 제작 창업 시 자금과 장비, 스튜디오를 지원합니다.',
            apply: {
                method: '충북 문화산업진흥원 홈페이지 신청',
            },
        },
    },
    // 강원도 - 교육/주거 지원
    {
        plcy_no: 'R2024160001',
        title: '강원 청년 어학 교육 지원',
        category: '교육',
        category_auto: '교육',
        region: '강원도',
        amount_min: 1000000,
        amount_max: 3000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '강원도',
        summary: '청년 글로벌 역량 강화를 위한 어학 교육비 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 강원도 거주 청년',
            },
            summary: '영어, 중국어, 일본어 등 외국어 학원비 및 온라인 강의를 지원합니다.',
            apply: {
                method: '강원도청 교육지원과 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024160002',
        title: '강원 청년 귀촌 정착 지원',
        category: '주거',
        category_auto: '주거',
        region: '강원도',
        amount_min: 10000000,
        amount_max: 50000000,
        period_start: '2024-03-01',
        period_end: '2024-10-31',
        provider: '강원도 귀농귀촌지원센터',
        summary: '도시 청년의 강원도 귀촌 정착금 및 주택 구입·개보수 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 강원도 귀촌 희망 청년',
            },
            summary: '귀촌 정착금, 주택 구입·개보수 비용, 영농·창업 자금을 종합 지원합니다.',
            apply: {
                method: '강원도 귀농귀촌지원센터 방문 상담 후 신청',
            },
        },
    },
    // 제주특별자치도 - 복지/취업 지원
    {
        plcy_no: 'R2024170001',
        title: '제주 청년 생활안정 지원금',
        category: '복지',
        category_auto: '복지',
        region: '제주특별자치도',
        amount_min: 600000,
        amount_max: 1200000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '제주특별자치도',
        summary: '저소득 청년에게 생활안정 지원금 지급',
        blog_json: {
            conditions: {
                target: '만 19~34세 제주도 거주 저소득 청년',
            },
            summary: '기준 중위소득 100% 이하 청년에게 월 10만원씩 최대 12개월 지원',
            apply: {
                method: '제주도청 복지정책과 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024170002',
        title: '제주 청년 관광산업 일자리 지원',
        category: '취업',
        category_auto: '취업',
        region: '제주특별자치도',
        amount_min: 5000000,
        amount_max: 15000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '제주관광공사',
        summary: '관광 분야 청년 일자리 창출 및 역량 강화 교육',
        blog_json: {
            conditions: {
                target: '만 19~34세 제주도 거주 또는 근무 희망 청년',
            },
            summary: '호텔, 관광 가이드, 콘텐츠 제작 등 관광 분야 취업 지원 및 교육을 제공합니다.',
            apply: {
                method: '제주관광공사 홈페이지 신청',
            },
        },
    },
    // 서울 구별 지원 (강남구, 서초구, 송파구)
    {
        plcy_no: 'R2024180001',
        title: '서초구 청년 스타트업 지원',
        category: '창업',
        category_auto: '창업',
        region: '서울특별시 서초구',
        amount_min: 10000000,
        amount_max: 30000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '서초구청',
        summary: 'IT·테크 분야 청년 스타트업 창업 자금 및 사무 공간 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 서초구 소재 스타트업 창업 청년',
            },
            summary: '창업 초기 자금, 사무 공간 임대료 지원, 멘토링을 제공합니다.',
            apply: {
                method: '서초구 일자리경제과 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024180002',
        title: '송파구 청년 주거지원금',
        category: '주거',
        category_auto: '주거',
        region: '서울특별시 송파구',
        amount_min: 2400000,
        amount_max: 3600000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '송파구청',
        summary: '청년 1인 가구 월세 지원, 월 최대 30만원',
        blog_json: {
            conditions: {
                target: '만 19~34세 송파구 거주 무주택 청년',
            },
            summary: '송파구 청년의 주거 안정을 위해 월세 일부를 최대 12개월 지원합니다.',
            apply: {
                method: '송파구청 주거복지과 온라인 신청',
            },
        },
    },
    // 경기도 시별 지원 (수원, 고양, 용인)
    {
        plcy_no: 'R2024190001',
        title: '수원시 청년 취업 역량 강화',
        category: '교육',
        category_auto: '교육',
        region: '경기도 수원시',
        amount_min: 2000000,
        amount_max: 5000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '수원시',
        summary: '청년 취업 준비를 위한 직업훈련 및 자격증 취득 지원',
        blog_json: {
            conditions: {
                target: '만 18~34세 수원시 거주 구직 청년',
            },
            summary: 'IT, 제조, 서비스 등 다양한 분야 직업훈련과 자격증 취득 비용을 지원합니다.',
            apply: {
                method: '수원시 일자리센터 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024190002',
        title: '고양시 청년 문화예술 지원',
        category: '복지',
        category_auto: '복지',
        region: '경기도 고양시',
        amount_min: 300000,
        amount_max: 1000000,
        period_start: '2024-03-01',
        period_end: '2024-10-31',
        provider: '고양시 문화재단',
        summary: '청년 예술가 창작 활동 및 공연·전시 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 고양시 거주 또는 활동 예술인',
            },
            summary: '창작 활동비, 공연·전시 기회, 작품 홍보를 지원합니다.',
            apply: {
                method: '고양문화재단 홈페이지 신청',
            },
        },
    },
    {
        plcy_no: 'R2024190003',
        title: '용인시 청년 창업 공간 지원',
        category: '창업',
        category_auto: '창업',
        region: '경기도 용인시',
        amount_min: 5000000,
        amount_max: 20000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '용인시 일자리경제과',
        summary: '청년 창업자에게 사무 공간 및 운영비 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 용인시 소재 창업 청년',
            },
            summary: '창업 초기 사무 공간, 임대료, 운영비를 최대 2년간 지원합니다.',
            apply: {
                method: '용인시 일자리경제과 방문 또는 온라인 신청',
            },
        },
    },
    // 기타 지역 지원
    {
        plcy_no: 'R2024200001',
        title: '국토교통부 청년 전세대출 특례',
        category: '주거',
        category_auto: '주거',
        region: '전국',
        amount_min: 50000000,
        amount_max: 200000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '국토교통부',
        summary: '소득 요건을 충족하는 청년에게 저금리 전세대출 제공',
        blog_json: {
            conditions: {
                target: '만 19~34세 무주택 청년',
            },
            summary: '연 1~2%대 저금리로 최대 2억원까지 전세대출을 지원합니다.',
            apply: {
                method: '한국주택금융공사 및 은행 방문',
            },
        },
    },
    {
        plcy_no: 'R2024200002',
        title: '중소벤처기업부 청년 창업 사관학교',
        category: '창업',
        category_auto: '창업',
        region: '전국',
        amount_min: 50000000,
        amount_max: 100000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '중소벤처기업부',
        summary: '혁신 아이템 청년 창업자 집중 육성 프로그램',
        blog_json: {
            conditions: {
                target: '만 39세 이하 예비 또는 초기 창업자',
            },
            summary: '창업 자금, 멘토링, 사무 공간, 법률·회계 지원을 1년간 제공합니다.',
            apply: {
                method: '창업진흥원 홈페이지 신청',
            },
        },
    },
    {
        plcy_no: 'R2024200003',
        title: '고용노동부 국민취업지원제도',
        category: '취업',
        category_auto: '취업',
        region: '전국',
        amount_min: 3000000,
        amount_max: 6000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '고용노동부',
        summary: '저소득 구직자에게 생활비와 취업 지원 서비스 제공',
        blog_json: {
            conditions: {
                target: '만 15~69세 저소득 구직자',
            },
            summary: '월 50만원씩 최대 6개월 지급하고, 취업 교육 및 알선 서비스를 제공합니다.',
            apply: {
                method: '고용센터 방문 또는 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024200004',
        title: '교육부 국가장학금',
        category: '교육',
        category_auto: '교육',
        region: '전국',
        amount_min: 1000000,
        amount_max: 10000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '교육부',
        summary: '소득 수준에 따라 대학생 학비 지원',
        blog_json: {
            conditions: {
                target: '대한민국 국적 대학생',
            },
            summary: '소득 분위에 따라 등록금 전액 또는 일부를 지원합니다.',
            apply: {
                method: '한국장학재단 홈페이지 신청',
            },
        },
    },
    {
        plcy_no: 'R2024200005',
        title: '문화체육관광부 청년 문화패스',
        category: '복지',
        category_auto: '복지',
        region: '전국',
        amount_min: 100000,
        amount_max: 200000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '문화체육관광부',
        summary: '청년 문화 향유 기회 확대를 위한 문화비 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 대한민국 국민',
            },
            summary: '공연, 영화, 전시, 도서 등에 사용 가능한 포인트를 지원합니다.',
            apply: {
                method: '문화포털 온라인 신청',
            },
        },
    },
    // Additional 경상남도 policies for testing region filter
    {
        plcy_no: 'R2024100003',
        title: '경남 청년 주거 지원사업',
        category: '주거',
        category_auto: '주거',
        region: '경상남도',
        amount_min: 2400000,
        amount_max: 4800000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '경상남도',
        summary: '청년 월세 및 전세 부담 완화 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 경남 지역 거주 무주택 청년',
            },
            summary: '월세 20만원씩 최대 12개월 또는 전세 보증금 일부 지원',
            apply: {
                method: '경남도청 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024100004',
        title: '경남 청년 문화활동 지원',
        category: '복지',
        category_auto: '복지',
        region: '경상남도',
        amount_min: 200000,
        amount_max: 600000,
        period_start: '2024-03-01',
        period_end: '2024-11-30',
        provider: '경상남도 문화체육관광국',
        summary: '청년 문화생활 활성화를 위한 바우처 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 경남 지역 거주 청년',
            },
            summary: '공연, 전시, 영화 등에 사용 가능한 문화 바우처 제공',
            apply: {
                method: '경남 문화포털 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024100005',
        title: '경남 청년 직업훈련 지원',
        category: '교육',
        category_auto: '교육',
        region: '경상남도',
        amount_min: 3000000,
        amount_max: 8000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '경상남도 일자리진흥원',
        summary: '청년 취업 역량 강화를 위한 직업 교육 비용 지원',
        blog_json: {
            conditions: {
                target: '만 18~34세 경남 지역 거주 구직 청년',
            },
            summary: 'IT, 제조, 서비스 등 다양한 분야 직업훈련 비용 전액 지원',
            apply: {
                method: '경남 일자리진흥원 온라인 신청',
            },
        },
    },
    // Additional 부산광역시 policies for testing region filter
    {
        plcy_no: 'R2024030003',
        title: '부산 청년 창업 자금 지원',
        category: '창업',
        category_auto: '창업',
        region: '부산광역시',
        amount_min: 15000000,
        amount_max: 40000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '부산광역시 창업지원센터',
        summary: '혁신 기술 기반 청년 창업 초기 자금 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 부산시 소재 예비 또는 초기 창업 청년',
            },
            summary: '창업 아이템 검증, 사무 공간, 초기 운영자금을 종합 지원',
            apply: {
                method: '부산 창업지원센터 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024030004',
        title: '부산 청년 취업 성공 지원금',
        category: '취업',
        category_auto: '취업',
        region: '부산광역시',
        amount_min: 3000000,
        amount_max: 9000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '부산광역시 일자리경제국',
        summary: '중소기업 취업 청년에게 장려금 지급',
        blog_json: {
            conditions: {
                target: '만 18~34세 부산시 중소기업 취업 청년',
            },
            summary: '3개월 근속 시 100만원, 6개월 200만원, 12개월 300만원 지급',
            apply: {
                method: '부산시 일자리포털 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024030005',
        title: '부산 청년 교육 훈련 바우처',
        category: '교육',
        category_auto: '교육',
        region: '부산광역시',
        amount_min: 2000000,
        amount_max: 5000000,
        period_start: '2024-03-01',
        period_end: '2024-10-31',
        provider: '부산광역시 교육국',
        summary: '청년 역량 개발을 위한 교육 훈련비 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 부산시 거주 청년',
            },
            summary: '외국어, IT, 자격증 등 다양한 교육 과정 수강료 지원',
            apply: {
                method: '부산시 교육포털 온라인 신청',
            },
        },
    },
    // Additional 취업 category policies for testing category filter
    {
        plcy_no: 'R2024210001',
        title: '인천 청년 취업 지원금',
        category: '취업',
        category_auto: '취업',
        region: '인천광역시',
        amount_min: 3000000,
        amount_max: 6000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '인천광역시 일자리정책과',
        summary: '미취업 청년 구직활동 지원금',
        blog_json: {
            conditions: {
                target: '만 18~34세 인천시 거주 미취업 청년',
            },
            summary: '월 50만원씩 최대 6개월 지원 및 취업 프로그램 제공',
            apply: {
                method: '인천시 일자리센터 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024210002',
        title: '대전 청년 일자리 매칭',
        category: '취업',
        category_auto: '취업',
        region: '대전광역시',
        amount_min: 2000000,
        amount_max: 4000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '대전광역시 일자리경제과',
        summary: '청년 맞춤형 일자리 발굴 및 매칭 서비스',
        blog_json: {
            conditions: {
                target: '만 19~34세 대전시 거주 구직 청년',
            },
            summary: 'AI 기반 일자리 매칭과 취업 컨설팅 제공',
            apply: {
                method: '대전시 일자리포털 온라인 신청',
            },
        },
    },
    // Additional 창업 category policies for testing category filter
    {
        plcy_no: 'R2024220001',
        title: '울산 청년 스타트업 육성',
        category: '창업',
        category_auto: '창업',
        region: '울산광역시',
        amount_min: 15000000,
        amount_max: 50000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '울산광역시 경제산업국',
        summary: '울산 산업 특화 청년 창업 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 울산시 소재 창업 청년',
            },
            summary: '자동차, 조선, 화학 등 지역 특화 산업 창업 지원',
            apply: {
                method: '울산시 창업지원센터 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024220002',
        title: '광주 청년 소셜벤처 지원',
        category: '창업',
        category_auto: '창업',
        region: '광주광역시',
        amount_min: 20000000,
        amount_max: 60000000,
        period_start: '2024-03-01',
        period_end: '2024-10-31',
        provider: '광주광역시 사회적경제과',
        summary: '사회 문제 해결형 청년 창업 지원',
        blog_json: {
            conditions: {
                target: '만 19~39세 광주시 소셜벤처 창업 청년',
            },
            summary: '사회적 가치와 경제적 수익을 동시에 추구하는 창업 지원',
            apply: {
                method: '광주 사회적경제지원센터 온라인 신청',
            },
        },
    },
    // Additional 주거 category policies for testing category filter
    {
        plcy_no: 'R2024230001',
        title: '세종시 청년 임차보증금 지원',
        category: '주거',
        category_auto: '주거',
        region: '세종특별자치시',
        amount_min: 10000000,
        amount_max: 30000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '세종특별자치시',
        summary: '청년 임차보증금 무이자 대출',
        blog_json: {
            conditions: {
                target: '만 19~34세 세종시 거주 무주택 청년',
            },
            summary: '최대 3천만원 무이자 임차보증금 대출',
            apply: {
                method: '세종시 주거복지과 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024230002',
        title: '강원도 청년 주택 지원',
        category: '주거',
        category_auto: '주거',
        region: '강원도',
        amount_min: 3000000,
        amount_max: 6000000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '강원도',
        summary: '강원도 청년 월세 및 보증금 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 강원도 거주 무주택 청년',
            },
            summary: '월세 25만원씩 최대 12개월 지원',
            apply: {
                method: '강원도청 주거복지센터 온라인 신청',
            },
        },
    },
    // Additional 교육 category policies for testing category filter
    {
        plcy_no: 'R2024240001',
        title: '제주 청년 직무 교육 지원',
        category: '교육',
        category_auto: '교육',
        region: '제주특별자치도',
        amount_min: 2000000,
        amount_max: 6000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '제주특별자치도 인재개발원',
        summary: '관광, IT 등 제주 특화 직무 교육',
        blog_json: {
            conditions: {
                target: '만 19~34세 제주도 거주 또는 근무 희망 청년',
            },
            summary: '제주 지역 산업 맞춤형 직무 교육 비용 지원',
            apply: {
                method: '제주 인재개발원 온라인 신청',
            },
        },
    },
    {
        plcy_no: 'R2024240002',
        title: '충청남도 청년 자격증 취득 지원',
        category: '교육',
        category_auto: '교육',
        region: '충청남도',
        amount_min: 1000000,
        amount_max: 3000000,
        period_start: '2024-03-01',
        period_end: '2024-10-31',
        provider: '충청남도 인재육성과',
        summary: '청년 취업 역량 강화 자격증 취득 비용 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 충남 지역 거주 청년',
            },
            summary: '국가기술자격증, 전문자격증 취득 비용 전액 지원',
            apply: {
                method: '충남도청 인재육성과 온라인 신청',
            },
        },
    },
    // Additional 복지 category policies for testing category filter
    {
        plcy_no: 'R2024250001',
        title: '전라북도 청년 심리건강 지원',
        category: '복지',
        category_auto: '복지',
        region: '전라북도',
        amount_min: 200000,
        amount_max: 600000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '전라북도 정신건강복지센터',
        summary: '청년 정신건강 상담 및 치료 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 전북 지역 거주 청년',
            },
            summary: '전문 상담 및 심리치료 비용 무료 지원',
            apply: {
                method: '전북 정신건강복지센터 전화 예약',
            },
        },
    },
    {
        plcy_no: 'R2024250002',
        title: '경상북도 청년 문화체육 지원',
        category: '복지',
        category_auto: '복지',
        region: '경상북도',
        amount_min: 300000,
        amount_max: 800000,
        period_start: '2024-02-01',
        period_end: '2024-11-30',
        provider: '경상북도 문화체육관광국',
        summary: '청년 문화·체육 활동 바우처 지원',
        blog_json: {
            conditions: {
                target: '만 19~34세 경북 지역 거주 청년',
            },
            summary: '공연, 전시, 체육시설 이용 바우처 제공',
            apply: {
                method: '경북 문화포털 온라인 신청',
            },
        },
    },
]
