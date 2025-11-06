import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const AGE_RANGES = [
    { id: '19-24', label: '19~24세', value: '19-24' },
    { id: '25-29', label: '25~29세', value: '25-29' },
    { id: '30-34', label: '30~34세', value: '30-34' },
    { id: '35+', label: '35세 이상', value: '35+' },
]

function AgePage() {
    const navigate = useNavigate()
    const [selectedAge, setSelectedAge] = useState<string>('')
    const [isOpen, setIsOpen] = useState(false)

    const handleAgeSelect = (value: string) => {
        setSelectedAge(value)
        setIsOpen(false)
    }

    const handleNext = () => {
        if (selectedAge) {
            navigate('/region')
        }
    }

    return (
        <div className="w-screen h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden" onClick={() => isOpen && setIsOpen(false)}>
            {/* 뒤로 가기 버튼 */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-8 left-8 w-[35px] h-[35px] rounded-full bg-[#FEBC02] border-2 border-[#FEAE02] flex items-center justify-center hover:scale-110 transition-transform shadow-md"
            >
                <img src="/images/left-arrow.png" alt="뒤로 가기" className="w-5 h-5" />
            </button>

            {/* 콘텐츠 컨테이너 */}
            <div className="flex flex-col items-center -mt-32">
                {/* 제목 */}
                <h1 className="text-[30px] font-semibold text-black mb-2">
                    현재 나이를 선택해주세요
                </h1>

                {/* 설명 */}
                <p className="text-[13px] font-normal text-gray-600 mb-8">
                    케코한 블로그는 <span className="text-[#FEBC02] font-semibold">만 나이</span>를 기준으로 합니다
                </p>

                {/* 나이 선택 드롭다운 */}
                <div className="relative flex flex-col items-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            if (!selectedAge) {
                                setIsOpen(!isOpen)
                            }
                        }}
                        className={`w-[320px] h-[44px] rounded-lg shadow-md flex items-center justify-between px-4 transition-all ${
                            selectedAge
                                ? 'bg-[#FEBC02] border-2 border-[#FEAE02] cursor-default'
                                : 'bg-white border-2 border-[#FEAE02]'
                        }`}
                    >
                        <span className={`text-[15px] ${selectedAge ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {selectedAge ? AGE_RANGES.find(a => a.value === selectedAge)?.label : '나이를 선택하세요'}
                        </span>
                        {selectedAge ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleNext()
                                }}
                                className="flex items-center justify-center hover:scale-110 transition-transform"
                            >
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
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
                    {selectedAge && (
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
                            className="absolute top-12 left-0 w-[320px] bg-white border-2 border-[#FEAE02] rounded-lg shadow-lg z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {AGE_RANGES.map((ageRange) => (
                                <button
                                    key={ageRange.id}
                                    onClick={() => handleAgeSelect(ageRange.value)}
                                    className={`w-full h-[44px] px-4 flex items-center hover:bg-gray-50 transition-colors ${
                                        selectedAge === ageRange.value ? 'bg-[#FFF9E6]' : ''
                                    }`}
                                >
                                    <span className="text-[15px]">{ageRange.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 네비게이션 바 */}
            <div className="absolute bottom-12 flex gap-1">
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
            </div>
        </div>
    )
}

export default AgePage

