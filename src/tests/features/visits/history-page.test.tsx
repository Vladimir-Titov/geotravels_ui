import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HistoryPage } from '../../../features/visits/history-page'

const fetchVisitsMock = vi.fn()

vi.mock('../../../features/visits/visits-api', () => ({
  fetchVisits: (...args: unknown[]) => fetchVisitsMock(...args),
}))

describe('HistoryPage', () => {
  beforeEach(() => {
    fetchVisitsMock.mockReset()
  })

  it('renders visits and country badges from API payload', async () => {
    fetchVisitsMock.mockResolvedValue({
      visited_country_codes: ['FR', 'JP'],
      visits: [
        {
          id: 'visit-1',
          user_id: 'user-1',
          country_code: 'JP',
          marked_at: '2026-01-01T10:00:00Z',
          trip_date: '2025-12-15',
        },
      ],
    })

    render(<HistoryPage />)

    expect(await screen.findByText('FR')).toBeInTheDocument()
    expect(screen.getAllByText('JP')).toHaveLength(2)
    expect(screen.getByText('Trip date: 2025-12-15')).toBeInTheDocument()
  })
})
