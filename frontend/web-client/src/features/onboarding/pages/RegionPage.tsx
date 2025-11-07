import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const REGIONS = [
    '서울특별시',
    '부산광역시',
    '대구광역시',
    '인천광역시',
    '광주광역시',
    '대전광역시',
    '울산광역시',
    '세종특별자치시',
    '경기도',
    '강원특별자치도',
    '충청북도',
    '충청남도',
    '전북특별자치도',
    '전라남도',
    '경상북도',
    '경상남도',
    '제주특별자치도',
]

function RegionPage() {
    const navigate = useNavigate()
    const [selectedRegion, setSelectedRegion] = useState<string>('')
    const [isOpen, setIsOpen] = useState(false)

    const handleRegionSelect = (region: string) => {
        setSelectedRegion(region)
        setIsOpen(false)
    }

    const handleNext = () => {
        if (selectedRegion) {
            localStorage.setItem('userRegion', selectedRegion)
            navigate('/onboarding/interest')
        }
    }

    return (
        <div className="w-screen min-h-screen bg-white flex flex-col items-center justify-center relative overflow-auto py-16 animate-fadeIn" onClick={() => isOpen && setIsOpen(false)}>
            {/* 뒤로 가기 버튼 */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-8 left-8 w-[35px] h-[35px] rounded-full bg-[#FEBC02] border-2 border-[#FEAE02] flex items-center justify-center hover:scale-110 transition-transform shadow-md cursor-pointer"
            >
                <img src="/images/left-arrow.png" alt="뒤로 가기" className="w-5 h-5" />
            </button>

            {/* 콘텐츠 컨테이너 (상단 배치) */}
            <div className="flex flex-col items-center -mt-40">
                {/* 레몬 잠자는 이미지 */}
                <img
                    src="/images/lemon/lemon_sleep.png"
                    alt="레몬"
                    className="w-[228px] h-[228px] object-contain mb-4"
                />

                {/* 제목 */}
                <h1 className="text-[30px] font-semibold text-black mb-2">
                    현재 당신의 거주지는 어디인가요?
                </h1>

                {/* 설명 */}
                <p className="text-[13px] font-normal text-gray-600 mb-8">
                    선택한 지역으로 설정됩니다
                </p>

                {/* 지역 선택 드롭다운 */}
                <div className="relative flex flex-col items-center">
                    <button
                        onClick={() => !selectedRegion && setIsOpen(!isOpen)}
                        className={`w-[496px] h-[44px] rounded-lg shadow-md flex items-center justify-between px-4 transition-all ${
                            selectedRegion
                                ? 'bg-[#FEBC02] border-2 border-[#FEAE02] cursor-default'
                                : 'bg-white border-2 border-[#FEAE02]'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <img 
                                src={selectedRegion ? "/images/gps.png" : "/images/gps-2.png"} 
                                alt="위치" 
                                className="w-5 h-5" 
                            />
                            <span className={`text-[15px] ${selectedRegion ? 'text-white font-medium' : 'text-gray-400'}`}>
                                {selectedRegion || '서울특별시'}
                            </span>
                        </div>
                        {selectedRegion ? (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleNext()
                                }}
                                className="flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                            >
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        ) : (
                            <svg
                                className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                    </button>
                    
                    {/* 다시 선택하기 버튼 */}
                    {selectedRegion && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="mt-2 text-[13px] text-gray-500 hover:text-black transition-colors underline"
                        >
                            다시 선택하기
                        </button>
                    )}

                    {/* 드롭다운 메뉴 */}
                    {isOpen && (
                        <div 
                            className="absolute top-12 left-0 w-[496px] max-h-[300px] overflow-y-auto bg-white border-2 border-[#FEAE02] rounded-lg shadow-lg z-10"
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#FEAE02 #f0f0f0'
                            }}
                        >
                            {REGIONS.map((region) => (
                                <button
                                    key={region}
                                    onClick={() => handleRegionSelect(region)}
                                    className={`w-full h-[44px] px-4 flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                                        selectedRegion === region ? 'bg-[#FFF9E6]' : ''
                                    }`}
                                >
                                    <img src="/images/gps-2.png" alt="위치" className="w-5 h-5" />
                                    <span className="text-[15px]">{region}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 네비게이션 바 */}
            <div className="absolute bottom-12 flex gap-1">
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
            </div>
        </div>
    )
}

export default RegionPage

