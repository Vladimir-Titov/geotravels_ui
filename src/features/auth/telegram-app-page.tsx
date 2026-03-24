import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Sentry from '@sentry/browser'
import { useAuth } from './auth-context'
import { telegramAppLogin } from './auth-api'

type TelegramWindow = Window & {
    Telegram?: { WebApp?: { initData?: string; version?: string; platform?: string } }
}

export const TelegramAppPage = () => {
    const { onAuthSuccess } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const tg = (window as TelegramWindow).Telegram?.WebApp
        const initData = tg?.initData

        Sentry.addBreadcrumb({
            category: 'tg-app',
            message: 'TelegramAppPage mounted',
            data: {
                hasTelegram: Boolean((window as TelegramWindow).Telegram),
                hasWebApp: Boolean(tg),
                hasInitData: Boolean(initData),
                initDataLength: initData?.length ?? 0,
                webAppVersion: tg?.version,
                platform: tg?.platform,
            },
            level: 'info',
        })

        if (!initData) {
            Sentry.captureMessage('tg-app: initData unavailable, redirecting to /auth', 'warning')
            navigate('/auth', { replace: true })
            return
        }

        Sentry.addBreadcrumb({
            category: 'tg-app',
            message: 'Sending initData to backend',
            level: 'info',
        })

        telegramAppLogin(initData)
            .then((tokens) => {
                Sentry.addBreadcrumb({
                    category: 'tg-app',
                    message: 'Auth successful, redirecting to /map',
                    level: 'info',
                })
                onAuthSuccess({
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    tokenType: tokens.token_type,
                })
                navigate('/map', { replace: true })
            })
            .catch((err) => {
                Sentry.captureException(err, { tags: { context: 'tg-app-login' } })
                navigate('/auth', { replace: true })
            })
    }, [])

    return null
}
