import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../shared/api/http'
import { LoginStep } from '../../../features/auth/login-step'

const telegramLoginMock = vi.fn()

vi.mock('../../../features/auth/auth-api', () => ({
    getOtp: vi.fn(),
    telegramLogin: (...args: unknown[]) => telegramLoginMock(...args),
}))

vi.mock('../../../features/auth/telegram-login-button', () => ({
    TelegramLoginButton: ({ onAuth }: { onAuth: (data: Record<string, unknown>) => Promise<void> }) => (
        <button
            type="button"
            onClick={() =>
                void onAuth({
                    id: 1,
                    first_name: 'Tripmark',
                    auth_date: 1,
                    hash: 'invalid',
                })
            }
        >
            Telegram mock
        </button>
    ),
}))

describe('LoginStep', () => {
    beforeEach(() => {
        telegramLoginMock.mockReset()
    })

    it('localizes Telegram auth API errors', async () => {
        telegramLoginMock.mockRejectedValue(new ApiError(401, 'Invalid telegram hash'))

        render(<LoginStep onEmailSuccess={vi.fn()} onSocialSuccess={vi.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: 'Telegram mock' }))

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Unable to verify Telegram sign-in. Please try again.',
        )
    })
})
