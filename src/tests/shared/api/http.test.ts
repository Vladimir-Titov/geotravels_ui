import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    clearSessionTokens,
    getSessionTokens,
    setSessionTokens,
} from '../../../features/auth/session'
import { ApiError, requestForm, requestJson, resetHttpStateForTests } from '../../../shared/api/http'

const jsonResponse = (status: number, payload: unknown): Response => {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}

const getHeader = (headers: HeadersInit | undefined, headerName: string): string | null => {
    const normalized = new Headers(headers)
    return normalized.get(headerName)
}

describe('http client refresh flow', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        localStorage.clear()
        clearSessionTokens()
        resetHttpStateForTests()
    })

    it('refreshes on 401 and retries original request', async () => {
        setSessionTokens({
            accessToken: 'old-access',
            refreshToken: 'refresh-token',
            tokenType: 'bearer',
        })

        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(jsonResponse(401, { detail: 'expired access token' }))
            .mockResolvedValueOnce(
                jsonResponse(201, { access_token: 'new-access', token_type: 'bearer' }),
            )
            .mockResolvedValueOnce(jsonResponse(200, { ok: true }))

        vi.stubGlobal('fetch', fetchMock)

        await expect(requestJson<{ ok: boolean }>('/api/v1/visits')).resolves.toEqual({ ok: true })

        expect(fetchMock).toHaveBeenCalledTimes(3)

        const retryRequestInit = fetchMock.mock.calls[2]?.[1] as RequestInit | undefined
        expect(getHeader(retryRequestInit?.headers, 'Authorization')).toBe('Bearer new-access')

        expect(getSessionTokens()?.accessToken).toBe('new-access')
    })

    it('parses object detail error payload and exposes retry_after', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
            jsonResponse(429, {
                detail: {
                    error: 'Please wait before requesting a new code',
                    retry_after: 47,
                },
            }),
        )
        vi.stubGlobal('fetch', fetchMock)

        try {
            await requestJson('/api/v1/auth/otp/request', {
                method: 'POST',
                auth: false,
                body: { contact: 'test@example.com' },
            })
            throw new Error('Expected request to fail')
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError)
            const apiError = error as ApiError
            expect(apiError.status).toBe(429)
            expect(apiError.message).toBe('Please wait before requesting a new code')
            expect(apiError.retryAfterSeconds).toBe(47)
        }
    })

    it('sends form requests with auth and keeps multipart content-type unset', async () => {
        setSessionTokens({
            accessToken: 'form-access',
            refreshToken: 'form-refresh',
            tokenType: 'bearer',
        })

        const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(200, { id: 'file-1' }))
        vi.stubGlobal('fetch', fetchMock)

        const formData = new FormData()
        formData.append('visit_id', 'visit-1')
        formData.append('file', new Blob(['image-bytes'], { type: 'image/jpeg' }), 'cover.jpg')

        await expect(
            requestForm<{ id: string }>('/api/v1/files', {
                method: 'POST',
                body: formData,
            }),
        ).resolves.toEqual({ id: 'file-1' })

        const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
        expect(getHeader(requestInit?.headers, 'Authorization')).toBe('Bearer form-access')
        expect(getHeader(requestInit?.headers, 'Accept')).toBe('application/json')
        expect(getHeader(requestInit?.headers, 'Content-Type')).toBeNull()
        expect(requestInit?.body).toBe(formData)
    })

    it('refreshes and retries form requests after 401', async () => {
        setSessionTokens({
            accessToken: 'old-form-access',
            refreshToken: 'form-refresh',
            tokenType: 'bearer',
        })

        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(jsonResponse(401, { detail: 'expired access token' }))
            .mockResolvedValueOnce(
                jsonResponse(201, { access_token: 'new-form-access', token_type: 'bearer' }),
            )
            .mockResolvedValueOnce(jsonResponse(200, { id: 'file-2' }))

        vi.stubGlobal('fetch', fetchMock)

        const formData = new FormData()
        formData.append('visit_id', 'visit-2')
        formData.append('file', new Blob(['img'], { type: 'image/jpeg' }), 'photo.jpg')

        await expect(
            requestForm<{ id: string }>('/api/v1/files', {
                method: 'POST',
                body: formData,
            }),
        ).resolves.toEqual({ id: 'file-2' })

        expect(fetchMock).toHaveBeenCalledTimes(3)
        const retryRequestInit = fetchMock.mock.calls[2]?.[1] as RequestInit | undefined
        expect(getHeader(retryRequestInit?.headers, 'Authorization')).toBe('Bearer new-form-access')
    })
})
