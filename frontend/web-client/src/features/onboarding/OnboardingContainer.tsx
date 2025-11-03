// src/features/onboarding/OnboardingContainer.tsx

import React, { useState, useEffect, useCallback } from 'react'; // 🌟 useCallback import 추가
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

            localStorage.setItem('onboardingComplete', 'true');
            window.dispatchEvent(new Event('onboardingComplete')); 

            // 🌟 수정된 부분: 로딩(Desktop5) 완료 후 무조건 메인 페이지('/')로 리다이렉션
            console.log("온보딩 완료 후 메인 페이지로 이동합니다.");
            navigate('/'); 
        }
    };
    
    // 🌟 추가: 뒤로가기 로직 구현
    const goToPrevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => (prev - 1) as Step);
        }
    }, [currentStep]);


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
                // 🌟 Desktop2에는 뒤로가기 버튼이 필요하지만, 현재 Desktop1에서는 시작 버튼만 있으므로 필요하면 나중에 추가합니다.
                // onGoBack={goToPrevStep}
                return <Desktop2 onSelectStatus={handleSelectStatus} />; 
            case 3:
                // 🌟 onGoBack 프롭 전달
                return <Desktop3 
                    onSetLocation={handleSetLocation} 
                    onGoBack={goToPrevStep}
                />;
            case 4:
                // 🌟 onGoBack 프롭 전달
                return <Desktop4 
                    onSelectInterests={handleSelectInterests} 
                    onGoBack={goToPrevStep}
                />;
            case 5:
                // Desktop5 (로딩 화면)에서는 뒤로가기가 비활성화됩니다.
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