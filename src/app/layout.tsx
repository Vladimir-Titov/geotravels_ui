import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { BottomNavigation, PageContainer, TopNavigation } from '../shared/ui'
import './layout.css'

export const AppLayout = () => {
    const navigate = useNavigate()
    const { logout } = useAuth()

    const signOut = (): void => {
        logout()
        navigate('/auth', { replace: true })
    }

    return (
        <div className="app-shell">
            <TopNavigation onSignOut={signOut} />

            <main className="app-shell__content">
                <PageContainer>
                    <Outlet />
                </PageContainer>
            </main>

            <BottomNavigation />
        </div>
    )
}
