import { useState, useEffect, useRef } from 'react'
import { ApiError } from '../../shared/api/http'
import type { TokenPairResponse } from '../../shared/api/types'
import { confirmOtp, getOtp } from './auth-api'

interface OtpFormProps {
    email: string
    otpId: string
    onOtpConfirmed: (tokens: TokenPairResponse) => void
    onBack: () => void
}

const OTP_LENGTH = 6
const RESEND_TIMEOUT = 60

export const OtpForm = ({ email, otpId: initialOtpId, onOtpConfirmed, onBack }: OtpFormProps) => {
    const [currentOtpId, setCurrentOtpId] = useState(initialOtpId)
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [resendCountdown, setResendCountdown] = useState(RESEND_TIMEOUT)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    useEffect(() => {
        if (resendCountdown === 0) return
        const timer = setInterval(() => {
            setResendCountdown((c) => c - 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [resendCountdown])

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1)
        const next = [...digits]
        next[index] = digit
        setDigits(next)
        setError(null)

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
        try {
            const response = await getOtp({ contact: email })
            setCurrentOtpId(response.otp_id)
            setResendCountdown(RESEND_TIMEOUT)
            setDigits(Array(OTP_LENGTH).fill(''))
            setError(null)
            inputRefs.current[0]?.focus()
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Failed to resend the code.')
        }
    }

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault()
        const otp = digits.join('')
        if (otp.length < OTP_LENGTH) {
            setError('Please enter all 6 digits.')
            return
        }

        setIsSubmitting(true)
        setError(null)
        try {
            const tokens = await confirmOtp({ otp_id: currentOtpId, code: otp })
            onOtpConfirmed(tokens)
        } catch (caught) {
            setError(
                caught instanceof ApiError ? caught.message : 'Invalid code. Please try again.',
            )
            setDigits(Array(OTP_LENGTH).fill(''))
            inputRefs.current[0]?.focus()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="auth-card">
            <button className="auth-back-button" onClick={onBack} type="button">
                ← Back
            </button>

            <div className="auth-card-header">
                <h1>Enter the code</h1>
                <p className="auth-subtitle">
                    We sent a 6-digit code to
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
                            className={`otp-input${digit ? ' otp-input--filled' : ''}`}
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

                {error && (
                    <p role="alert" className="form-error">
                        {error}
                    </p>
                )}

                <button type="submit" className="auth-submit" disabled={isSubmitting}>
                    Sign in
                </button>
            </form>

            <p className="auth-resend">
                Didn't receive it?{' '}
                <button
                    type="button"
                    className="auth-resend__link"
                    disabled={resendCountdown > 0}
                    onClick={handleResend}
                >
                    {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : 'Resend'}
                </button>
            </p>
        </section>
    )
}
