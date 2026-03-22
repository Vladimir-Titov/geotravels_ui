import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout'
import { AuthPage, RequireAuth, useAuth } from '../features/auth'
import { MapPage } from '../features/map'
import { HistoryPage } from '../features/visits'
import { GalleryPage } from '../features/gallery'
import { CommunityPage } from '../features/community'
import { ProfilePage } from '../features/profile'

const RootRedirect = () => {
    const { isAuthenticated } = useAuth()
    return <Navigate replace to={isAuthenticated ? '/map' : '/auth'} />
}

const App = () => {
    return (
        <Routes>
            <Route path="/auth" element={<AuthPage />} />

            <Route element={<RequireAuth />}>
                <Route element={<AppLayout />}>
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
        </Routes>
    )
}

export default App
