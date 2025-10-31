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

const LoadingIndicatorContainer = styled.div`
    width: 200px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
`;

const Spinner = styled.div`
    width: 150px;
    height: 150px;
    border: 15px solid #B0CEEA;
    border-top: 15px solid #2376C4;
    border-radius: 50%;
    animation: ${spin} 1.5s linear infinite;
`;

const LoadingMessageText = styled.p`
    width: 657px;
    font-style: normal;
    font-weight: 600;
    font-size: 30px;
    line-height: 61px;
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