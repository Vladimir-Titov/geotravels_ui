import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SupportWidget } from '../../../features/support'
import { createSupportTicket } from '../../../features/support/support-api'

vi.mock('../../../features/support/support-api', () => ({
    createSupportTicket: vi.fn(),
}))

const mockedCreateSupportTicket = vi.mocked(createSupportTicket)

describe('SupportWidget', () => {
    beforeEach(() => {
        mockedCreateSupportTicket.mockReset()
    })

    it('opens a lightweight support form with a visible 1000 character limit', () => {
        render(<SupportWidget />)

        fireEvent.click(screen.getByRole('button', { name: /support/i }))

        expect(screen.getByRole('heading', { name: /contact support/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/situation description/i)).toHaveAttribute('maxlength', '1000')
        expect(screen.getByText('Up to 1000 characters')).toBeInTheDocument()
        expect(screen.getByText('0/1000')).toBeInTheDocument()
    })

    it('submits trimmed support content to the backend', async () => {
        mockedCreateSupportTicket.mockResolvedValue(undefined)
        render(<SupportWidget />)

        fireEvent.click(screen.getByRole('button', { name: /support/i }))
        fireEvent.change(screen.getByLabelText(/situation description/i), {
            target: { value: '  Need help with my trip archive  ' },
        })
        fireEvent.click(screen.getByRole('button', { name: /send/i }))

        await waitFor(() => {
            expect(mockedCreateSupportTicket).toHaveBeenCalledWith('Need help with my trip archive')
        })
        expect(await screen.findByText(/thanks, your request has been sent/i)).toBeInTheDocument()
    })

    it('shows backend validation errors inline', async () => {
        mockedCreateSupportTicket.mockRejectedValue(new Error('Content is too long'))
        render(<SupportWidget />)

        fireEvent.click(screen.getByRole('button', { name: /support/i }))
        fireEvent.change(screen.getByLabelText(/situation description/i), {
            target: { value: 'Problem details' },
        })
        fireEvent.click(screen.getByRole('button', { name: /send/i }))

        expect(await screen.findByRole('alert')).toHaveTextContent('Content is too long')
    })
})
