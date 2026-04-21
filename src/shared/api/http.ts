import * as Sentry from '@sentry/browser'

import {
    clearSessionTokens,
    getSessionTokens,
    updateAccessToken,
} from '../../features/auth/session'
import { API_BASE_URL } from '../config/env'
import type { AccessTokenResponse, ApiErrorPayload, RefreshRequest } from './types'

export class ApiError extends Error {
    public readonly status: number
    public readonly retryAfterSeconds?: number

    constructor(status: number, message: string, retryAfterSeconds?: number) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.retryAfterSeconds = retryAfterSeconds
    }
}

export class AuthExpiredError extends ApiError {
    constructor(message = 'Session expired, please sign in again') {
        super(401, message)
        this.name = 'AuthExpiredError'
    }
}

interface BaseRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
    auth?: boolean
    headers?: HeadersInit
}

interface RequestOptions extends BaseRequestOptions {
    body?: unknown
}

interface FormRequestOptions extends BaseRequestOptions {
    body: FormData
}

interface PreparedRequestOptions extends BaseRequestOptions {
    body?: BodyInit
    withJsonBody?: boolean
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

interface ParsedApiError {
    message: string
    retryAfterSeconds?: number
}

const parseError = async (response: Response): Promise<ParsedApiError> => {
    try {
        const payload = (await response.json()) as ApiErrorPayload
        if (typeof payload?.detail === 'string') {
            return { message: payload.detail }
        }

        if (payload?.detail && typeof payload.detail === 'object') {
            const detail = payload.detail as { error?: unknown; retry_after?: unknown }
            const message =
                typeof detail.error === 'string' ? detail.error : response.statusText || 'Request failed'
            const retryAfterSeconds =
                typeof detail.retry_after === 'number' ? detail.retry_after : undefined

            return { message, retryAfterSeconds }
        }
    } catch {
        // keep default fallback below
    }

    return { message: response.statusText || 'Request failed' }
}

const toApiError = async (response: Response): Promise<ApiError> => {
    const { message, retryAfterSeconds } = await parseError(response)
    if (response.status === 401) {
        return new AuthExpiredError(message)
    }
    return new ApiError(response.status, message, retryAfterSeconds)
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
    options: PreparedRequestOptions,
    allowRefresh: boolean,
): Promise<Response> => {
    const headers = createHeaders(options.headers, Boolean(options.withJsonBody))
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
        body: options.body,
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

const request = async <T>(path: string, options: PreparedRequestOptions = {}): Promise<T> => {
    let response: Response
    try {
        response = await performRequest(path, options, true)
    } catch (error) {
        if (!(error instanceof AuthExpiredError)) {
            Sentry.captureException(error)
        }
        throw error
    }

    if (!response.ok) {
        throw await toApiError(response)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return (await response.json()) as T
}

export const requestJson = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const hasBody = options.body !== undefined
    return request<T>(path, {
        ...options,
        withJsonBody: hasBody,
        body: hasBody ? JSON.stringify(options.body) : undefined,
    })
}

export const requestForm = async <T>(path: string, options: FormRequestOptions): Promise<T> => {
    return request<T>(path, {
        ...options,
        withJsonBody: false,
        body: options.body,
    })
}

export const resetHttpStateForTests = (): void => {
    refreshRequest = null
}
