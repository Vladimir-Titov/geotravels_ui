import { SENTRY_DSN, ENVIRONMENT, APP_VERSION } from './shared/config/env'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import { AuthProvider } from './features/auth'
import './app/app.css'

import * as Sentry from '@sentry/browser'

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        environment: ENVIRONMENT,
        tracesSampleRate: 1.0,
        release: APP_VERSION,
    })
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
