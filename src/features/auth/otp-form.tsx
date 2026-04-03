import { useState, useEffect, useRef } from 'react'
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
const FALLBACK_ERROR = 'Something went wrong. Please try again.'

type OtpErrorKind = 'invalid' | 'expired' | 'too-many' | 'cooldown' | 'generic'

interface NormalizedOtpError {
    message: string
    kind: OtpErrorKind
    retryAfterSeconds?: number
}

const normalizeOtpError = (error: ApiError): NormalizedOtpError => {
    const sourceMessage = error.message || FALLBACK_ERROR

    if (typeof error.retryAfterSeconds === 'number' && error.retryAfterSeconds > 0) {
        return {
            message: `Please try again in ${error.retryAfterSeconds} sec.`,
            kind: 'cooldown',
            retryAfterSeconds: error.retryAfterSeconds,
        }
    }

    if (sourceMessage.includes('Please wait before requesting a new code')) {
        return { message: 'Please try again in n sec.', kind: 'cooldown' }
    }

    if (sourceMessage.includes('Invalid code')) {
        return { message: 'Wrong OTP code.', kind: 'invalid' }
    }

    if (sourceMessage.includes('OTP has expired') || sourceMessage.includes('Invalid or expired OTP')) {
        return { message: 'OTP has expired. Request new OTP', kind: 'expired' }
    }

    if (sourceMessage.includes('Too many incorrect attempts')) {
        return { message: 'Too many incorrect attempts. Request new OTP', kind: 'too-many' }
    }

    return {
        message: sourceMessage.includes('Failed to')
            ? FALLBACK_ERROR
            : sourceMessage,
        kind: 'generic',
    }
}

export const OtpForm = ({ email, otpId: initialOtpId, onOtpConfirmed, onBack }: OtpFormProps) => {
    const [currentOtpId, setCurrentOtpId] = useState(initialOtpId)
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
    const [error, setError] = useState<string | null>(null)
    const [errorKind, setErrorKind] = useState<OtpErrorKind | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [resendCountdown, setResendCountdown] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const resolvedError =
        resendCountdown > 0 && errorKind === 'cooldown'
            ? `Please try again in ${resendCountdown} sec.`
            : error

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

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
        if (!pasted) return
        const next = [...Array(OTP_LENGTH).fill('')]
        pasted.split('').forEach((ch, i) => {
            next[i] = ch
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
                setError(FALLBACK_ERROR)
                setErrorKind('generic')
            }
        } finally {
            setIsResending(false)
        }
    }

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault()
        const otp = digits.join('')
        if (otp.length < OTP_LENGTH) {
            setError('Wrong OTP code.')
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
                setError(FALLBACK_ERROR)
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
                <span>Back</span>
            </button>

            <div className="auth-card-header">
                <h1>Enter your OTP</h1>
                <p className="auth-subtitle">
                    We sent otp on email
                    <br />
                    <strong>{email}</strong>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="otp-inputs" onPaste={handlePaste}>
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => {
                                inputRefs.current[i] = el
                            }}
                            className={`otp-input${digit ? ' otp-input--filled' : ''}${errorKind === 'invalid' ? ' otp-input--error' : ''}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
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
                    Confirm
                </button>
            </form>

            <p className="auth-resend">
                <button
                    type="button"
                    className="auth-resend__link"
                    disabled={resendCountdown > 0 || isResending}
                    onClick={handleResend}
                >
                    {resendCountdown > 0 ? `Resend OTP (${resendCountdown}s)` : 'Resend OTP'}
                </button>
            </p>
        </section>
    )
}
