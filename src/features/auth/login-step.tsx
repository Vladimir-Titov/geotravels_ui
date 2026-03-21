import { useState, type ChangeEvent } from 'react'
import { ApiError } from '../../shared/api/http'
import type { TelegramAuthData, TokenPairResponse } from '../../shared/api/types'
import { getOtp, telegramLogin } from './auth-api'
import { TelegramLoginButton } from './telegram-login-button'
import { YandexAuthButton } from './yandex-auth-button'
import { GoogleAuthButton } from './google-auth-button'

interface LoginStepProps {
    onEmailSuccess: (email: string, otpId: string) => void
    onSocialSuccess: (tokens: TokenPairResponse) => void
}

interface FormErrors {
    email?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const LoginStep = ({ onEmailSuccess, onSocialSuccess }: LoginStepProps) => {
    const [email, setEmail] = useState('')
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTelegramPending, setIsTelegramPending] = useState(false)

    const validate = (): boolean => {
        const nextErrors: FormErrors = {}

        if (!EMAIL_PATTERN.test(email.trim())) {
            nextErrors.email = 'Enter a valid email address.'
        }

        setFormErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setEmail(event.target.value)
        setError(null)
        setFormErrors((current) => ({ ...current, email: undefined }))
    }

    const handleTelegramAuth = async (data: TelegramAuthData): Promise<void> => {
        setIsTelegramPending(true)
        try {
            const response = await telegramLogin(data)
            onSocialSuccess(response)
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Telegram sign-in failed.')
        } finally {
            setIsTelegramPending(false)
        }
    }

    const submitForm = async (event: { preventDefault(): void }): Promise<void> => {
        event.preventDefault()
        setError(null)

        if (!validate()) {
            return
        }

        setIsSubmitting(true)
        try {
            const response = await getOtp({ contact: email.trim() })
            onEmailSuccess(email.trim(), response.otp_id)
        } catch (caught) {
            if (caught instanceof ApiError) {
                setError(caught.message)
            } else {
                setError('Failed to complete authentication request.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="auth-card">
            <div className="auth-card-header">
                <h1>Welcome back</h1>
                <p className="auth-subtitle">Your travel chronicles</p>
            </div>

            <div className="auth-tg-section">
                {isTelegramPending ? (
                    <p className="auth-tg-pending">Signing in with Telegram…</p>
                ) : (
                    <TelegramLoginButton onAuth={handleTelegramAuth} />
                )}
            </div>
            <div className="auth-google-section">
                <GoogleAuthButton />
            </div>
            <div className="auth-yandex-section">
                <YandexAuthButton />
            </div>

            <div className="auth-divider">
                <span>or by email</span>
            </div>

            <form onSubmit={submitForm} className="auth-form">
                <div className="auth-field">
                    <label htmlFor="auth-email">Email</label>
                    <input
                        id="auth-email"
                        className={formErrors.email ? 'auth-input auth-input--error' : 'auth-input'}
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="you@example.com"
                        required
                    />
                    {formErrors.email && <p className="field-error">{formErrors.email}</p>}
                </div>

                {error && (
                    <p role="alert" className="form-error">
                        {error}
                    </p>
                )}

                <button type="submit" className="auth-submit" disabled={isSubmitting}>
                    Get code →
                </button>
            </form>
        </section>
    )
}
