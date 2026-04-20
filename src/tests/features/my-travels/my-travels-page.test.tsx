import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { MyTravelsPage } from '../../../features/my-travels'
import { mockMyTravelsDashboard } from '../../../features/my-travels/my-travels-mock'

vi.mock('../../../features/my-travels/my-travels-api', () => ({
    fetchMyTravelsDashboard: vi.fn(async () => mockMyTravelsDashboard),
}))

describe('MyTravelsPage', () => {
    it('renders dashboard sections and CTA actions', async () => {
        render(
            <MemoryRouter>
                <MyTravelsPage />
            </MemoryRouter>,
        )

        expect(screen.getByRole('heading', { name: 'My travels' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '+ Add story' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Upload photos' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Recent travel stories' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Inbox preview' })).toBeInTheDocument()
        expect(screen.getByText('3 unread')).toBeInTheDocument()

        expect(await screen.findByText('Explorer / 10 countries')).toBeInTheDocument()
    })
})
