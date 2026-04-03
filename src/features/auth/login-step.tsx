import { useEffect, useState, type ChangeEvent } from 'react'
import { ApiError } from '../../shared/api/http'
import type { TelegramAuthData, TokenPairResponse } from '../../shared/api/types'
import { getOtp, telegramLogin } from './auth-api'
import { TelegramLoginButton } from './telegram-login-button'
import logo from '../../assets/logo.png'

interface LoginStepProps {
    onEmailSuccess: (email: string, otpId: string) => void
    onSocialSuccess: (tokens: TokenPairResponse) => void
}

interface FormErrors {
    email?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FALLBACK_ERROR = 'Something went wrong. Please try again.'
const COOLDOWN_FALLBACK = 'Please try again in n sec.'

const normalizeAuthError = (error: ApiError): string => {
    if (typeof error.retryAfterSeconds === 'number' && error.retryAfterSeconds > 0) {
        return `Please try again in ${error.retryAfterSeconds} sec.`
    }

    if (error.message.includes('Please wait before requesting a new code')) {
        return COOLDOWN_FALLBACK
    }

    if (error.message.includes('Failed to send OTP')) {
        return FALLBACK_ERROR
    }

    return error.message || FALLBACK_ERROR
}

export const LoginStep = ({ onEmailSuccess, onSocialSuccess }: LoginStepProps) => {
    const [email, setEmail] = useState('')
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTelegramPending, setIsTelegramPending] = useState(false)
    const [cooldownSeconds, setCooldownSeconds] = useState(0)

    const isCooldownActive = cooldownSeconds > 0
    const resolvedError =
        isCooldownActive && !isSubmitting ? `Please try again in ${cooldownSeconds} sec.` : error

    useEffect(() => {
        if (!isCooldownActive) {
            return
        }
        const timer = window.setInterval(() => {
            setCooldownSeconds((current) => (current > 0 ? current - 1 : 0))
        }, 1000)
        return () => window.clearInterval(timer)
    }, [isCooldownActive])

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

        if (isCooldownActive) {
            return
        }

        if (!validate()) {
            return
        }

        setIsSubmitting(true)
        try {
            const response = await getOtp({ contact: email.trim() })
            onEmailSuccess(email.trim(), response.otp_id)
        } catch (caught) {
            if (caught instanceof ApiError) {
                if (typeof caught.retryAfterSeconds === 'number' && caught.retryAfterSeconds > 0) {
                    setCooldownSeconds(caught.retryAfterSeconds)
                }
                setError(normalizeAuthError(caught))
            } else {
                setError(FALLBACK_ERROR)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="auth-card">
            <div className="auth-brand-inside" aria-label="Tripmark logo">
                <img src={logo} alt="Tripmark logo" />
            </div>

            <div className="auth-card-header">
                <h1>Enter your email</h1>
                <p className="auth-subtitle">Use your work email to continue</p>
            </div>

            <form onSubmit={submitForm} className="auth-form">
                <div className="auth-field">
                    <label className="visually-hidden" htmlFor="auth-email">
                        Email
                    </label>
                    <div
                        className={formErrors.email ? 'auth-input-wrap auth-input-wrap--error' : 'auth-input-wrap'}
                    >
                        <span className="auth-input-dot" aria-hidden="true">
                            •
                        </span>
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
                    </div>
                    {formErrors.email && <p className="field-error">{formErrors.email}</p>}
                </div>

                {resolvedError && (
                    <p role="alert" className="form-error">
                        {resolvedError}
                    </p>
                )}

                <button type="submit" className="auth-submit" disabled={isSubmitting || isCooldownActive}>
                    Submit
                </button>
            </form>

            <div className="auth-tg-section">
                {isTelegramPending ? (
                    <p className="auth-tg-pending">Signing in with Telegram…</p>
                ) : (
                    <TelegramLoginButton onAuth={handleTelegramAuth} />
                )}
            </div>
        </section>
    )
}
