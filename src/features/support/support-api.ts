import { requestJson } from '../../shared/api/http'

export interface SupportTicketPayload {
    contact?: string
    content: string
}

const SUPPORT_TICKET_ENDPOINT = '/api/v1/support/ticket'
const SUPPORT_CONTACT_FALLBACK = 'not provided'

export const createSupportTicket = async (payload: SupportTicketPayload): Promise<void> => {
    await requestJson<unknown>(SUPPORT_TICKET_ENDPOINT, {
        method: 'POST',
        body: {
            contact: payload.contact?.trim() || SUPPORT_CONTACT_FALLBACK,
            content: payload.content,
        },
    })
}
