import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MyTravelsPage } from '../../../features/my-travels'
import { mockMyTravelsDashboard } from '../../../features/my-travels/my-travels-mock'

const useDashboardMock = vi.fn()

vi.mock('../../../features/my-travels/use-my-travels-dashboard', () => ({
    useMyTravelsDashboard: () => useDashboardMock(),
}))

const createDashboardState = (overrides: Record<string, unknown> = {}) => ({
    data: mockMyTravelsDashboard,
    isLoading: false,
    error: null,
    isEmpty: false,
    refetch: vi.fn(async () => undefined),
    ...overrides,
})

describe('MyTravelsPage', () => {
    beforeEach(() => {
        useDashboardMock.mockReset()
    })

    it('renders loading state', () => {
        useDashboardMock.mockReturnValue(createDashboardState({ isLoading: true, data: null }))

        render(
            <MemoryRouter>
                <MyTravelsPage />
            </MemoryRouter>,
        )

        expect(screen.getByRole('heading', { name: /Loading dashboard/i })).toBeInTheDocument()
    })

    it('renders error state and allows retry', () => {
        const refetch = vi.fn(async () => undefined)
        useDashboardMock.mockReturnValue(
            createDashboardState({ data: null, error: 'Request failed', refetch }),
        )

        render(
            <MemoryRouter>
                <MyTravelsPage />
            </MemoryRouter>,
        )

        expect(screen.getByRole('alert')).toHaveTextContent('Request failed')

        fireEvent.click(screen.getByRole('button', { name: /Retry/i }))
        expect(refetch).toHaveBeenCalledTimes(1)
    })

    it('renders empty state', () => {
        useDashboardMock.mockReturnValue(createDashboardState({ isEmpty: true }))

        render(
            <MemoryRouter>
                <MyTravelsPage />
            </MemoryRouter>,
        )

        expect(screen.getByRole('heading', { name: /My travels is empty/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /\+ Add story/i })).toBeInTheDocument()
    })

    it('renders dashboard sections', () => {
        useDashboardMock.mockReturnValue(createDashboardState())

        render(
            <MemoryRouter>
                <MyTravelsPage />
            </MemoryRouter>,
        )

        expect(screen.getByRole('heading', { name: 'My travels' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Recent travel stories' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Inbox preview' })).toBeInTheDocument()
        expect(screen.getByText('Recap in progress')).toBeInTheDocument()
        expect(screen.getByText('3 recent stories')).toBeInTheDocument()
        expect(screen.getByText('3 unread')).toBeInTheDocument()
        expect(screen.getByText('Like')).toBeInTheDocument()
    })

    it('navigates to add story route by CTA click', () => {
        useDashboardMock.mockReturnValue(createDashboardState())

        render(
            <MemoryRouter initialEntries={['/my-travels']}>
                <Routes>
                    <Route path="/my-travels" element={<MyTravelsPage />} />
                    <Route path="/my-travels/add-story" element={<div>Add story flow</div>} />
                </Routes>
            </MemoryRouter>,
        )

        fireEvent.click(screen.getByRole('button', { name: /\+ Add story/i }))

        expect(screen.getByText('Add story flow')).toBeInTheDocument()
    })
})
