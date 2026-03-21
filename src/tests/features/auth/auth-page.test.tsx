import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../../features/auth/auth-context'
import { AuthPage } from '../../../features/auth/auth-page'
import { clearSessionTokens } from '../../../features/auth/session'

const loginUserMock = vi.fn()
const registerUserMock = vi.fn()

vi.mock('../../../features/auth/auth-api', () => ({
    loginUser: (...args: unknown[]) => loginUserMock(...args),
    registerUser: (...args: unknown[]) => registerUserMock(...args),
}))

describe('AuthPage', () => {
    beforeEach(() => {
        loginUserMock.mockReset()
        registerUserMock.mockReset()
        localStorage.clear()
        clearSessionTokens()
    })

    it('authenticates and redirects to map', async () => {
        loginUserMock.mockResolvedValue({
            access_token: 'access',
            refresh_token: 'refresh',
            token_type: 'bearer',
        })

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/auth']}>
                    <Routes>
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/map" element={<div>Map Screen</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        )

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } })
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

        expect(await screen.findByText('Map Screen')).toBeInTheDocument()
        expect(loginUserMock).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'secret123',
        })
    })

    it('validates password confirmation before registering', async () => {
        registerUserMock.mockResolvedValue({
            access_token: 'access',
            refresh_token: 'refresh',
            token_type: 'bearer',
        })

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/auth']}>
                    <Routes>
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/map" element={<div>Map Screen</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Switch to registration form' }))
        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'traveler@example.com' },
        })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } })
        fireEvent.change(screen.getByLabelText('Confirm password'), {
            target: { value: 'secret456' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

        expect(await screen.findByText('Passwords must match.')).toBeInTheDocument()
        expect(registerUserMock).not.toHaveBeenCalled()

        fireEvent.change(screen.getByLabelText('Confirm password'), {
            target: { value: 'secret123' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

        expect(await screen.findByText('Map Screen')).toBeInTheDocument()
        expect(registerUserMock).toHaveBeenCalledWith({
            email: 'traveler@example.com',
            password: 'secret123',
        })
    })
})
