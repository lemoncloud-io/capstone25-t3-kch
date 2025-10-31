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
    gap: 30px;
    margin-top: 100px;
`;

// 이모지 스타일 (.waving-emoji)
const WavingEmoji = styled.span`
    font-size: 200px;
    line-height: 1;
    display: inline-block;
    margin-bottom: 30px;
`;

// 추천 텍스트 (.recommend-text)
const RecommendText = styled.p`
    width: 621px;
    font-style: normal;
    font-weight: 600;
    font-size: 35px;
    line-height: 48px;
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
    width: 369px;
    height: 71px;
    background: #B0CEEA;
    border-radius: 50px;
    cursor: pointer;
    border: none;
    margin-top: 50px;
    /* transition: background-color 0.3s;

    &:hover {
        /* background-color: #8faacd;
    }
`;

// 시작하기 텍스트 (.start-button-text)
const StartButtonText = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 50px;
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
       
        <WavingEmoji role="img" aria-label="손 흔드는 이모지">
          👋
        </WavingEmoji>
       
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