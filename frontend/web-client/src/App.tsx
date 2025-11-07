import { Routes, Route, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import OnboardingRoutes from './features/onboarding/OnboardingRoutes'; // 이 부분 수정!

const BlogRoutes = lazy(() => import('@/features/blog/BlogRoutes'));
const AdminRoutes = lazy(() => import('@/features/admin/AdminRoutes'));

function App() {
    const navigate = useNavigate();
    const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

    useEffect(() => {
        const storedOnboardingStatus = localStorage.getItem('onboardingComplete');
        if (storedOnboardingStatus === 'true') {
            setIsOnboardingComplete(true);
        } else {
            setIsOnboardingComplete(false);
            if (!window.location.pathname.startsWith('/onboarding')) { // startsWith로 변경
                navigate('/onboarding/start'); // /start로 이동
            }
        }
    }, [navigate]);

    if (!isOnboardingComplete && !window.location.pathname.startsWith('/onboarding')) {
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
                {/* 온보딩 경로 - /* 추가해서 하위 경로 처리 */}
                <Route path="/onboarding/*" element={<OnboardingRoutes />} />

                {/* 관리자 경로 */}
                <Route path="/admin/*" element={<AdminRoutes />} />

                {/* 메인 경로 */}
                {isOnboardingComplete ? (
                    <Route path="/*" element={<BlogRoutes />} />
                ) : (
                    <Route path="/*" element={<OnboardingRoutes />} />
                )}
            </Routes>
        </Suspense>
    );
}

export default App;