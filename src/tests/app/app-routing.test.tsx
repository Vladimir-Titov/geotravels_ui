import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../../app/App'
import { AuthProvider } from '../../features/auth'
import { clearSessionTokens, setSessionTokens } from '../../features/auth/session'

vi.mock('../../features/trips', () => ({
    PlansPage: () => <div>Plans Page</div>,
    StatisticsPage: () => <div>Statistics Page</div>,
    TripDetailPage: () => <div>Trip Detail Page</div>,
    VisitsPage: () => <div>Visits Page</div>,
}))

describe('app routing', () => {
    beforeEach(() => {
        localStorage.clear()
        clearSessionTokens()
    })

    it('redirects authenticated root route to visits', async () => {
        setSessionTokens({
            accessToken: 'access',
            refreshToken: 'refresh',
            tokenType: 'bearer',
        })

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/']}>
                    <App />
                </MemoryRouter>
            </AuthProvider>,
        )

        expect(await screen.findByText('Visits Page')).toBeInTheDocument()
    })
})
