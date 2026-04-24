import './auth-page.css'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { TokenPairResponse } from '../../shared/api/types'
import { useAuth } from './auth-context'
import { LoginStep } from './login-step'
import { OtpForm } from './otp-form'

type Step = 'email' | 'otp'

export const AuthPage = () => {
    const navigate = useNavigate()
    const { isAuthenticated, onAuthSuccess } = useAuth()
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [otpId, setOtpId] = useState('')

    if (isAuthenticated) {
        return <Navigate replace to="/visits" />
    }

    const handleEmailSuccess = (submittedEmail: string, submittedOtpId: string) => {
        setEmail(submittedEmail)
        setOtpId(submittedOtpId)
        setStep('otp')
    }

    const handleSuccess = (tokens: TokenPairResponse) => {
        onAuthSuccess({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenType: tokens.token_type,
        })
        navigate('/visits', { replace: true })
    }

    return (
        <div className="auth-page">
            <div className="auth-page__layout">
                <div className="auth-shell">
                    {step === 'email' && (
                        <LoginStep
                            onEmailSuccess={handleEmailSuccess}
                            onSocialSuccess={handleSuccess}
                        />
                    )}
                    {step === 'otp' && (
                        <OtpForm
                            email={email}
                            otpId={otpId}
                            onOtpConfirmed={handleSuccess}
                            onBack={() => setStep('email')}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
