const DEFAULT_API_BASE_URL = 'http://localhost:8000'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = (configuredApiBaseUrl?.trim() || DEFAULT_API_BASE_URL).replace(
    /\/+$/,
    '',
)

export const TELEGRAM_BOT_NAME = import.meta.env.VITE_TELEGRAM_BOT_NAME ?? ''

export const YANDEX_CLIENT_ID = import.meta.env.VITE_YANDEX_CLIENT_ID ?? ''

export const configuredYandexRedirectUri = import.meta.env.VITE_YANDEX_REDIRECT_URI ?? ''

export const getYandexRedirectUri = (): string => {
    const configuredRedirectUri = configuredYandexRedirectUri.trim()

    if (configuredRedirectUri.length > 0) {
        return configuredRedirectUri
    }

    if (typeof window === 'undefined') {
        return ''
    }

    return `${window.location.origin}/yandex-auth-callback.html`
}

export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN ?? ''

export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT ?? 'local'

export const APP_VERSION: string = __APP_VERSION__

export const USE_DASHBOARD_MOCK = import.meta.env.VITE_USE_DASHBOARD_MOCK === 'true'
