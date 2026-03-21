import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../../features/auth/auth-context'
import { RequireAuth } from '../../../features/auth/require-auth'
import { clearSessionTokens, setSessionTokens } from '../../../features/auth/session'

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    clearSessionTokens()
  })

  it('redirects to auth page when no session', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/map']}>
          <Routes>
            <Route path='/auth' element={<div>Auth Screen</div>} />
            <Route element={<RequireAuth />}>
              <Route path='/map' element={<div>Map Screen</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(await screen.findByText('Auth Screen')).toBeInTheDocument()
  })

  it('renders protected route when session exists', async () => {
    setSessionTokens({
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenType: 'bearer',
    })

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/map']}>
          <Routes>
            <Route path='/auth' element={<div>Auth Screen</div>} />
            <Route element={<RequireAuth />}>
              <Route path='/map' element={<div>Map Screen</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(await screen.findByText('Map Screen')).toBeInTheDocument()
  })
})
