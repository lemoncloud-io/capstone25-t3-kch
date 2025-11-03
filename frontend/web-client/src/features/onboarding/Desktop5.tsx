// src/features/onboarding/Desktop5.tsx

import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components'; 
import Header from './Header'; 


// =========================================================================
// CSS-in-JS (styled-components) 영역
// =========================================================================

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const DesktopContainer5 = styled.div`
    width: 100vw;
    min-height: 100vh;
    position: relative;
    background: #FFFFFF;
    
    display: flex;
    flex-direction: column;
`;

const LoadingContentArea = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    position: relative;
`;

// 🌟 수정: 70% 크기 (200px -> 140px)
const LoadingIndicatorContainer = styled.div`
    width: 140px;
    height: 140px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
`;

// 🌟 수정: 70% 크기 (150px -> 105px, border 15px -> 11px)
const Spinner = styled.div`
    width: 105px;
    height: 105px;
    border: 11px solid #B0CEEA;
    border-top: 11px solid #2376C4;
    border-radius: 50%;
    animation: ${spin} 1.5s linear infinite;
`;

// 🌟 수정: 70% 크기 (font-size 30px -> 21px, width 657px -> 460px, line-height 조정)
const LoadingMessageText = styled.p`
    width: 460px; 
    font-style: normal;
    font-weight: 600;
    font-size: 21px; 
    line-height: 43px; /* 61px의 70%는 약 43px */
    text-align: center;
    color: #000000;
    z-index: 1;
`;

// =========================================================================
// React 컴포넌트 영역
// =========================================================================

interface Desktop5Props {
    onLoadingComplete: () => void;
}

const Desktop5: React.FC<Desktop5Props> = ({ onLoadingComplete }) => {

    useEffect(() => {
        const LOADING_DURATION = 3000;

        const timer = setTimeout(() => {
            onLoadingComplete(); 
        }, LOADING_DURATION);

        return () => clearTimeout(timer);
    }, [onLoadingComplete]); 


    return (
        <DesktopContainer5>
            <Header />

            <LoadingContentArea>
                
                <LoadingIndicatorContainer>
                    {/* 로딩 스피너 */}
                    <Spinner role="status" aria-live="polite" />
                </LoadingIndicatorContainer>

                <LoadingMessageText>
                    당신을 위한 청년 정책을<br /> 검색하는 중입니다
                </LoadingMessageText>

            </LoadingContentArea>
        </DesktopContainer5>
    );
};

export default Desktop5;