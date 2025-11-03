// src/features/onboarding/Desktop1.tsx

import React from 'react';
import styled from 'styled-components';
import Header from './Header';

// =========================================================================
// CSS-in-JS (styled-components) 영역
// =========================================================================

// 전체 화면 컨테이너 (.desktop-container)
const DesktopContainer = styled.div`
    /* width: 1440px;*/
    /* height: 1024px; */
    position: relative;
    background: #FFFFFF;
`;

// 이미지 및 텍스트 컨테이너 (.content-area)
const ContentArea = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 0px;
`;

// 추천 텍스트 (.recommend-text)
const RecommendText = styled.p`
    width: 621px;
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 25px;
    text-align: center;
    color: #000000;
`;

// 시작하기 버튼 (.start-button-frame)
const StartButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 67px;
    gap: 10px;
    width: 220px;
    height: 60px;
    background: #B0CEEA;
    border-radius: 50px;
    cursor: pointer;
    border: none;
    margin-top: 30px;
    /* transition: background-color 0.3s;

    &:hover {
        /* background-color: #8faacd;
    }
`;

// 시작하기 텍스트 (.start-button-text)
const StartButtonText = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 21px;
    line-height: 61px;
    color: #2376C4;
`;

// =========================================================================
// React 컴포넌트 영역
// =========================================================================

interface Desktop1Props {
    onStart: () => void;
}

const Desktop1: React.FC<Desktop1Props> = ({ onStart }) => {

    return (
        // 전체 화면 컨테이너
        <DesktopContainer>
            
            <Header />
            
            <ContentArea>
                
                <img 
                    src="/Lemon_hi.png" 
                    alt="손 흔드는 이모지" 
                    style={{ 
                        width: '300px', 
                        height: '300px', 
                        marginBottom: '30px' 
                    }} 
                />
                
                <RecommendText>
                    케코한 블로그는<br />당신에게 꼭 맞는 청년 정책을<br />추천해 드립니다.
                </RecommendText>
                
                <StartButton
                    onClick={onStart}
                    type="button"
                >
                    <StartButtonText>시작하기</StartButtonText>
                </StartButton>
                
            </ContentArea>
            
        </DesktopContainer>
    );
};

export default Desktop1;