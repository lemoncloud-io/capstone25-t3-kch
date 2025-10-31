// src/features/onboarding/Desktop3.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './Header';

// =========================================================================
// CSS-in-JS (styled-components) 영역
// =========================================================================

// 전체 화면 컨테이너 (유지)
const DesktopContainer3 = styled.div`
    width: 100vw;
    min-height: 100vh;
    position: relative;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
`;

const ContentArea3 = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center; 
    flex-grow: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
    
    /* ⭐️ 비율 유지를 위한 핵심: 수직 중앙 정렬 */
    justify-content: center; 
    padding-top: 0px; 
`;

const MainContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 0; 
    width: 100%;
`;


const QuestionText3 = styled.h2`
    font-size: 30px;
    font-weight: 700;
    color: #333333;
    margin-top: 0; 
    margin-bottom: 50px;
`;

const EmojiContainer3 = styled.div`
    width: 250px;
    height: 250px;
    margin-bottom: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
`;

const HomeEmoji = styled.span`
    font-size: 180px; /* IllustrationContainer3의 크기(250x250)에 맞춰 조절 */
    line-height: 1;
`;

const LocationInputContainer = styled.div`
    box-sizing: border-box;
    position: relative;
    width: 338px;
    height: 70px;
    background: #FFFFFF;
    border: 2px solid #2376C4;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px 0 25px;
    cursor: pointer;
    margin-bottom: 0px; 
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
    background: #B0CEEA;
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
    background-color: white;
    border: 1px solid #2376C4;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
    overflow: hidden;
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
        background-color: #F0F8FF;
    }
`;

const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 10px; 
    margin-top: 50px;
    padding-bottom: 0;
    width: 100%;
`;

const StyledPaginationDot = styled.div<{ $active: boolean }>`
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: ${props => (props.$active ? '#B0CEEA' : '#E0E0E0')};
    transition: background-color 0.3s;
`;


// =========================================================================
// React 컴포넌트 영역
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

        setTimeout(() => {
            onSetLocation(location);
        }, 500);
    };

    return (
        <DesktopContainer3>
            <Header />

            <ContentArea3>

                <MainContentWrapper>

                    <QuestionText3>어느 지역의 정책을 찾으시나요?</QuestionText3>

                    <EmojiContainer3>
                        <HomeEmoji role="img" aria-label="집 이모지">
                            🏠
                        </HomeEmoji>
                    </EmojiContainer3>

                    <LocationInputContainer
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <SelectedLocationText>{selectedLocation}</SelectedLocationText>

                        {/* 드롭다운 아이콘 */}
                        <DropdownIconArea>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M7 10l5 5 5-5z" fill="white"/>
                            </svg>
                        </DropdownIconArea>

                        {/* 드롭다운 메뉴 */}
                        {isDropdownOpen && (
                            <DropdownMenu>
                                {LOCATIONS.map(loc => (
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