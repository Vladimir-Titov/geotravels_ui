import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../../shared/api/http'
import type { TelegramAuthData } from '../../shared/api/types'
import { loginUser, registerUser, telegramLogin } from './auth-api'
import { useAuth } from './auth-context'
import { TelegramLoginButton } from './telegram-login-button'

type AuthMode = 'login' | 'register'

interface FormErrors {
    email?: string
    password?: string
    confirmPassword?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const AUTH_COPY = {
    login: {
        title: 'Sign in to Tripmark',
        submitLabel: 'Sign in',
        submitPendingLabel: 'Signing in...',
        switchPrompt: 'Need an account?',
        switchAction: 'Register',
    },
    register: {
        title: 'Create your Tripmark account',
        submitLabel: 'Create account',
        submitPendingLabel: 'Creating account...',
        switchPrompt: 'Already have an account?',
        switchAction: 'Sign in',
    },
} as const

export const AuthPage = () => {
    const navigate = useNavigate()
    const { isAuthenticated, onAuthSuccess } = useAuth()

    const [mode, setMode] = useState<AuthMode>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTelegramPending, setIsTelegramPending] = useState(false)

    const copy = AUTH_COPY[mode]

    if (isAuthenticated) {
        return <Navigate replace to='/map' />
    }

    const validate = (): boolean => {
        const nextErrors: FormErrors = {}

        if (!EMAIL_PATTERN.test(email.trim())) {
            nextErrors.email = 'Enter a valid email address.'
        }

        if (password.length < 6) {
            nextErrors.password = 'Password must be at least 6 characters.'
        }

        if (mode === 'register' && confirmPassword !== password) {
            nextErrors.confirmPassword = 'Passwords must match.'
        }

        setFormErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const switchMode = (nextMode: AuthMode): void => {
        if (nextMode === mode) {
            return
        }

        setMode(nextMode)
        setPassword('')
        setConfirmPassword('')
        setFormErrors({})
        setError(null)
    }

    const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setEmail(event.target.value)
        setError(null)
        setFormErrors((current) => ({ ...current, email: undefined }))
    }

    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setPassword(event.target.value)
        setError(null)
        setFormErrors((current) => ({ ...current, password: undefined, confirmPassword: undefined }))
    }

    const handleConfirmPasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setConfirmPassword(event.target.value)
        setError(null)
        setFormErrors((current) => ({ ...current, confirmPassword: undefined }))
    }

    const handleTelegramAuth = async (data: TelegramAuthData): Promise<void> => {
        setError(null)
        setIsTelegramPending(true)
        try {
            const response = await telegramLogin(data)
            onAuthSuccess({
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
                tokenType: response.token_type,
            })
            navigate('/map', { replace: true })
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Telegram sign-in failed.')
        } finally {
            setIsTelegramPending(false)
        }
    }

    const submitForm = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        setError(null)

        if (!validate()) {
            return
        }

        setIsSubmitting(true)
        try {
            const payload = { email: email.trim(), password }
            const response = mode === 'login' ? await loginUser(payload) : await registerUser(payload)

            onAuthSuccess({
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
                tokenType: response.token_type,
            })

            navigate('/map', { replace: true })
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
        <div className='auth-page'>
            <div className='auth-page__glow auth-page__glow--left' aria-hidden='true' />
            <div className='auth-page__glow auth-page__glow--right' aria-hidden='true' />

            <div className='auth-shell'>
                <section className='auth-card'>
                    <div className='auth-mode-switch' role='group' aria-label='Authentication mode'>
                        <button
                            type='button'
                            className={mode === 'login' ? 'auth-mode-switch__button is-active' : 'auth-mode-switch__button'}
                            aria-label='Switch to sign in form'
                            aria-pressed={mode === 'login'}
                            onClick={() => switchMode('login')}
                        >
                            Sign in
                        </button>
                        <button
                            type='button'
                            className={mode === 'register' ? 'auth-mode-switch__button is-active' : 'auth-mode-switch__button'}
                            aria-label='Switch to registration form'
                            aria-pressed={mode === 'register'}
                            onClick={() => switchMode('register')}
                        >
                            Register
                        </button>
                    </div>

                    <div className='auth-card-header'>
                        <h1>{copy.title}</h1>
                    </div>

                    <form onSubmit={submitForm} className='auth-form'>
                        <div className='auth-field'>
                            <label htmlFor='auth-email'>Email</label>
                            <input
                                id='auth-email'
                                className={formErrors.email ? 'auth-input auth-input--error' : 'auth-input'}
                                type='email'
                                autoComplete='email'
                                value={email}
                                onChange={handleEmailChange}
                                placeholder='you@example.com'
                                required
                            />
                            {formErrors.email && <p className='field-error'>{formErrors.email}</p>}
                        </div>

                        <div className='auth-field'>
                            <label htmlFor='auth-password'>Password</label>
                            <input
                                id='auth-password'
                                className={formErrors.password ? 'auth-input auth-input--error' : 'auth-input'}
                                type='password'
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder='At least 6 characters'
                                required
                            />
                            {formErrors.password && <p className='field-error'>{formErrors.password}</p>}
                        </div>

                        <div className={mode === 'register' ? 'auth-field-collapse is-open' : 'auth-field-collapse'}>
                            <div className='auth-field'>
                                <label htmlFor='auth-confirm-password'>Confirm password</label>
                                <input
                                    id='auth-confirm-password'
                                    className={formErrors.confirmPassword ? 'auth-input auth-input--error' : 'auth-input'}
                                    type='password'
                                    autoComplete='new-password'
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    placeholder='Must match your password'
                                    tabIndex={mode === 'register' ? 0 : -1}
                                />
                                {formErrors.confirmPassword && <p className='field-error'>{formErrors.confirmPassword}</p>}
                            </div>
                        </div>

                        {error && <p role='alert' className='form-error'>{error}</p>}

                        <button type='submit' className='auth-submit' disabled={isSubmitting}>
                            {isSubmitting ? copy.submitPendingLabel : copy.submitLabel}
                        </button>
                    </form>

                    <div className='auth-divider'><span>or</span></div>
                    <div className='auth-tg-section'>
                        {isTelegramPending
                            ? <p className='auth-tg-pending'>Signing in with Telegram…</p>
                            : <TelegramLoginButton onAuth={handleTelegramAuth} />}
                    </div>

                    <div className='auth-switch'>
                        <span>{copy.switchPrompt}</span>
                        <button
                            type='button'
                            className='text-button'
                            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                        >
                            {copy.switchAction}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}
