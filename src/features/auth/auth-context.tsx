import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  clearSessionTokens,
  getSessionTokens,
  setSessionTokens,
  subscribeSession,
  type AuthTokens,
} from './session'

interface AuthContextValue {
  isAuthenticated: boolean
  tokens: AuthTokens | null
  onAuthSuccess: (tokens: AuthTokens) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => getSessionTokens())

  useEffect(() => {
    return subscribeSession(() => setTokens(getSessionTokens()))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(tokens?.accessToken),
      tokens,
      onAuthSuccess: setSessionTokens,
      logout: clearSessionTokens,
    }),
    [tokens],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
