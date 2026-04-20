import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Sentry from '@sentry/browser'
import { useAuth } from './auth-context'
import { telegramAppLogin } from './auth-api'

type TelegramWindow = Window & {
    Telegram?: { WebApp?: { initData?: string; version?: string; platform?: string } }
}

const waitForInitData = (): Promise<string> =>
    new Promise((resolve) => {
        const deadline = Date.now() + 3000
        const check = () => {
            const data = (window as TelegramWindow).Telegram?.WebApp?.initData
            if (data) return resolve(data)
            if (Date.now() >= deadline) return resolve('')
            setTimeout(check, 50)
        }
        check()
    })

export const TelegramAppPage = () => {
    const { onAuthSuccess } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        waitForInitData().then((initData) => {
            const tg = (window as TelegramWindow).Telegram?.WebApp

            Sentry.addBreadcrumb({
                category: 'tg-app',
                message: 'TelegramAppPage mounted',
                data: {
                    hasTelegram: Boolean((window as TelegramWindow).Telegram),
                    hasWebApp: Boolean(tg),
                    hasInitData: Boolean(initData),
                    initDataLength: initData.length,
                    platform: tg?.platform,
                },
                level: 'info',
            })

            if (!initData) {
                Sentry.captureMessage('tg-app: initData unavailable after 3s, redirecting to /auth', 'warning')
                navigate('/auth', { replace: true })
                return
            }

            telegramAppLogin(initData)
                .then((tokens) => {
                    onAuthSuccess({
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        tokenType: tokens.token_type,
                    })
                    navigate('/my-travels', { replace: true })
                })
                .catch((err) => {
                    Sentry.captureException(err, { tags: { context: 'tg-app-login' } })
                    navigate('/auth', { replace: true })
                })
        })
    }, [navigate, onAuthSuccess])

    return null
}
