import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PlansPage, StatisticsPage, TripDetailPage, VisitsPage } from '../../../features/trips'

const apiMocks = vi.hoisted(() => ({
    fetchTripCards: vi.fn(),
    fetchTripDetails: vi.fn(),
    fetchTripStatistics: vi.fn(),
    createChecklistItem: vi.fn(),
    createVisitPlace: vi.fn(),
    updateChecklistItem: vi.fn(),
    updateVisit: vi.fn(),
    updateVisitPlace: vi.fn(),
    uploadVisitPhoto: vi.fn(),
    searchCountries: vi.fn(),
    searchCities: vi.fn(),
    createVisit: vi.fn(),
}))

vi.mock('../../../features/trips/trips-api', () => apiMocks)

const visitedCard = {
    id: 'visit-1',
    status: 'visited' as const,
    title: 'Paris',
    countryCode: 'FR',
    countryName: 'France',
    cityId: 'city-1',
    cityName: 'Paris',
    dateFrom: null,
    dateTo: null,
    coverUrl: null,
    photosCount: 0,
    checklistTotal: 0,
    checklistDone: 0,
    placesTotal: 0,
    placesVisited: 0,
}

const plannedCard = {
    ...visitedCard,
    id: 'plan-1',
    status: 'planned' as const,
    title: 'Rome',
    countryCode: 'IT',
    countryName: 'Italy',
    cityName: 'Rome',
    placesTotal: 2,
    placesVisited: 1,
}

const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

describe('trips pages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        Object.defineProperty(URL, 'createObjectURL', {
            configurable: true,
            value: vi.fn(() => 'blob:protected-image'),
        })
        Object.defineProperty(URL, 'revokeObjectURL', {
            configurable: true,
            value: vi.fn(),
        })
        apiMocks.fetchTripCards.mockImplementation(async (status: string) => ({
            items: status === 'planned' ? [plannedCard] : [visitedCard],
            pagination: { limit: 100, offset: 0, total: 1 },
        }))
        apiMocks.fetchTripStatistics.mockResolvedValue({
            visitedCount: 2,
            plannedCount: 1,
            countriesCount: 1,
            citiesCount: 1,
            repeatedCountriesCount: 1,
            favoriteCity: { cityId: 'city-1', cityName: 'Paris', visitsCount: 2 },
            tripsByCountry: [{ countryName: 'France', tripsCount: 2 }],
        })
        apiMocks.fetchTripDetails.mockResolvedValue({
            visit: {
                id: 'visit-1',
                status: 'visited',
                title: 'Paris',
                description: null,
                countryCode: 'FR',
                countryName: 'France',
                cityId: 'city-1',
                cityName: 'Paris',
                cityIds: ['city-1'],
                dateFrom: null,
                dateTo: null,
                coverFileId: null,
                coverUrl: null,
                created: '2026-01-01T00:00:00Z',
                updated: '2026-01-01T00:00:00Z',
            },
            photos: [],
            checklist: [
                {
                    id: 'task-1',
                    visitId: 'visit-1',
                    content: 'Tickets',
                    status: 'done',
                    created: '2026-01-01T00:00:00Z',
                    updated: '2026-01-01T00:00:00Z',
                },
            ],
            places: [
                {
                    id: 'place-1',
                    visitId: 'visit-1',
                    title: 'Louvre',
                    isVisited: false,
                    created: '2026-01-01T00:00:00Z',
                    updated: '2026-01-01T00:00:00Z',
                },
            ],
            cities: [],
        })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        Object.defineProperty(URL, 'createObjectURL', {
            configurable: true,
            value: originalCreateObjectURL,
        })
        Object.defineProperty(URL, 'revokeObjectURL', {
            configurable: true,
            value: originalRevokeObjectURL,
        })
    })

    it('renders visits and opens add trip modal', async () => {
        render(
            <MemoryRouter>
                <VisitsPage />
            </MemoryRouter>,
        )

        expect(await screen.findByRole('heading', { name: 'Visits' })).toBeInTheDocument()
        expect(screen.getAllByText('Paris')).not.toHaveLength(0)

        fireEvent.click(screen.getByRole('button', { name: /add trip/i }))
        expect(screen.getByRole('dialog')).toHaveTextContent('New trip')
    })

    it('renders protected card covers with lazy async image attributes', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            new Response('cover', { status: 200, headers: { 'Content-Type': 'image/webp' } }),
        )
        vi.stubGlobal('fetch', fetchMock)
        apiMocks.fetchTripCards.mockResolvedValueOnce({
            items: [{ ...visitedCard, coverUrl: '/api/v1/files/cover/download' }],
            pagination: { limit: 100, offset: 0, total: 1 },
        })

        const { container } = render(
            <MemoryRouter>
                <VisitsPage />
            </MemoryRouter>,
        )

        expect(await screen.findByRole('heading', { name: 'Visits' })).toBeInTheDocument()
        const image = await waitFor(() => {
            const element = container.querySelector('.trip-card__media img')
            expect(element).toBeInTheDocument()
            return element as HTMLImageElement
        })

        expect(image).toHaveAttribute('src', 'blob:protected-image')
        expect(image).toHaveAttribute('loading', 'lazy')
        expect(image).toHaveAttribute('decoding', 'async')
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8000/api/v1/files/cover/download',
            expect.any(Object),
        )
    })

    it('renders planned trip progress', async () => {
        render(
            <MemoryRouter>
                <PlansPage />
            </MemoryRouter>,
        )

        expect(await screen.findByRole('heading', { name: 'Plans' })).toBeInTheDocument()
        expect(screen.getByText('1/2')).toBeInTheDocument()
    })

    it('renders statistics', async () => {
        render(
            <MemoryRouter>
                <StatisticsPage />
            </MemoryRouter>,
        )

        expect(await screen.findByRole('heading', { name: 'Statistics' })).toBeInTheDocument()
        expect(screen.getByText('Favorite city')).toBeInTheDocument()
    })

    it('renders trip details and toggles checklist and places', async () => {
        apiMocks.updateChecklistItem.mockResolvedValue(undefined)
        apiMocks.updateVisitPlace.mockResolvedValue(undefined)

        render(
            <MemoryRouter initialEntries={['/trips/visit-1']}>
                <Routes>
                    <Route path="/trips/:visitId" element={<TripDetailPage />} />
                </Routes>
            </MemoryRouter>,
        )

        expect(await screen.findByRole('heading', { name: 'Paris' })).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /tickets/i }))
        await waitFor(() => expect(apiMocks.updateChecklistItem).toHaveBeenCalledWith('task-1', 'to_do'))

        fireEvent.click(screen.getByRole('button', { name: /louvre/i }))
        await waitFor(() => expect(apiMocks.updateVisitPlace).toHaveBeenCalledWith('place-1', true))
    })

    it('renders protected detail photos with lazy async image attributes', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            new Response('photo', { status: 200, headers: { 'Content-Type': 'image/webp' } }),
        )
        vi.stubGlobal('fetch', fetchMock)
        apiMocks.fetchTripDetails.mockResolvedValueOnce({
            visit: {
                id: 'visit-1',
                status: 'visited',
                title: 'Paris',
                description: null,
                countryCode: 'FR',
                countryName: 'France',
                cityId: 'city-1',
                cityName: 'Paris',
                cityIds: ['city-1'],
                dateFrom: null,
                dateTo: null,
                coverFileId: null,
                coverUrl: null,
                created: '2026-01-01T00:00:00Z',
                updated: '2026-01-01T00:00:00Z',
            },
            photos: [
                {
                    id: 'photo-1',
                    fileUrl: '/api/v1/files/photo-1/download',
                    filename: 'paris.webp',
                    fileType: 'image/webp',
                    isPrivate: true,
                    isCover: false,
                },
            ],
            checklist: [],
            places: [],
            cities: [],
        })

        const { container } = render(
            <MemoryRouter initialEntries={['/trips/visit-1']}>
                <Routes>
                    <Route path="/trips/:visitId" element={<TripDetailPage />} />
                </Routes>
            </MemoryRouter>,
        )

        expect(await screen.findByRole('heading', { name: 'Paris' })).toBeInTheDocument()
        const image = await waitFor(() => {
            const element = container.querySelector('.trip-photo-tile img')
            expect(element).toBeInTheDocument()
            return element as HTMLImageElement
        })

        expect(image).toHaveAttribute('src', 'blob:protected-image')
        expect(image).toHaveAttribute('loading', 'lazy')
        expect(image).toHaveAttribute('decoding', 'async')
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8000/api/v1/files/photo-1/download',
            expect.any(Object),
        )
    })
})
