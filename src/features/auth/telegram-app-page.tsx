import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Sentry from '@sentry/browser'
import { useAuth } from './auth-context'
import { telegramAppLogin } from './auth-api'

type TelegramWindow = Window & {
    Telegram?: { WebApp?: { initData?: string; version?: string; platform?: string } }
}

// DEBUG: remove after investigation
interface DebugInfo {
    hasTelegram: boolean
    hasWebApp: boolean
    initDataLength: number
    initDataPreview: string
    version: string
    platform: string
}

const collectDebugInfo = (): DebugInfo => {
    const tg = (window as TelegramWindow).Telegram?.WebApp
    const initData = tg?.initData ?? ''
    return {
        hasTelegram: Boolean((window as TelegramWindow).Telegram),
        hasWebApp: Boolean(tg),
        initDataLength: initData.length,
        initDataPreview: initData.slice(0, 60) || '(empty)',
        version: tg?.version ?? '—',
        platform: tg?.platform ?? '—',
    }
}

export const TelegramAppPage = () => {
    const { onAuthSuccess } = useAuth()
    const navigate = useNavigate()
    const [debug] = useState<DebugInfo>(collectDebugInfo)

    useEffect(() => {
        const tg = (window as TelegramWindow).Telegram?.WebApp
        const initData = tg?.initData ?? ''

        Sentry.addBreadcrumb({
            category: 'tg-app',
            message: 'TelegramAppPage mounted',
            data: debug,
            level: 'info',
        })

        if (!initData) {
            Sentry.captureMessage('tg-app: initData unavailable, redirecting to /auth', 'warning')
            // DEBUG: задержка 8 секунд чтобы увидеть дебаг-панель
            setTimeout(() => navigate('/auth', { replace: true }), 8000)
            return
        }

        Sentry.addBreadcrumb({
            category: 'tg-app',
            message: 'Sending initData to backend',
            level: 'info',
        })

        telegramAppLogin(initData)
            .then((tokens) => {
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
    }, [debug, navigate, onAuthSuccess])

    if (!debug) return null

    return (
        <div style={{
            fontFamily: 'monospace',
            fontSize: 13,
            padding: 16,
            background: '#1a1a2e',
            color: '#e0e0e0',
            minHeight: '100dvh',
        }}>
            <div style={{ color: '#f9ca24', marginBottom: 12, fontWeight: 'bold' }}>
                🔍 TG Mini App Debug
            </div>
            {Object.entries(debug).map(([key, val]) => (
                <div key={key} style={{ marginBottom: 6 }}>
                    <span style={{ color: '#6c8ebf' }}>{key}: </span>
                    <span style={{ color: String(val).startsWith('(') ? '#e55' : '#7bed9f' }}>
                        {String(val)}
                    </span>
                </div>
            ))}
            <div style={{ marginTop: 16, color: '#888' }}>
                {debug.initDataLength === 0
                    ? '⚠ initData пуст — редирект через 8 сек'
                    : '⏳ отправляем на бекенд...'}
            </div>
        </div>
    )
}
