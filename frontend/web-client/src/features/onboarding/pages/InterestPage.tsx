import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const INTERESTS = [
    { id: 'job', name: '취업 지원', image: '/images/interest/job-seeker.png', marginBottom: 'mb-[-10px]' },
    { id: 'education', name: '교육', image: '/images/interest/books.png', marginBottom: 'mb-[-10px]' },
    { id: 'startup', name: '창업', image: '/images/interest/shuttle.png', marginBottom: 'mb-[-5px]' },
    { id: 'housing', name: '주거', image: '/images/interest/house.png', marginBottom: 'mb-[-5px]' },
    { id: 'loan', name: '대출·금융', image: '/images/interest/coins.png', marginBottom: 'mb-[-10px]' },
    { id: 'living', name: '생활비 지원', image: '/images/interest/money.png', marginBottom: 'mb-[-10px]' },
    { id: 'culture', name: '문화·여가', image: '/images/interest/extracurricular-activities.png', marginBottom: 'mb-[-5px]' },
    { id: 'health', name: '건강·상담', image: '/images/interest/fitness.png', marginBottom: 'mb-[-10px]' },
    { id: 'abroad', name: '해외 기회', image: '/images/interest/airline-ticket.png', marginBottom: 'mb-[-10px]' },
    { id: 'participation', name: '청년 참여', image: '/images/interest/children.png', marginBottom: 'mb-[-10px]' },
]

function InterestPage() {
    const navigate = useNavigate()
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])

    const handleInterestClick = (id: string) => {
        if (selectedInterests.includes(id)) {
            setSelectedInterests(selectedInterests.filter(item => item !== id))
        } else {
            setSelectedInterests([...selectedInterests, id])
        }
    }

    return (
        <div className="w-screen min-h-screen bg-white flex flex-col items-center justify-center relative overflow-auto py-16">
            {/* 뒤로 가기 버튼 */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-8 left-8 w-[35px] h-[35px] rounded-full bg-[#FEBC02] border-2 border-[#FEAE02] flex items-center justify-center hover:scale-110 transition-transform shadow-md"
            >
                <img src="/images/left-arrow.png" alt="뒤로 가기" className="w-5 h-5" />
            </button>

            {/* 콘텐츠 컨테이너 */}
            <div className="flex flex-col items-center -mt-8">
                {/* 제목 */}
                <h1 className="text-[30px] font-semibold text-black mb-10">
                    당신의 관심사는 무엇인가요?
                </h1>

                {/* 관심사 그리드 */}
                <div className="grid grid-cols-5 gap-x-6 gap-y-6 mb-16">
                    {INTERESTS.map((interest) => (
                        <div key={interest.id} className="flex flex-col items-center">
                            <button
                                onClick={() => handleInterestClick(interest.id)}
                                className="w-[120px] h-[120px] rounded-[20px] flex items-end justify-center overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl bg-[#FEBC02] hover:scale-105 relative"
                            >
                                <img
                                    src={interest.image}
                                    alt={interest.name}
                                    className={`w-[90px] h-[90px] object-contain ${interest.marginBottom}`}
                                />
                                {/* 선택된 경우 오버레이와 하트 표시 */}
                                {selectedInterests.includes(interest.id) && (
                                    <>
                                        <div className="absolute inset-0 bg-red-500 opacity-50 rounded-[20px]"></div>
                                        <img
                                            src="/images/heart.png"
                                            alt="선택됨"
                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[24px] h-[24px] z-10"
                                        />
                                    </>
                                )}
                            </button>
                            <p className="text-[15px] font-semibold text-black mt-2">
                                {interest.name}
                            </p>
                        </div>
                    ))}
                </div>

                {/* 시작하기 버튼 */}
                {selectedInterests.length > 0 && (
                    <button
                        onClick={() => {
                            // TODO: 온보딩 완료 후 메인 페이지로 이동
                            console.log('선택된 관심사:', selectedInterests)
                            navigate('/')
                        }}
                        className="mt-6 w-[110px] h-[40px] bg-[#FEBC02] text-black border-2 border-[#FEAE02] rounded-full text-[14px] font-medium hover:bg-[#FEAE02] transition-all duration-200"
                    >
                        시작하기
                    </button>
                )}
            </div>

            {/* 네비게이션 바 */}
            <div className="absolute bottom-12 flex gap-1">
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-[#FEAE02] rounded-full"></div>
            </div>
        </div>
    )
}

export default InterestPage

