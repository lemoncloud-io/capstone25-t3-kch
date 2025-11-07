// src/App.js

import React, { useState, useEffect } from 'react';
import Onboarding from './Onboarding'; // 새로 만든 온보딩 컴포넌트 임포트
import './App.css'; // 기본 CSS는 그대로 두셔도 됩니다.

// 임시 메인 화면 컴포넌트 (온보딩 완료 후 보여줄 화면)
const MainScreen = ({ interest }) => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>🎉 K-Coding Hansung 메인 화면</h1>
      {interest ? (
        <p>환영합니다! 당신의 관심사: **{interest}**를 중심으로 정보를 제공합니다.</p>
      ) : (
        <p>환영합니다! 온보딩을 건너뛰셨습니다. 모든 정보를 탐색해 보세요.</p>
      )}
      <p style={{ marginTop: '20px', color: '#888' }}>
        (이곳이 원래 보여주신 블로그 메인 화면입니다.)
      </p>
    </div>
  );
};


function App() {
  // 실제 앱에서는 localStorage 등을 사용해 영구적으로 상태를 저장해야 합니다.
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [userInterest, setUserInterest] = useState(null);

  // 온보딩 완료 처리 함수
  const handleOnboardingFinish = (interest) => {
    // 실제 배포 시에는 여기에 localStorage.setItem('hasSeenOnboarding', 'true'); 추가
    setUserInterest(interest); // 사용자의 관심사를 상태에 저장
    setIsFirstLaunch(false); // 온보딩 완료 처리
    console.log("온보딩 완료! 선택된 관심사:", interest);
  };

  if (isFirstLaunch) {
    // isFirstLaunch가 true일 때만 온보딩 화면을 보여줌
    return <Onboarding onFinish={handleOnboardingFinish} />;
  }

  // 온보딩 완료 후 메인 화면을 보여줌
  return <MainScreen interest={userInterest} />;
}

export default App;