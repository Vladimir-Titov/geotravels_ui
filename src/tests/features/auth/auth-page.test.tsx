import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../../features/auth/auth-context'
import { AuthPage } from '../../../features/auth/auth-page'
import { clearSessionTokens } from '../../../features/auth/session'

const getOtpMock = vi.fn()
const confirmOtpMock = vi.fn()
const telegramLoginMock = vi.fn()

vi.mock('../../../features/auth/auth-api', () => ({
    getOtp: (...args: unknown[]) => getOtpMock(...args),
    confirmOtp: (...args: unknown[]) => confirmOtpMock(...args),
    telegramLogin: (...args: unknown[]) => telegramLoginMock(...args),
}))

function renderAuthPage() {
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
}

describe('AuthPage', () => {
    beforeEach(() => {
        getOtpMock.mockReset()
        confirmOtpMock.mockReset()
        telegramLoginMock.mockReset()
        localStorage.clear()
        clearSessionTokens()
    })

    it('requests OTP and shows OTP form', async () => {
        getOtpMock.mockResolvedValue({ otp_id: 'test-otp-uuid', message: 'OTP sent' })

        renderAuthPage()

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
        fireEvent.click(screen.getByRole('button', { name: /get code/i }))

        expect(await screen.findByText(/enter the code/i)).toBeInTheDocument()
        expect(getOtpMock).toHaveBeenCalledWith({ contact: 'test@example.com' })
    })

    it('authenticates and redirects to map after OTP verify', async () => {
        getOtpMock.mockResolvedValue({ otp_id: 'test-otp-uuid', message: 'OTP sent' })
        confirmOtpMock.mockResolvedValue({
            access_token: 'access',
            refresh_token: 'refresh',
            token_type: 'bearer',
        })

        renderAuthPage()

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
        fireEvent.click(screen.getByRole('button', { name: /get code/i }))

        await screen.findByText(/enter the code/i)

        const inputs = screen.getAllByRole('textbox')
        '654321'.split('').forEach((digit, i) => {
            fireEvent.change(inputs[i], { target: { value: digit } })
        })
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

        expect(await screen.findByText('Map Screen')).toBeInTheDocument()
        expect(confirmOtpMock).toHaveBeenCalledWith({ otp_id: 'test-otp-uuid', code: '654321' })
    })

    it('shows error when OTP request fails', async () => {
        getOtpMock.mockRejectedValue(new Error('Too many requests'))

        renderAuthPage()

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
        fireEvent.click(screen.getByRole('button', { name: /get code/i }))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument()
        })
        expect(screen.queryByText(/enter the code/i)).not.toBeInTheDocument()
    })

    it('back button returns to email step', async () => {
        getOtpMock.mockResolvedValue({ otp_id: 'test-otp-uuid', message: 'OTP sent' })

        renderAuthPage()

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
        fireEvent.click(screen.getByRole('button', { name: /get code/i }))

        await screen.findByText(/enter the code/i)

        fireEvent.click(screen.getByRole('button', { name: /back/i }))

        expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })
})
