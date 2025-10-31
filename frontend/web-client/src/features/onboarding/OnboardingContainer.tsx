// src/features/onboarding/OnboardingContainer.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Desktop1 from './Desktop1';
import Desktop2 from './Desktop2';
import Desktop3 from './Desktop3';
import Desktop4 from './Desktop4';
import Desktop5 from './Desktop5';

// -----------------------------------------------------------
// 1. 타입 정의
// -----------------------------------------------------------

type Step = 1 | 2 | 3 | 4 | 5; // 온보딩 단계 (Desktop1 ~ Desktop5)

interface OnboardingData {
  status: '대학생' | '취업준비생' | null;
  location: string | null;
  interests: string[];
}

// -----------------------------------------------------------
// 2. 메인 컨테이너 컴포넌트
// -----------------------------------------------------------

const OnboardingContainer: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [data, setData] = useState<OnboardingData>({
    status: null,
    location: null,
    interests: [],
  });

  useEffect(() => {
    console.log("Onboarding Data Updated:", data);
  }, [data]);

  useEffect(() => {
    console.log("Current Step:", currentStep);
  }, [currentStep]);

  const goToNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => (prev + 1) as Step);
    } else {
      console.log("온보딩 완료 처리 시작!");
      console.log("최종 수집된 데이터:", data);

      // ⭐️ 여기서 키 이름을 'onboardingComplete'로 수정합니다.
      localStorage.setItem('onboardingComplete', 'true');
      window.dispatchEvent(new Event('onboardingComplete')); // 이 이벤트는 App.tsx에서 사용되지 않으므로, 필수는 아닙니다.

      if (data.interests.length > 0) {
        const selectedCategorySlug = data.interests[0];
        console.log("선택된 카테고리 슬러그:", selectedCategorySlug);
        navigate(`/category/${selectedCategorySlug}`);
      } else {
        console.log("관심사가 선택되지 않았거나 비어있어서 홈으로 리다이렉트합니다.");
        navigate('/');
      }
    }
  };

  const handleStart = () => {
    goToNextStep();
  };

  const handleSelectStatus = (status: '대학생' | '취업준비생') => {
    setData(prev => ({ ...prev, status }));
    goToNextStep();
  };

  const handleSetLocation = (location: string) => {
    setData(prev => ({ ...prev, location }));
    goToNextStep();
  };

  const handleSelectInterests = (interests: string[]) => {
    console.log("Desktop4에서 선택된 관심사 (slug):", interests);
    setData(prev => ({ ...prev, interests }));
    goToNextStep();
  };

  const handleLoadingComplete = () => {
    console.log("Desktop5 로딩 완료, 최종 goToNextStep 호출");
    goToNextStep();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Desktop1 onStart={handleStart} />;
      case 2:
        return <Desktop2 onSelectStatus={handleSelectStatus} />;
      case 3:
        return <Desktop3 onSetLocation={handleSetLocation} />;
      case 4:
        return <Desktop4 onSelectInterests={handleSelectInterests} />;
      case 5:
        return <Desktop5 onLoadingComplete={handleLoadingComplete} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      {renderCurrentStep()}
    </div>
  );
};

export default OnboardingContainer;