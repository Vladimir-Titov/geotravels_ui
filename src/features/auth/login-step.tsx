import { useEffect, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
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

export const LoginStep = ({ onEmailSuccess, onSocialSuccess }: LoginStepProps) => {
    const { t } = useTranslation('auth')
    const [email, setEmail] = useState('')
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTelegramPending, setIsTelegramPending] = useState(false)
    const [cooldownSeconds, setCooldownSeconds] = useState(0)

    const fallbackError = t('genericError')
    const isCooldownActive = cooldownSeconds > 0
    const resolvedError =
        isCooldownActive && !isSubmitting ? t('cooldownError', { seconds: cooldownSeconds }) : error

    useEffect(() => {
        if (!isCooldownActive) {
            return
        }
        const timer = window.setInterval(() => {
            setCooldownSeconds((current) => (current > 0 ? current - 1 : 0))
        }, 1000)
        return () => window.clearInterval(timer)
    }, [isCooldownActive])

    const normalizeAuthError = (apiError: ApiError): string => {
        if (typeof apiError.retryAfterSeconds === 'number' && apiError.retryAfterSeconds > 0) {
            return t('cooldownError', { seconds: apiError.retryAfterSeconds })
        }

        if (apiError.message.includes('Please wait before requesting a new code')) {
            return t('cooldownError', { seconds: 'n' })
        }

        if (apiError.message.includes('Failed to send OTP')) {
            return t('sendFailed')
        }

        return apiError.message || fallbackError
    }

    const validate = (): boolean => {
        const nextErrors: FormErrors = {}

        if (!EMAIL_PATTERN.test(email.trim())) {
            nextErrors.email = t('emailValidation')
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
            setError(caught instanceof ApiError ? caught.message : t('telegramFailed'))
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
                setError(fallbackError)
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
                <h1>{t('enterEmail')}</h1>
                <p className="auth-subtitle">{t('emailSubtitle')}</p>
            </div>

            <form onSubmit={submitForm} className="auth-form">
                <div className="auth-field">
                    <label className="visually-hidden" htmlFor="auth-email">
                        {t('emailLabel')}
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
                            placeholder={t('emailPlaceholder')}
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
                    {t('submit')}
                </button>
            </form>

            <div className="auth-tg-section">
                {isTelegramPending ? (
                    <p className="auth-tg-pending">{t('signingInTelegram')}</p>
                ) : (
                    <TelegramLoginButton onAuth={handleTelegramAuth} />
                )}
            </div>
        </section>
    )
}
