import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../../features/auth/auth-context'
import { RequireAuth } from '../../../features/auth/require-auth'
import { clearSessionTokens, setSessionTokens } from '../../../features/auth/session'

const protectedRoutes = [
    { path: '/map', label: 'Map Screen' },
    { path: '/history', label: 'History Screen' },
    { path: '/gallery', label: 'Gallery Screen' },
    { path: '/community', label: 'Community Screen' },
    { path: '/profile', label: 'Profile Screen' },
]

const renderProtectedRoute = (initialRoute: string) => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                    <Route path="/auth" element={<div>Auth Screen</div>} />
                    <Route element={<RequireAuth />}>
                        {protectedRoutes.map((route) => (
                            <Route key={route.path} path={route.path} element={<div>{route.label}</div>} />
                        ))}
                    </Route>
                </Routes>
            </MemoryRouter>
        </AuthProvider>,
    )
}

describe('RequireAuth', () => {
    beforeEach(() => {
        localStorage.clear()
        clearSessionTokens()
    })

    it.each(protectedRoutes)('redirects to auth page when no session for $path', async ({ path }) => {
        renderProtectedRoute(path)

        expect(await screen.findByText('Auth Screen')).toBeInTheDocument()
    })

    it.each(protectedRoutes)('renders protected route when session exists for $path', async (route) => {
        setSessionTokens({
            accessToken: 'token',
            refreshToken: 'refresh',
            tokenType: 'bearer',
        })

        renderProtectedRoute(route.path)

        expect(await screen.findByText(route.label)).toBeInTheDocument()
    })
})
