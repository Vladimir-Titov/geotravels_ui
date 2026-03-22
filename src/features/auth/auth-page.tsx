import './auth-page.css'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { TokenPairResponse } from '../../shared/api/types'
import { useAuth } from './auth-context'
import { LoginStep } from './login-step'
import { OtpForm } from './otp-form'
import logo from '../../assets/logo.png'

type Step = 'email' | 'otp'

export const AuthPage = () => {
    const navigate = useNavigate()
    const { isAuthenticated, onAuthSuccess } = useAuth()
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [otpId, setOtpId] = useState('')

    if (isAuthenticated) {
        return <Navigate replace to="/map" />
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
        navigate('/map', { replace: true })
    }

    return (
        <div className="auth-page">
            <div className="auth-page__layout">
                <div className="auth-brand" aria-label="Tripmark logo">
                    <img src={logo} alt="Tripmark logo" width={56} height={56} />
                    <span>Tripmark</span>
                </div>

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
