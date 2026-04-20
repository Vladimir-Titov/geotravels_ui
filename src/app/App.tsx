import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout'
import { AuthPage, RequireAuth, TelegramAppPage, useAuth } from '../features/auth'
import { MyTravelsPage, MyTravelsPlaceholderPage } from '../features/my-travels'

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
                <Route element={<AppLayout />}>
                    <Route path="/my-travels" element={<MyTravelsPage />} />
                    <Route
                        path="/my-travels/add-story"
                        element={
                            <MyTravelsPlaceholderPage
                                title="Add story flow is in progress"
                                subtitle="Placeholder"
                            />
                        }
                    />
                    <Route
                        path="/my-travels/upload-photos"
                        element={
                            <MyTravelsPlaceholderPage
                                title="Upload photos flow is in progress"
                                subtitle="Placeholder"
                            />
                        }
                    />
                    <Route
                        path="/my-travels/share-card"
                        element={
                            <MyTravelsPlaceholderPage
                                title="Share-card flow is in progress"
                                subtitle="Placeholder"
                            />
                        }
                    />
                    <Route
                        path="/my-travels/achievement"
                        element={
                            <MyTravelsPlaceholderPage
                                title="Achievement center is in progress"
                                subtitle="Placeholder"
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
