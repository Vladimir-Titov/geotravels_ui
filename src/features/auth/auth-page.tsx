import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../../shared/api/http'
import { useAuth } from './auth-context'
import { loginUser, registerUser } from './auth-api'

type AuthMode = 'login' | 'register'

interface FormErrors {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const AuthPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, onAuthSuccess } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const title = useMemo(() => (mode === 'login' ? 'Sign in to GeoTravels' : 'Create a GeoTravels account'), [mode])

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

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
      <section className='auth-card'>
        <p className='auth-eyebrow'>GeoTravels</p>
        <h1>{title}</h1>
        <p className='auth-subtitle'>Track every country you have visited and keep your travel history in one place.</p>

        <form onSubmit={submitForm} className='auth-form'>
          <label htmlFor='auth-email'>Email</label>
          <input
            id='auth-email'
            type='email'
            autoComplete='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder='you@example.com'
            required
          />
          {formErrors.email && <p className='field-error'>{formErrors.email}</p>}

          <label htmlFor='auth-password'>Password</label>
          <input
            id='auth-password'
            type='password'
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder='At least 6 characters'
            required
          />
          {formErrors.password && <p className='field-error'>{formErrors.password}</p>}

          {error && <p role='alert' className='form-error'>{error}</p>}

          <button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className='auth-switch'>
          <span>{mode === 'login' ? 'Need an account?' : 'Already have an account?'}</span>
          <button
            type='button'
            className='text-button'
            onClick={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </div>
      </section>
    </div>
  )
}
