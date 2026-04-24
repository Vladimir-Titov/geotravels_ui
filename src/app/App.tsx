import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout'
import { AuthPage, RequireAuth, TelegramAppPage, useAuth } from '../features/auth'
import { PlansPage, StatisticsPage, TripDetailPage, VisitsPage } from '../features/trips'

const RootRedirect = () => {
    const { isAuthenticated } = useAuth()
    return <Navigate replace to={isAuthenticated ? '/visits' : '/auth'} />
}

const App = () => {
    return (
        <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/tg-app" element={<TelegramAppPage />} />

            <Route element={<RequireAuth />}>
                <Route element={<AppLayout />}>
                    <Route path="/visits" element={<VisitsPage />} />
                    <Route path="/plans" element={<PlansPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/trips/:visitId" element={<TripDetailPage />} />
                </Route>
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
        </Routes>
    )
}

export default App
