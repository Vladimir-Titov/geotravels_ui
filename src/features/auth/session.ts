export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
}

interface StoredAuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

const STORAGE_KEY = 'geotravels.session.tokens.v1'

type Listener = () => void

const listeners = new Set<Listener>()

const canUseLocalStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const toStored = (tokens: AuthTokens): StoredAuthTokens => ({
  access_token: tokens.accessToken,
  refresh_token: tokens.refreshToken,
  token_type: tokens.tokenType,
})

const fromStored = (tokens: StoredAuthTokens): AuthTokens => ({
  accessToken: tokens.access_token,
  refreshToken: tokens.refresh_token,
  tokenType: tokens.token_type,
})

const readStoredTokens = (): AuthTokens | null => {
  if (!canUseLocalStorage()) {
    return null
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredAuthTokens>
    if (
      typeof parsed.access_token !== 'string' ||
      typeof parsed.refresh_token !== 'string' ||
      typeof parsed.token_type !== 'string'
    ) {
      return null
    }
    return fromStored(parsed as StoredAuthTokens)
  } catch {
    return null
  }
}

let currentTokens: AuthTokens | null = readStoredTokens()

const notifyListeners = (): void => {
  listeners.forEach((listener) => listener())
}

export const getSessionTokens = (): AuthTokens | null => currentTokens

export const setSessionTokens = (tokens: AuthTokens): void => {
  currentTokens = tokens
  if (canUseLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStored(tokens)))
  }
  notifyListeners()
}

export const updateAccessToken = (accessToken: string, tokenType = 'bearer'): void => {
  if (!currentTokens) {
    return
  }

  setSessionTokens({
    ...currentTokens,
    accessToken,
    tokenType,
  })
}

export const clearSessionTokens = (): void => {
  currentTokens = null
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(STORAGE_KEY)
  }
  notifyListeners()
}

export const subscribeSession = (listener: Listener): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const resetSessionStateForTests = (): void => {
  currentTokens = readStoredTokens()
  notifyListeners()
}
