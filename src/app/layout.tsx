import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { PageContainer, TopNavigation } from '../shared/ui'
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

            <footer className="app-shell__footer">
                <PageContainer>
                    <p>Tripmark ©2026 — Сохраняй свои экспедиции</p>
                </PageContainer>
            </footer>
        </div>
    )
}
