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

        await createSupportTicket('The page is broken')

        expect(mockedRequestJson).toHaveBeenCalledWith('/support/ticket', {
            method: 'POST',
            body: {
                contacts: 'Tripmark web app',
                content: 'The page is broken',
            },
        })
    })
})
