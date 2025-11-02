// src/features/onboarding/Desktop3.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './Header';

// =========================================================================
// styled-components
// =========================================================================

const DesktopContainer3 = styled.div`
  width: 100vw;
  min-height: 100vh;
  position: relative;
  background: #ffffff;
  display: flex;
  flex-direction: column;
`;

// ✅ transient props: $top, $left
const ContentArea3 = styled.div<{ $top?: number; $left?: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;           /* 가로 중앙 */
  justify-content: flex-start;   /* 세로 상단 정렬 */
  flex-grow: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;                /* 가운데 배치 */
  /* 위쪽 여백을 prop으로 제어 (기본 150px) */
  padding: ${({ $top }) => ($top ?? 150)}px 20px 80px;
  /* 필요하면 좌우 위치 미세 조정 (기본 0) */
  position: relative;
  left: ${({ $left }) => ($left ?? 0)}px;
  box-sizing: border-box;
`;

const MainContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
`;

const QuestionText3 = styled.h2`
  font-size: 30px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 32px;
`;

const EmojiContainer3 = styled.div`
  width: 250px;
  height: 250px;
  margin: 0 auto 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
`;

const HomeEmoji = styled.span`
  font-size: 180px;
  line-height: 1;
`;

const LocationInputContainer = styled.div`
  box-sizing: border-box;
  position: relative;
  width: 338px;
  height: 70px;
  background: #ffffff;
  border: 2px solid #2376c4;
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px 0 25px;
  cursor: pointer;
  margin: 0 auto;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 10px rgba(35, 118, 196, 0.2);
  }
`;

const SelectedLocationText = styled.span`
  font-size: 20px;
  font-weight: 500;
  color: #000000;
`;

const DropdownIconArea = styled.div`
  width: 50px;
  height: 50px;
  background: #b0ceea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DropdownMenu = styled.div`
  position: absolute;
  width: 100%;
  top: 75px;
  left: 0;
  background-color: #ffffff;
  border: 1px solid #2376c4;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 250px;
  overflow-y: auto;
`;

const DropdownItem = styled.div`
  padding: 15px 25px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  color: #000000;
  transition: background-color 0.1s;

  &:hover {
    background-color: #f0f8ff;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
`;

const StyledPaginationDot = styled.div<{ $active: boolean }>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${(p) => (p.$active ? '#B0CEEA' : '#E0E0E0')};
  transition: background-color 0.3s;
`;

// =========================================================================
// React
// =========================================================================

interface Desktop3Props {
  onSetLocation: (location: string) => void;
}

const LOCATIONS = ['서울', '경기', '인천', '부산', '대구'];

const Desktop3: React.FC<Desktop3Props> = ({ onSetLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setIsDropdownOpen(false);
    setTimeout(() => onSetLocation(location), 500);
  };

  return (
    <DesktopContainer3>
      <Header />

      {/* ✅ prop 이름도 $top / $left로 전달 */}
      <ContentArea3 $top={120} $left={0}>
        <MainContentWrapper>
          <QuestionText3>어느 지역의 정책을 찾으시나요?</QuestionText3>

          <EmojiContainer3>
            <HomeEmoji role="img" aria-label="집 이모지">🏠</HomeEmoji>
          </EmojiContainer3>

          <LocationInputContainer onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <SelectedLocationText>{selectedLocation}</SelectedLocationText>

            <DropdownIconArea>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden>
                <path d="M7 10l5 5 5-5z" fill="white" />
              </svg>
            </DropdownIconArea>

            {isDropdownOpen && (
              <DropdownMenu>
                {LOCATIONS.map((loc) => (
                  <DropdownItem
                    key={loc}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationSelect(loc);
                    }}
                  >
                    {loc}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </LocationInputContainer>
        </MainContentWrapper>

        <PaginationContainer>
          <StyledPaginationDot $active={false} />
          <StyledPaginationDot $active={true} />
          <StyledPaginationDot $active={false} />
        </PaginationContainer>
      </ContentArea3>
    </DesktopContainer3>
  );
};

export default Desktop3;
