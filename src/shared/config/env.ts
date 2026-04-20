const DEFAULT_API_BASE_URL = 'http://localhost:8000'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = (configuredApiBaseUrl?.trim() || DEFAULT_API_BASE_URL).replace(
    /\/+$/,
    '',
)

export const TELEGRAM_BOT_NAME = import.meta.env.VITE_TELEGRAM_BOT_NAME ?? ''

export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN ?? ''

export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT ?? 'local'

export const APP_VERSION: string = __APP_VERSION__

export const USE_DASHBOARD_MOCK = import.meta.env.VITE_USE_DASHBOARD_MOCK === 'true'
