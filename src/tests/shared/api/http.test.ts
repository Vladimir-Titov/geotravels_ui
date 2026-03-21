import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSessionTokens, getSessionTokens, setSessionTokens } from '../../../features/auth/session'
import { requestJson, resetHttpStateForTests } from '../../../shared/api/http'

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
      .mockResolvedValueOnce(jsonResponse(201, { access_token: 'new-access', token_type: 'bearer' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }))

    vi.stubGlobal('fetch', fetchMock)

    await expect(requestJson<{ ok: boolean }>('/api/v1/visits')).resolves.toEqual({ ok: true })

    expect(fetchMock).toHaveBeenCalledTimes(3)

    const retryRequestInit = fetchMock.mock.calls[2]?.[1] as RequestInit | undefined
    expect(getHeader(retryRequestInit?.headers, 'Authorization')).toBe('Bearer new-access')

    expect(getSessionTokens()?.accessToken).toBe('new-access')
  })
})
