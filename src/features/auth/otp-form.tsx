import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../shared/api/http'
import type { TokenPairResponse } from '../../shared/api/types'
import { confirmOtp, getOtp } from './auth-api'
import logo from '../../assets/logo.png'

interface OtpFormProps {
    email: string
    otpId: string
    onOtpConfirmed: (tokens: TokenPairResponse) => void
    onBack: () => void
}

const OTP_LENGTH = 6

type OtpErrorKind = 'invalid' | 'expired' | 'too-many' | 'cooldown' | 'generic'

interface NormalizedOtpError {
    message: string
    kind: OtpErrorKind
    retryAfterSeconds?: number
}

export const OtpForm = ({ email, otpId: initialOtpId, onOtpConfirmed, onBack }: OtpFormProps) => {
    const { t } = useTranslation('auth')
    const [currentOtpId, setCurrentOtpId] = useState(initialOtpId)
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
    const [error, setError] = useState<string | null>(null)
    const [errorKind, setErrorKind] = useState<OtpErrorKind | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [resendCountdown, setResendCountdown] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const fallbackError = t('genericError')

    const resolvedError =
        resendCountdown > 0 && errorKind === 'cooldown'
            ? t('cooldownError', { seconds: resendCountdown })
            : error

    const normalizeOtpError = (apiError: ApiError): NormalizedOtpError => {
        const sourceMessage = apiError.message || fallbackError

        if (typeof apiError.retryAfterSeconds === 'number' && apiError.retryAfterSeconds > 0) {
            return {
                message: t('cooldownError', { seconds: apiError.retryAfterSeconds }),
                kind: 'cooldown',
                retryAfterSeconds: apiError.retryAfterSeconds,
            }
        }

        if (sourceMessage.includes('Please wait before requesting a new code')) {
            return { message: t('cooldownError', { seconds: 'n' }), kind: 'cooldown' }
        }

        if (sourceMessage.includes('Invalid code')) {
            return { message: t('wrongOtp'), kind: 'invalid' }
        }

        if (sourceMessage.includes('OTP has expired') || sourceMessage.includes('Invalid or expired OTP')) {
            return { message: t('otpExpired'), kind: 'expired' }
        }

        if (sourceMessage.includes('Too many incorrect attempts')) {
            return { message: t('tooManyAttempts'), kind: 'too-many' }
        }

        return {
            message: sourceMessage.includes('Failed to') ? t('sendFailed') : sourceMessage,
            kind: 'generic',
        }
    }

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    useEffect(() => {
        if (resendCountdown === 0) return
        const timer = setInterval(() => {
            setResendCountdown((c) => (c > 0 ? c - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [resendCountdown])

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1)
        const next = [...digits]
        next[index] = digit
        setDigits(next)
        setError(null)
        setErrorKind(null)

        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (event: React.ClipboardEvent) => {
        event.preventDefault()
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
        if (!pasted) return
        const next = [...Array(OTP_LENGTH).fill('')]
        pasted.split('').forEach((char, index) => {
            next[index] = char
        })
        setDigits(next)
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
    }

    const handleResend = async () => {
        setIsResending(true)
        try {
            const response = await getOtp({ contact: email })
            setCurrentOtpId(response.otp_id)
            setResendCountdown(0)
            setDigits(Array(OTP_LENGTH).fill(''))
            setError(null)
            setErrorKind(null)
            inputRefs.current[0]?.focus()
        } catch (caught) {
            if (caught instanceof ApiError) {
                const normalized = normalizeOtpError(caught)
                setError(normalized.message)
                setErrorKind(normalized.kind)
                if (typeof normalized.retryAfterSeconds === 'number' && normalized.retryAfterSeconds > 0) {
                    setResendCountdown(normalized.retryAfterSeconds)
                }
            } else {
                setError(fallbackError)
                setErrorKind('generic')
            }
        } finally {
            setIsResending(false)
        }
    }

    const handleSubmit = async (event: { preventDefault(): void }) => {
        event.preventDefault()
        const otp = digits.join('')
        if (otp.length < OTP_LENGTH) {
            setError(t('wrongOtp'))
            setErrorKind('invalid')
            return
        }

        setIsSubmitting(true)
        setError(null)
        setErrorKind(null)
        try {
            const tokens = await confirmOtp({ otp_id: currentOtpId, code: otp })
            onOtpConfirmed(tokens)
        } catch (caught) {
            if (caught instanceof ApiError) {
                const normalized = normalizeOtpError(caught)
                setError(normalized.message)
                setErrorKind(normalized.kind)
                if (typeof normalized.retryAfterSeconds === 'number' && normalized.retryAfterSeconds > 0) {
                    setResendCountdown(normalized.retryAfterSeconds)
                }
            } else {
                setError(fallbackError)
                setErrorKind('generic')
            }
            setDigits(Array(OTP_LENGTH).fill(''))
            inputRefs.current[0]?.focus()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="auth-card">
            <div className="auth-brand-inside" aria-label="Tripmark logo">
                <img src={logo} alt="Tripmark logo" />
            </div>

            <button className="auth-back-button" onClick={onBack} type="button">
                <span aria-hidden="true">←</span>
                <span>{t('back')}</span>
            </button>

            <div className="auth-card-header">
                <h1>{t('enterOtp')}</h1>
                <p className="auth-subtitle">
                    {t('otpSentTo')}
                    <br />
                    <strong>{email}</strong>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="otp-inputs" onPaste={handlePaste}>
                    {digits.map((digit, index) => (
                        <input
                            key={index}
                            ref={(element) => {
                                inputRefs.current[index] = element
                            }}
                            className={`otp-input${digit ? ' otp-input--filled' : ''}${errorKind === 'invalid' ? ' otp-input--error' : ''}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(event) => handleChange(index, event.target.value)}
                            onKeyDown={(event) => handleKeyDown(index, event)}
                            autoComplete="one-time-code"
                        />
                    ))}
                </div>

                {resolvedError && (
                    <p role="alert" className="form-error">
                        {resolvedError}
                    </p>
                )}

                <button type="submit" className="auth-submit" disabled={isSubmitting}>
                    {t('confirm')}
                </button>
            </form>

            <p className="auth-resend">
                <button
                    type="button"
                    className="auth-resend__link"
                    disabled={resendCountdown > 0 || isResending}
                    onClick={handleResend}
                >
                    {resendCountdown > 0
                        ? t('resendOtpCountdown', { seconds: resendCountdown })
                        : t('resendOtp')}
                </button>
            </p>
        </section>
    )
}
