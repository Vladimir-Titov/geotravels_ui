import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MapPage } from '../../../features/map/map-page'

const fetchCountriesMock = vi.fn()
const fetchCountriesGeoJsonMock = vi.fn()
const fetchVisitsMock = vi.fn()
const createVisitMock = vi.fn()

vi.mock('../../../features/map/countries-api', async () => {
    const actual = await vi.importActual<typeof import('../../../features/map/countries-api')>('../../../features/map/countries-api')
    return {
        ...actual,
        fetchCountries: (...args: unknown[]) => fetchCountriesMock(...args),
        fetchCountriesGeoJson: (...args: unknown[]) => fetchCountriesGeoJsonMock(...args),
    }
})

vi.mock('../../../features/visits/visits-api', () => ({
    fetchVisits: (...args: unknown[]) => fetchVisitsMock(...args),
    createVisit: (...args: unknown[]) => createVisitMock(...args),
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
                    properties: { iso_a2: 'FR', name: 'France', mapcolor13: 1 },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-5, 42],
                                [8, 42],
                                [8, 51],
                                [-5, 51],
                                [-5, 42],
                            ],
                        ],
                    },
                },
            ],
        })
        fetchVisitsMock.mockResolvedValue({ visits: [], visited_country_codes: [] })
        createVisitMock.mockResolvedValue({ id: '1' })

        render(<MapPage />)

        fireEvent.click(await screen.findByRole('button', { name: 'France' }))

        await screen.findByText('France')

        fireEvent.change(screen.getByLabelText('Trip date'), {
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
