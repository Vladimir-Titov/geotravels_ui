import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSessionTokens } from '../../../features/auth/session'
import { deleteVisit, uploadVisitPhoto } from '../../../features/trips/trips-api'
import { resetHttpStateForTests } from '../../../shared/api/http'

const jsonResponse = (status: number, payload: unknown): Response => {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}

describe('trips api', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        localStorage.clear()
        clearSessionTokens()
        resetHttpStateForTests()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('uploads visit photos through the visit file endpoint', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
            jsonResponse(201, {
                id: 'file-1',
                file_url: '/api/v1/files/file-1/download',
                is_cover: false,
            }),
        )
        vi.stubGlobal('fetch', fetchMock)

        const file = new File(['image-bytes'], 'cover.jpg', { type: 'image/jpeg' })

        await expect(uploadVisitPhoto('visit-1', file)).resolves.toEqual({
            id: 'file-1',
            file_url: '/api/v1/files/file-1/download',
            is_cover: false,
        })

        const requestUrl = fetchMock.mock.calls[0]?.[0]
        const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
        const body = requestInit?.body as FormData
        const uploadedFile = body.get('file') as File

        expect(requestUrl).toBe('http://localhost:8000/api/v1/visits/visit-1/file')
        expect(body.get('visibility')).toBe('private')
        expect(body.get('filename')).toBe('cover.jpg')
        expect(body.get('visit_id')).toBeNull()
        expect(body.get('file_type')).toBeNull()
        expect(uploadedFile).toBeInstanceOf(File)
        expect(uploadedFile.name).toBe('cover.jpg')
        expect(uploadedFile.type).toBe('image/jpeg')
    })

    it('deletes visits through the visit endpoint', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(null, { status: 204 }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(deleteVisit('visit-1')).resolves.toBeUndefined()

        const requestUrl = fetchMock.mock.calls[0]?.[0]
        const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined

        expect(requestUrl).toBe('http://localhost:8000/api/v1/visits/visit-1')
        expect(requestInit?.method).toBe('DELETE')
        expect(requestInit?.body).toBeUndefined()
    })
})
