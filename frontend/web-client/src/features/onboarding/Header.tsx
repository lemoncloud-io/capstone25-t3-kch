// src/shared/components/Header.tsx (Header.css와 Header.tsx 통합)

import React from 'react';
import styled from 'styled-components'; 

// =========================================================================
// CSS-in-JS (styled-components) 영역
// =========================================================================

const HeaderFrame = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 25px;
    width: fit-content;
    height: auto; 
    margin: 0; 
    padding: 26px 30px 18px 30px; 
    font-size: 40px;
    font-weight: 600;
`;

const HeaderTitle = styled.span`
    /* 기존 CSS에 없던 타이틀 텍스트에 대한 스타일을 추가할 수 있습니다. */
    /* 현재는 HeaderFrame의 font-size, font-weight를 상속받습니다. */
    /* 만약 폰트 색상을 지정하고 싶다면: color: #000000; */
`;

const HeaderLine = styled.div`
    width: 100%;
    height: 0px;
    border-bottom: 5px solid #B0CEEA;
    /* width: 100%; */
`;

// =========================================================================
// React 컴포넌트 영역
// =========================================================================

const Header: React.FC = () => {
    return (
        <>
            <HeaderFrame>
                <img 
                    src="/KCodingHansung_logo.png" 
                    alt="K-Coding Hansung Logo" 
                    width="112" 
                    height="108" 
                />
                <HeaderTitle>K-Coding Hansung</HeaderTitle> 
            </HeaderFrame>
            <HeaderLine />
        </>
    );
};

export default Header;