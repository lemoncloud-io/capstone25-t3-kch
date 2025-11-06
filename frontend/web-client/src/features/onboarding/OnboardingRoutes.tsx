import { Routes, Route, Navigate } from 'react-router-dom'
import StartPage from './pages/StartPage'
import StatusPage from './pages/StatusPage'
import AgePage from './pages/AgePage'
import RegionPage from './pages/RegionPage'
import InterestPage from './pages/InterestPage'

function OnboardingRoutes() {
    return (
        <Routes>
            <Route path="/start" element={<StartPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/age" element={<AgePage />} />
            <Route path="/region" element={<RegionPage />} />
            <Route path="/interest" element={<InterestPage />} />
            <Route path="/" element={<Navigate to="/start" replace />} />
        </Routes>
    )
}

export default OnboardingRoutes

