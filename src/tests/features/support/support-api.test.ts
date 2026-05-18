import { describe, expect, it, vi } from 'vitest'
import { requestJson } from '../../../shared/api/http'
import { createSupportTicket } from '../../../features/support/support-api'

vi.mock('../../../shared/api/http', () => ({
    requestJson: vi.fn(),
}))

const mockedRequestJson = vi.mocked(requestJson)

describe('support-api', () => {
    it('posts support tickets to the backend contract', async () => {
        mockedRequestJson.mockResolvedValue(undefined)

        await createSupportTicket({
            contact: '  traveler@example.com  ',
            content: 'The page is broken',
        })

        expect(mockedRequestJson).toHaveBeenCalledWith('/api/v1/support/ticket', {
            method: 'POST',
            body: {
                contact: 'traveler@example.com',
                content: 'The page is broken',
            },
        })
    })

    it('keeps requests backend-compatible when contact is empty', async () => {
        mockedRequestJson.mockResolvedValue(undefined)

        await createSupportTicket({
            content: 'The page is broken',
        })

        expect(mockedRequestJson).toHaveBeenCalledWith('/api/v1/support/ticket', {
            method: 'POST',
            body: {
                contact: 'not provided',
                content: 'The page is broken',
            },
        })
    })
})
