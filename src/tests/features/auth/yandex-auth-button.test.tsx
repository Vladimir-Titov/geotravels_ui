import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { YandexAuthButton } from '../../../features/auth/yandex-auth-button'

vi.mock('../../../shared/config/env', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../shared/config/env')>()
    return {
        ...actual,
        YANDEX_CLIENT_ID: 'test-yandex-client',
        getYandexRedirectUri: () => 'http://localhost/yandex-auth-callback.html',
    }
})

type YandexAuthWindow = Window & {
    YaAuthSuggest?: {
        init: ReturnType<typeof vi.fn>
    }
}

describe('YandexAuthButton', () => {
    beforeEach(() => {
        document.head.innerHTML = ''
    })

    afterEach(() => {
        vi.restoreAllMocks()
        delete (window as YandexAuthWindow).YaAuthSuggest
    })

    it('loads the Yandex SDK in the background and shows a placeholder until ready', async () => {
        let resolveAuth: (data: { code: string }) => void = () => undefined
        const authPromise = new Promise<{ code: string }>((resolve) => {
            resolveAuth = resolve
        })
        const handler = vi.fn(() => authPromise)
        const onAuth = vi.fn()
        ;(window as YandexAuthWindow).YaAuthSuggest = {
            init: vi.fn().mockResolvedValue({ status: 'ok', handler }),
        }

        render(<YandexAuthButton loadingLabel="Yandex" onAuth={onAuth} />)

        expect(screen.getByRole('button', { name: 'Yandex' })).toBeDisabled()

        const script = await waitFor(() => {
            const element = document.head.querySelector('script')
            expect(element).toBeInTheDocument()
            return element as HTMLScriptElement
        })

        expect(script.src).toBe(
            'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js',
        )

        fireEvent.load(script)

        await waitFor(() => {
            expect((window as YandexAuthWindow).YaAuthSuggest?.init).toHaveBeenCalledWith(
                {
                    client_id: 'test-yandex-client',
                    response_type: 'code',
                    redirect_uri: 'http://localhost/yandex-auth-callback.html',
                },
                'http://localhost',
                expect.objectContaining({
                    view: 'button',
                    buttonView: 'main',
                    buttonTheme: 'light',
                }),
            )
        })
        expect(handler).toHaveBeenCalled()

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: 'Yandex' })).not.toBeInTheDocument()
        })

        resolveAuth({ code: 'code-from-yandex' })

        await waitFor(() => {
            expect(onAuth).toHaveBeenCalledWith({ code: 'code-from-yandex' })
        })
    })

    it('hides the optional button when the SDK script fails to load', async () => {
        const { container } = render(
            <YandexAuthButton loadingLabel="Yandex" onAuth={vi.fn()} />,
        )

        const script = await waitFor(() => {
            const element = document.head.querySelector('script')
            expect(element).toBeInTheDocument()
            return element as HTMLScriptElement
        })

        fireEvent.error(script)

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })
})
