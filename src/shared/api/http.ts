import { clearSessionTokens, getSessionTokens, updateAccessToken } from '../../features/auth/session'
import { API_BASE_URL } from '../config/env'
import type { AccessTokenResponse, ApiErrorPayload, RefreshRequest } from './types'

export class ApiError extends Error {
  public readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export class AuthExpiredError extends ApiError {
  constructor(message = 'Session expired, please sign in again') {
    super(401, message)
    this.name = 'AuthExpiredError'
  }
}

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  auth?: boolean
  body?: unknown
  headers?: HeadersInit
}

let refreshRequest: Promise<boolean> | null = null

const resolvePath = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${API_BASE_URL}${path}`
}

const createHeaders = (headers: HeadersInit | undefined, withJsonBody: boolean): Headers => {
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Accept', 'application/json')
  if (withJsonBody && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }
  return requestHeaders
}

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as ApiErrorPayload
    if (payload?.detail) {
      return payload.detail
    }
  } catch {
    // keep default fallback below
  }

  return response.statusText || 'Request failed'
}

const toApiError = async (response: Response): Promise<ApiError> => {
  const message = await parseErrorMessage(response)
  if (response.status === 401) {
    return new AuthExpiredError(message)
  }
  return new ApiError(response.status, message)
}

const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshRequest) {
    return refreshRequest
  }

  const session = getSessionTokens()
  if (!session?.refreshToken) {
    clearSessionTokens()
    return false
  }

  refreshRequest = (async () => {
    try {
      const payload: RefreshRequest = { refresh_token: session.refreshToken }
      const response = await fetch(resolvePath('/api/v1/auth/refresh'), {
        method: 'POST',
        headers: createHeaders(undefined, true),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        clearSessionTokens()
        return false
      }

      const data = (await response.json()) as AccessTokenResponse
      updateAccessToken(data.access_token, data.token_type)
      return true
    } catch {
      clearSessionTokens()
      return false
    } finally {
      refreshRequest = null
    }
  })()

  return refreshRequest
}

const performRequest = async (
  path: string,
  options: RequestOptions,
  allowRefresh: boolean,
): Promise<Response> => {
  const withBody = options.body !== undefined
  const headers = createHeaders(options.headers, withBody)
  const useAuth = options.auth !== false

  if (useAuth) {
    const accessToken = getSessionTokens()?.accessToken
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
  }

  const response = await fetch(resolvePath(path), {
    ...options,
    headers,
    body: withBody ? JSON.stringify(options.body) : undefined,
  })

  if (response.status !== 401 || !useAuth || !allowRefresh || path === '/api/v1/auth/refresh') {
    return response
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    throw new AuthExpiredError()
  }

  return performRequest(path, options, false)
}

export const requestJson = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await performRequest(path, options, true)

  if (!response.ok) {
    throw await toApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const resetHttpStateForTests = (): void => {
  refreshRequest = null
}
