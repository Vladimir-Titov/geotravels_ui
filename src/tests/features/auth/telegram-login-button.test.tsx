import { fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TelegramLoginButton } from '../../../features/auth/telegram-login-button'

vi.mock('../../../shared/config/env', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../shared/config/env')>()
    return {
        ...actual,
        TELEGRAM_BOT_NAME: 'tripmark_bot',
    }
})

type TelegramAuthWindow = Window & {
    __tgOnAuth?: (user: {
        id: number
        first_name: string
        auth_date: number
        hash: string
    }) => void
}

describe('TelegramLoginButton', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('loads the Telegram widget in the background and reveals it only when ready', async () => {
        const onAuth = vi.fn()
        const { container } = render(<TelegramLoginButton onAuth={onAuth} />)

        const widget = container.querySelector('.tg-login-widget') as HTMLDivElement
        expect(widget).toBeInTheDocument()
        expect(widget).toHaveAttribute('aria-hidden', 'true')

        const script = await waitFor(() => {
            const element = widget.querySelector('script')
            expect(element).toBeInTheDocument()
            return element as HTMLScriptElement
        })

        expect(script.src).toBe('https://telegram.org/js/telegram-widget.js?22')
        expect(script).toHaveAttribute('data-telegram-login', 'tripmark_bot')

        widget.appendChild(document.createElement('iframe'))

        await waitFor(() => {
            expect(widget).toHaveClass('tg-login-widget--ready')
        })
        expect(widget).toHaveAttribute('aria-hidden', 'false')
    })

    it('hides the optional widget when Telegram script loading fails', async () => {
        const { container } = render(<TelegramLoginButton onAuth={vi.fn()} />)

        const script = await waitFor(() => {
            const element = container.querySelector('script')
            expect(element).toBeInTheDocument()
            return element as HTMLScriptElement
        })

        fireEvent.error(script)

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })

    it('keeps the auth callback available while the widget is loading', async () => {
        const onAuth = vi.fn()
        render(<TelegramLoginButton onAuth={onAuth} />)

        await waitFor(() => {
            expect((window as TelegramAuthWindow).__tgOnAuth).toBeInstanceOf(Function)
        })

        ;(window as TelegramAuthWindow).__tgOnAuth?.({
            id: 1,
            first_name: 'Tripmark',
            auth_date: 1,
            hash: 'hash',
        })

        expect(onAuth).toHaveBeenCalledWith({
            id: 1,
            first_name: 'Tripmark',
            auth_date: 1,
            hash: 'hash',
        })
    })
})
