// src/features/onboarding/Desktop3.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './Header';
import { ChevronLeft } from 'lucide-react'; 

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

const ContentArea3 = styled.div<{ $top?: number; $left?: number }>`
    display: flex;
    flex-direction: column;
    align-items: center;           /* 가로 중앙 */
    justify-content: flex-start;   /* 세로 상단 정렬 */
    flex-grow: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;                /* 가운데 배치 */
    /* 위쪽 여백을 prop으로 제어 */
    padding: ${({ $top }) => ($top ?? 10)}px 20px 0px;
    /* 필요하면 좌우 위치 미세 조정 (기본 0) */
    position: relative;
    left: ${({ $left }) => ($left ?? 0)}px;
    box-sizing: border-box;
    padding-top: 74px;
`;

const MainContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
`;

const QuestionText3 = styled.h2`
    font-size: 25px;
    font-weight: 700;
    color: #333333;
`;

const EmojiContainer3 = styled.div`
    width: 180px;
    height: 180px;
    margin: 0 auto 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
`;

const HomeEmoji = styled.span`
    font-size: 150px;
    line-height: 1;
`;

const LocationInputContainer = styled.div`
    box-sizing: border-box;
    position: relative;
    width: 250px;
    height: 60px;
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
    font-size: 18px;
    font-weight: 700;
    color: #000000;
`;

const DropdownIconArea = styled.div`
    width: 36px;
    height: 36px;
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
    font-size: 18px;
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
    margin-top: 205px;
`;

const StyledPaginationDot = styled.div<{ $active: boolean }>`
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: ${(p) => (p.$active ? '#B0CEEA' : '#E0E0E0')};
    transition: background-color 0.3s;
`;

const BackButton = styled.button`
    position: absolute;
    top: 40px; 
    left: 80px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2376C4; 
    transition: opacity 0.2s;
    z-index: 20;

    &:hover {
        opacity: 0.7;
    }
`;

// =========================================================================
// React
// =========================================================================

interface Desktop3Props {
    onSetLocation: (location: string) => void;
    onGoBack: () => void; 
}

const LOCATIONS = ['서울', '경기', '인천', '부산', '대구'];

const Desktop3: React.FC<Desktop3Props> = ({ onSetLocation, onGoBack }) => { 
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

            <ContentArea3 $top={110} $left={0}>
                
                <BackButton onClick={onGoBack} aria-label="이전 단계로">
                    <ChevronLeft size={30} />
                </BackButton>

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