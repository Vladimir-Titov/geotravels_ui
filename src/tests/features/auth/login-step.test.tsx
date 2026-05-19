import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../shared/api/http'
import { LoginStep } from '../../../features/auth/login-step'

const telegramLoginMock = vi.fn()
const yandexLoginMock = vi.fn()

vi.mock('../../../features/auth/auth-api', () => ({
    getOtp: vi.fn(),
    telegramLogin: (...args: unknown[]) => telegramLoginMock(...args),
    yandexLogin: (...args: unknown[]) => yandexLoginMock(...args),
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

vi.mock('../../../features/auth/yandex-auth-button', () => ({
    YandexAuthButton: ({ onAuth }: { onAuth: (data: Record<string, unknown>) => Promise<void> }) => (
        <>
            <button type="button" onClick={() => void onAuth({ code: 'yandex-code' })}>
                Yandex mock
            </button>
            <button type="button" onClick={() => void onAuth({})}>
                Yandex empty mock
            </button>
        </>
    ),
}))

describe('LoginStep', () => {
    beforeEach(() => {
        telegramLoginMock.mockReset()
        yandexLoginMock.mockReset()
    })

    it('localizes Telegram auth API errors', async () => {
        telegramLoginMock.mockRejectedValue(new ApiError(401, 'Invalid telegram hash'))

        render(<LoginStep onEmailSuccess={vi.fn()} onSocialSuccess={vi.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: 'Telegram mock' }))

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Unable to verify Telegram sign-in. Please try again.',
        )
    })

    it('sends Yandex authorization code to the backend', async () => {
        yandexLoginMock.mockResolvedValue({
            access_token: 'access',
            refresh_token: 'refresh',
            token_type: 'bearer',
        })
        const onSocialSuccess = vi.fn()

        render(<LoginStep onEmailSuccess={vi.fn()} onSocialSuccess={onSocialSuccess} />)

        fireEvent.click(screen.getByRole('button', { name: 'Yandex mock' }))

        await screen.findByRole('button', { name: 'Yandex mock' })

        expect(yandexLoginMock).toHaveBeenCalledWith({
            code: 'yandex-code',
            redirect_uri: 'http://localhost:3000/yandex-auth-callback.html',
        })
        expect(onSocialSuccess).toHaveBeenCalledWith({
            access_token: 'access',
            refresh_token: 'refresh',
            token_type: 'bearer',
        })
    })

    it('localizes missing Yandex authorization code', async () => {
        vi.mocked(yandexLoginMock).mockReset()

        render(<LoginStep onEmailSuccess={vi.fn()} onSocialSuccess={vi.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: 'Yandex empty mock' }))

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Unable to verify Yandex sign-in. Please try again.',
        )
        expect(yandexLoginMock).not.toHaveBeenCalled()
    })
})
