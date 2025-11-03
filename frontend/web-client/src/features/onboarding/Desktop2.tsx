// src/features/onboarding/Desktop2.tsx

import React from 'react';
import styled, { type CSSProperties } from 'styled-components';
import Header from './Header';

// =========================================================================
// CSS-in-JS (styled-components) 영역
// =========================================================================

// 전체 화면 컨테이너 (.desktop-container-2)
const DesktopContainer2 = styled.div`
    width: 100vw;
    min-height: 80vh;
    position: relative;
    background: #FFFFFF;

    display: flex;
    flex-direction: column;
`;

// 콘텐츠 영역 (.content-area-2)
const ContentArea2 = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 60px;
`;

// 질문 텍스트 스타일 (.question-text-2)
const QuestionText2 = styled.h2`
    font-size: 25px;
    font-weight: 700;
    color: #333333;
    margin-top: 0;
    margin-bottom: 40px;
`;

// 선택 영역 컨테이너 (.selection-area-2)
const SelectionArea2 = styled.div`
    display: flex;
    flex-direction: row;
    gap: 15px;
    margin-bottom: 50px;
`;

// 상태 선택 버튼 스타일 (.status-button-2)
const StatusButton2 = styled.button`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px;
    gap: 15px;

    width: 280px;
    height: 250px;

    background: #FFFFFF;
    border: 3px solid #B0CEEA;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: #2376C4;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
`;

const StatusText2 = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 24px;
    line-height: 36px;
    color: #2376C4;
`;

const PaginationContainer2 = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 145px;
    padding-bottom: 0;
    gap: 10px;
`;

const PaginationDot = styled.div<{ $active?: boolean }>`
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: ${props => (props.$active ? '#B0CEEA' : '#E0E0E0')};
`;


// =========================================================================
// React 컴포넌트 영역
// =========================================================================

interface Desktop2Props {
    onSelectStatus: (status: '대학생' | '취업준비생') => void;
}

const Desktop2: React.FC<Desktop2Props> = ({ onSelectStatus }) => {
    
    // 이미지 크기를 StatusEmoji2의 font-size(120px)에 맞추어 변수로 정의
    const imageSize = '120px';
    const imageStyle: CSSProperties = { width: imageSize, height: imageSize, objectFit: 'contain' };

    return (
        <DesktopContainer2>
            <Header />

            <ContentArea2>

                <QuestionText2>현재 당신의 상태는 어떤가요?</QuestionText2>

                <SelectionArea2>
                    <StatusButton2
                        onClick={() => onSelectStatus('대학생')}
                        type="button"
                    >
                        {/* 대학생 이모지 -> /student_lemon.png 이미지로 변경 */}
                        <img 
                            src="/student_lemon.png" 
                            alt="대학생 레몬 캐릭터" 
                            style={imageStyle}
                        />
                        <StatusText2>대학생</StatusText2>
                    </StatusButton2>

                    <StatusButton2
                        onClick={() => onSelectStatus('취업준비생')}
                        type="button"
                    >
                        {/* 취업준비생 이모지 -> /job_lemon.png 이미지로 변경 */}
                         <img 
                            src="/job_lemon.png" 
                            alt="취업준비생 레몬 캐릭터" 
                            style={imageStyle}
                        />
                        <StatusText2>취업준비생</StatusText2>
                    </StatusButton2>
                </SelectionArea2>

                <PaginationContainer2>
                    <PaginationDot />
                    <PaginationDot $active />
                    <PaginationDot />
                </PaginationContainer2>

            </ContentArea2>

        </DesktopContainer2>
    );
};

export default Desktop2;