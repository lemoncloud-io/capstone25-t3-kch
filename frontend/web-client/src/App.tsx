import { Routes, Route, useNavigate } from 'react-router-dom'; // useNavigate 추가
import { lazy, Suspense, useEffect, useState } from 'react'; // useEffect, useState 추가
import { Loader2 } from 'lucide-react';

import OnboardingContainer from './features/onboarding/OnboardingContainer';

const BlogRoutes = lazy(() => import('@/features/blog/BlogRoutes'));
const AdminRoutes = lazy(() => import('@/features/admin/AdminRoutes'));

function App() {
    const navigate = useNavigate(); // useNavigate 훅 사용
    const [isOnboardingComplete, setIsOnboardingComplete] = useState(false); // 온보딩 완료 여부 상태
    // 💡 실제 앱에서는 이 상태를 로컬 스토리지, Context API, Redux 등 전역 상태 관리로 대체해야 합니다.
    //    예시를 위해 useState를 사용했습니다.

    // 컴포넌트 마운트 시 또는 상태 변경 시 온보딩 완료 여부를 체크
    useEffect(() => {
        // 이 부분에서 실제 온보딩 완료 여부를 확인하는 로직을 구현합니다.
        // 예: localStorage.getItem('onboardingComplete') === 'true'
        // 현재는 단순히 'false'로 가정하여 온보딩 페이지로 리다이렉트되도록 합니다.
        // TODO: 실제 온보딩 완료 여부를 불러오는 로직으로 대체하세요.
        const storedOnboardingStatus = localStorage.getItem('onboardingComplete');
        if (storedOnboardingStatus === 'true') {
            setIsOnboardingComplete(true);
        } else {
            setIsOnboardingComplete(false);
            // 만약 현재 경로가 온보딩 페이지가 아니라면 온보딩 페이지로 리다이렉트
            if (window.location.pathname !== '/onboarding') {
                navigate('/onboarding');
            }
        }
    }, [navigate]); // navigate가 변경될 때마다 useEffect 재실행 (거의 없음)

    if (!isOnboardingComplete && window.location.pathname !== '/onboarding') {
        // 온보딩이 완료되지 않았고 현재 온보딩 페이지가 아니라면, 로딩 스피너를 보여주거나 null 반환
        // navigate는 useEffect 안에서 처리했으므로, 여기서는 렌더링을 막습니다.
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Redirecting to Onboarding...</span>
                </div>
            </div>
        );
    }


    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen">
                    <div className="flex items-center space-x-2">
                        <Loader2 className="animate-spin" size={24} />
                        <span>Loading...</span>
                    </div>
                </div>
            }
        >
            <Routes>
                {/* 온보딩 경로 */}
                <Route path="/onboarding" element={<OnboardingContainer />} />

                {/* 관리자 경로 */}
                <Route path="/admin/*" element={<AdminRoutes />} />

                {/* 메인 경로 - 온보딩이 완료되었을 때만 접근 가능하도록 */}
                {isOnboardingComplete ? (
                    <Route path="/*" element={<BlogRoutes />} />
                ) : (
                    // 온보딩이 완료되지 않았다면, 메인 경로로 접근 시 온보딩 페이지로 리다이렉트
                    // 이미 useEffect에서 처리했지만, 안전 장치로 한 번 더 명시
                    <Route path="/*" element={<OnboardingContainer />} />
                )}
            </Routes>
        </Suspense>
    );
}

export default App;