import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MapPage } from './map-page'

const fetchCountriesMock = vi.fn()
const fetchCountriesGeoJsonMock = vi.fn()
const fetchVisitsMock = vi.fn()
const createVisitMock = vi.fn()

vi.mock('./countries-api', () => ({
  fetchCountries: (...args: unknown[]) => fetchCountriesMock(...args),
  fetchCountriesGeoJson: (...args: unknown[]) => fetchCountriesGeoJsonMock(...args),
}))

vi.mock('../visits/visits-api', () => ({
  fetchVisits: (...args: unknown[]) => fetchVisitsMock(...args),
  createVisit: (...args: unknown[]) => createVisitMock(...args),
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TileLayer: () => <div />,
  GeoJSON: ({ data, onEachFeature }: { data: { features: Array<Record<string, unknown>>; onEachFeature?: unknown }; onEachFeature: (feature: Record<string, unknown>, layer: { on: (handlers: { click: () => void }) => void }) => void }) => {
    const feature = data.features[0] as Record<string, unknown>
    const layerHandlers: { click?: () => void } = {}
    onEachFeature(feature, {
      on: (handlers) => {
        layerHandlers.click = handlers.click
      },
    })

    return (
      <button type='button' onClick={() => layerHandlers.click?.()}>
        Feature click
      </button>
    )
  },
}))

describe('MapPage', () => {
  beforeEach(() => {
    fetchCountriesMock.mockReset()
    fetchCountriesGeoJsonMock.mockReset()
    fetchVisitsMock.mockReset()
    createVisitMock.mockReset()
  })

  it('submits selected country as visit', async () => {
    fetchCountriesMock.mockResolvedValue({
      items: [{ iso_a2: 'FR', name: 'France' }],
    })
    fetchCountriesGeoJsonMock.mockResolvedValue({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { iso_a2: 'FR', name: 'France' },
          geometry: null,
        },
      ],
    })
    fetchVisitsMock.mockResolvedValue({ visits: [], visited_country_codes: [] })
    createVisitMock.mockResolvedValue({ id: '1' })

    render(<MapPage />)

    expect(await screen.findByText('Feature click')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Feature click'))

    await screen.findByText('France')

    fireEvent.change(screen.getByLabelText('Trip date (optional)'), {
      target: { value: '2024-06-01' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Mark as visited' }))

    await waitFor(() => {
      expect(createVisitMock).toHaveBeenCalledWith({
        country_code: 'FR',
        trip_date: '2024-06-01',
      })
    })
  })
})
