import { requestJson } from '../../shared/api/http'

export interface SupportTicketPayload {
    contacts: string
    content: string
}

const SUPPORT_TICKET_ENDPOINT = '/support/ticket'
const SUPPORT_CONTACTS_SOURCE = 'Tripmark web app'

export const createSupportTicket = async (content: string): Promise<void> => {
    await requestJson<unknown>(SUPPORT_TICKET_ENDPOINT, {
        method: 'POST',
        body: {
            contacts: SUPPORT_CONTACTS_SOURCE,
            content,
        } satisfies SupportTicketPayload,
    })
}
