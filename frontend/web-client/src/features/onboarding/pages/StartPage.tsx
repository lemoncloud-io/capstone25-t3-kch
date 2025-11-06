import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function StartPage() {
    const navigate = useNavigate()
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div className="w-screen h-screen bg-[#FFCD42] relative overflow-hidden">
            {/* 왼쪽 하단 레몬 캐릭터 */}
            <img
                src="/images/lemon/lemon.png"
                alt="레몬 캐릭터"
                className="absolute left-[-10vw] bottom-0 w-[62.5vw] max-w-[800px] h-auto object-contain"
            />

            {/* 오른쪽 중앙 콘텐츠 */}
            <div className="w-full h-full flex items-center justify-center pl-[37vw] pr-[10vw] relative z-10">
                <div className="flex flex-col items-start max-w-[800px] w-full -mt-[25vh]">
                    <div className="flex items-start gap-[0.8vw] mb-[2vh]">
                        <img
                            src="/images/lemon/Lemon_hi.png"
                            alt="레몬 아이콘"
                            className="w-[3.9vw] max-w-[50px] h-auto object-contain flex-shrink-0 mt-[0.5vh]"
                        />
                        <h1 className="font-lacquer text-black leading-[1.1] whitespace-nowrap lowercase" style={{ fontFamily: 'Lacquer, cursive', fontSize: 'min(4vw, 50px)' }}>
                            find your youth policy
                        </h1>
                    </div>

                    <p className="text-black font-normal mb-[3vh] leading-[1.4]" style={{ fontSize: 'min(1.4vw, 18px)' }}>
                        케코한 블로그는 당신에게 꼭 맞는 청년 정책을 추천해드립니다
                    </p>

                    <button
                        onClick={() => navigate('/status')}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`w-[10.5vw] max-w-[134px] h-[3.6vw] max-h-[46px] border-2 border-black rounded-full font-medium transition-all duration-300 flex items-center justify-center ${
                            isHovered ? 'bg-black text-white' : 'bg-transparent text-black'
                        }`}
                        style={{ fontSize: 'min(1.25vw, 16px)' }}
                    >
                        시작하기
                    </button>
                </div>
            </div>
        </div>
    )
}

export default StartPage

