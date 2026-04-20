import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { useMyTravelsDashboard } from '../features/my-travels'
import { PageContainer, TopNavigation } from '../shared/ui'
import './layout.css'

export const AppLayout = () => {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { data } = useMyTravelsDashboard()

    const signOut = (): void => {
        logout()
        navigate('/auth', { replace: true })
    }

    return (
        <div className="app-shell">
            <TopNavigation
                onSignOut={signOut}
                unreadInboxCount={data?.user.unreadInboxCount}
                userFullName={data?.user.fullName}
            />

            <main className="app-shell__content">
                <PageContainer>
                    <Outlet />
                </PageContainer>
            </main>
        </div>
    )
}
