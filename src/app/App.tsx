import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout'
import { AuthPage, RequireAuth, TelegramAppPage, useAuth } from '../features/auth'
import {
    MyTravelsDashboardProvider,
    MyTravelsPage,
    MyTravelsPlaceholderPage,
} from '../features/my-travels'

const RootRedirect = () => {
    const { isAuthenticated } = useAuth()
    return <Navigate replace to={isAuthenticated ? '/my-travels' : '/auth'} />
}

const App = () => {
    return (
        <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/tg-app" element={<TelegramAppPage />} />

            <Route element={<RequireAuth />}>
                <Route
                    element={
                        <MyTravelsDashboardProvider>
                            <AppLayout />
                        </MyTravelsDashboardProvider>
                    }
                >
                    <Route path="/my-travels" element={<MyTravelsPage />} />
                    <Route
                        path="/my-travels/add-story"
                        element={
                            <MyTravelsPlaceholderPage
                                titleKey="placeholder.addStory"
                                subtitleKey="placeholder.subtitle"
                            />
                        }
                    />
                    <Route
                        path="/my-travels/upload-photos"
                        element={
                            <MyTravelsPlaceholderPage
                                titleKey="placeholder.uploadPhotos"
                                subtitleKey="placeholder.subtitle"
                            />
                        }
                    />
                    <Route
                        path="/my-travels/share-card"
                        element={
                            <MyTravelsPlaceholderPage
                                titleKey="placeholder.shareCard"
                                subtitleKey="placeholder.subtitle"
                            />
                        }
                    />
                    <Route
                        path="/my-travels/achievement"
                        element={
                            <MyTravelsPlaceholderPage
                                titleKey="placeholder.achievement"
                                subtitleKey="placeholder.subtitle"
                            />
                        }
                    />
                </Route>
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
        </Routes>
    )
}

export default App
