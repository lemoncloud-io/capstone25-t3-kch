import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function StatusPage() {
    const navigate = useNavigate()
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

    const handleStatusClick = (status: string) => {
        setSelectedStatus(status)
        // 선택 후 나이 선택 페이지로 이동
        setTimeout(() => {
            navigate('/age')
        }, 500)
    }

    return (
        <div className="w-screen h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* 제목 */}
            <h1 className="text-[30px] font-semibold text-black mb-16" style={{ width: '370px', height: '36px', lineHeight: '36px', textAlign: 'center' }}>
                현재 당신의 상태는 어떤가요?
            </h1>

            {/* 카드 컨테이너 */}
            <div className="flex gap-16 mb-20">
                {/* 대학생 카드 */}
                <button
                    onClick={() => handleStatusClick('student')}
                    className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                        selectedStatus === 'student' ? 'scale-110' : 'hover:scale-105'
                    }`}
                >
                    <div className={`w-[176px] h-[176px] rounded-[20px] relative shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                        selectedStatus === 'student' ? 'bg-[#FFA500]' : 'bg-[#FEBC02]'
                    }`}>
                        <p className="absolute top-4 left-4 text-white text-[15px] font-semibold text-left leading-tight">
                            미래를 위해<br />준비하는
                        </p>
                        <img
                            src="/images/lemon/student_lemon.png"
                            alt="대학생"
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[150px] h-auto object-contain"
                        />
                    </div>
                    <p className="text-black text-[15px] font-semibold mt-4">대학생</p>
                </button>

                {/* 취업준비생 카드 */}
                <button
                    onClick={() => handleStatusClick('jobseeker')}
                    className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                        selectedStatus === 'jobseeker' ? 'scale-110' : 'hover:scale-105'
                    }`}
                >
                    <div className={`w-[176px] h-[176px] rounded-[20px] relative shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                        selectedStatus === 'jobseeker' ? 'bg-[#FFA500]' : 'bg-[#FEBC02]'
                    }`}>
                        <p className="absolute top-4 left-4 text-white text-[15px] font-semibold text-left leading-tight">
                            내일을 향해<br />나아가는
                        </p>
                        <img
                            src="/images/lemon/job_lemon.png"
                            alt="취업준비생"
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[150px] h-auto object-contain"
                        />
                    </div>
                    <p className="text-black text-[15px] font-semibold mt-4">취업준비생</p>
                </button>
            </div>

            {/* 네비게이션 바 */}
            <div className="absolute bottom-12 flex gap-1">
                <div className="w-[8px] h-[8px] bg-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
                <div className="w-[8px] h-[8px] bg-white border border-[#FEAE02] rounded-full"></div>
            </div>
        </div>
    )
}

export default StatusPage

