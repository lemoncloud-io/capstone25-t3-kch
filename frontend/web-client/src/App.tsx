import { Routes, Route } from 'react-router-dom'
import OnboardingRoutes from '@/features/onboarding/OnboardingRoutes'

function App() {
    return (
        <Routes>
            <Route path="/*" element={<OnboardingRoutes />} />
        </Routes>
    )
}

export default App
