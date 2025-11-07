// Onboarding.jsx

import React, { useState } from 'react';
import './Onboarding.css'; // 스타일 파일 임포트 (아래 CSS 참조)

// -------------------------------------------------------------------
// 1. 데이터 정의 (5가지 핵심 카테고리)
// -------------------------------------------------------------------
const CATEGORIES = [
  { id: 'job', name: '일자리', emoji: '💼' },
  { id: 'housing', name: '주거', emoji: '🏠' },
  { id: 'edu', name: '교육', emoji: '📚' },
  { id: 'welfare', name: '복지문화', emoji: '🎗️' },
  { id: 'rights', name: '참여권리', emoji: '⚖️' },
];

// -------------------------------------------------------------------
// 2. 메인 온보딩 컴포넌트
// -------------------------------------------------------------------
const Onboarding = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');

  // 사용자가 관심사를 선택할 때 호출되는 함수
  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
  };

  // 다음 단계로 이동 (2단계에서만 관심사 저장 로직 포함)
  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // 3단계 완료 후 메인 화면으로 이동 (관심사 데이터 전달)
      onFinish(selectedCategory);
    }
  };

  // 건너뛰기 처리 (선택된 관심사 없이 바로 완료)
  const skipOnboarding = () => {
    onFinish(null); 
  };
  
  // 현재 단계에 따른 콘텐츠 렌더링
  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-page step-1">
            <h2>✨ 막막했던 청년 정책, 한눈에 해결하세요.</h2>
            <p>취업, 주거, 복지... 복잡한 5가지 분야별 필수 정보를 요약하여 제공합니다.</p>
            <button className="primary-button" onClick={nextStep}>다음</button>
          </div>
        );
      case 2:
        return (
          <div className="onboarding-page step-2">
            <h2>🤔 지금, 가장 먼저 알고 싶은 정보는 무엇인가요?</h2>
            <div className="category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`category-button ${selectedCategory === cat.id ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
            <button 
              className="primary-button" 
              onClick={nextStep}
              disabled={!selectedCategory} // 관심사를 선택해야 다음 버튼 활성화
            >
              선택 완료
            </button>
          </div>
        );
      case 3:
        const catName = CATEGORIES.find(c => c.id === selectedCategory)?.name || '주요';
        return (
          <div className="onboarding-page step-3">
            <h2>🎉 준비 완료! 맞춤 정보를 탐색해 보세요.</h2>
            <p>선택하신 **{catName}** 관련 최신 정보가 당신을 기다립니다.</p>
            <button className="primary-button start-button" onClick={nextStep}>
              지금 정보 보기
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      {/* 건너뛰기 버튼 */}
      <button className="skip-button" onClick={skipOnboarding}>건너뛰기</button>
      
      {/* 콘텐츠 영역 */}
      {renderContent()}

      {/* 페이지 인디케이터 */}
      <div className="page-indicator">
        {[1, 2, 3].map(i => (
          <span key={i} className={`dot ${i === step ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;

// -------------------------------------------------------------------
// 3. 사용 예시 (App.jsx)
// -------------------------------------------------------------------

/*
// App.jsx 파일 예시

import React, { useState, useEffect } from 'react';
import Onboarding from './Onboarding';
import MainScreen from './MainScreen'; // 메인 화면 컴포넌트

function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [userInterest, setUserInterest] = useState(null);

  // 실제 앱에서는 localStorage나 Context API로 isFirstLaunch 상태를 관리해야 함
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding === 'true') {
      setIsFirstLaunch(false);
    }
  }, []);

  const handleOnboardingFinish = (interest) => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setUserInterest(interest); // 사용자의 관심사를 상태에 저장
    setIsFirstLaunch(false); // 온보딩 완료 처리
  };

  if (isFirstLaunch) {
    return <Onboarding onFinish={handleOnboardingFinish} />;
  }

  // userInterest 상태를 MainScreen에 전달하여 맞춤 정보를 보여줄 수 있음
  return <MainScreen interest={userInterest} />;
}

export default App;

*/