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
    deleteVisit: vi.fn(),
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
    cities: [{ id: 'city-1', name: 'Paris', countryCode: 'FR' }],
    tripStart: null,
    tripEnd: null,
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
    cities: [{ id: 'city-2', name: 'Rome', countryCode: 'IT' }],
    placesTotal: 2,
    placesVisited: 1,
}

describe('trips pages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
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
                cityIds: ['city-1'],
                tripStart: null,
                tripEnd: null,
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
                    address: 'Rue de Rivoli',
                    description: 'Large museum with classic collections.',
                    isVisited: false,
                    created: '2026-01-01T00:00:00Z',
                    updated: '2026-01-01T00:00:00Z',
                },
            ],
            cities: [{ id: 'city-1', name: 'Paris', countryCode: 'FR' }],
        })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('renders visits and opens add trip modal', async () => {
        const { container } = render(
            <MemoryRouter>
                <VisitsPage />
            </MemoryRouter>,
        )

        expect(await screen.findByRole('heading', { name: 'Visits' })).toBeInTheDocument()
        expect(screen.getAllByText('Paris')).not.toHaveLength(0)
        const placeholder = container.querySelector('.trip-card__media--placeholder')
        expect(placeholder).toBeInTheDocument()
        expect(placeholder?.className).toMatch(/trip-card__media--gradient-\d/)

        fireEvent.click(screen.getByRole('button', { name: /add trip/i }))
        expect(screen.getByRole('dialog')).toHaveTextContent('New trip')
    })

    it('renders direct card cover URLs with lazy async image attributes', async () => {
        apiMocks.fetchTripCards.mockResolvedValueOnce({
            items: [{ ...visitedCard, coverUrl: 'http://localhost:8080/cover@webp' }],
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

        expect(image).toHaveAttribute('src', 'http://localhost:8080/cover@webp')
        expect(image).toHaveAttribute('loading', 'lazy')
        expect(image).toHaveAttribute('decoding', 'async')
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
        expect(screen.getByText('Rue de Rivoli')).toBeInTheDocument()
        expect(screen.getByText('Large museum with classic collections.')).toBeInTheDocument()

        const checklistButton = screen.getByRole('button', { name: /tickets/i })
        expect(checklistButton).toHaveClass('is-complete')
        fireEvent.click(checklistButton)
        expect(checklistButton).not.toHaveClass('is-complete')
        await waitFor(() =>
            expect(apiMocks.updateChecklistItem).toHaveBeenCalledWith('task-1', 'to_do'),
        )

        const placeButton = screen.getByRole('button', { name: /louvre/i })
        expect(placeButton).not.toHaveClass('is-complete')
        fireEvent.click(placeButton)
        expect(placeButton).toHaveClass('is-complete')
        await waitFor(() => expect(apiMocks.updateVisitPlace).toHaveBeenCalledWith('place-1', true))
    })

    it('deletes trip details after confirmation and returns to the trip list', async () => {
        apiMocks.deleteVisit.mockResolvedValue(undefined)
        vi.stubGlobal(
            'confirm',
            vi.fn(() => true),
        )

        render(
            <MemoryRouter initialEntries={['/trips/visit-1']}>
                <Routes>
                    <Route path="/trips/:visitId" element={<TripDetailPage />} />
                    <Route path="/visits" element={<p>Visits route</p>} />
                </Routes>
            </MemoryRouter>,
        )

        expect(await screen.findByRole('heading', { name: 'Paris' })).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /delete trip/i }))

        await waitFor(() => expect(apiMocks.deleteVisit).toHaveBeenCalledWith('visit-1'))
        expect(await screen.findByText('Visits route')).toBeInTheDocument()
    })

    it('renders direct detail photo URLs with lazy async image attributes', async () => {
        apiMocks.fetchTripDetails.mockResolvedValueOnce({
            visit: {
                id: 'visit-1',
                status: 'visited',
                title: 'Paris',
                description: null,
                countryCode: 'FR',
                countryName: 'France',
                cityIds: ['city-1'],
                tripStart: null,
                tripEnd: null,
                coverFileId: null,
                coverUrl: null,
                created: '2026-01-01T00:00:00Z',
                updated: '2026-01-01T00:00:00Z',
            },
            photos: [
                {
                    id: 'photo-1',
                    fileUrl: 'http://localhost:8080/photo-1-full@webp',
                    thumbnailUrl: 'http://localhost:8080/photo-1-thumb@webp',
                    previewUrl: 'http://localhost:8080/photo-1-preview@webp',
                    filename: 'paris.webp',
                    fileType: 'image/webp',
                    isPrivate: true,
                    isCover: false,
                },
            ],
            checklist: [],
            places: [],
            cities: [{ id: 'city-1', name: 'Paris', countryCode: 'FR' }],
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

        expect(image).toHaveAttribute('src', 'http://localhost:8080/photo-1-thumb@webp')
        expect(image).toHaveAttribute('loading', 'lazy')
        expect(image).toHaveAttribute('decoding', 'async')
    })

    it('uses the full photo URL in the grid when thumbnail URL is missing', async () => {
        apiMocks.fetchTripDetails.mockResolvedValueOnce({
            visit: {
                id: 'visit-1',
                status: 'visited',
                title: 'Paris',
                description: null,
                countryCode: 'FR',
                countryName: 'France',
                cityIds: ['city-1'],
                tripStart: null,
                tripEnd: null,
                coverFileId: null,
                coverUrl: null,
                created: '2026-01-01T00:00:00Z',
                updated: '2026-01-01T00:00:00Z',
            },
            photos: [
                {
                    id: 'photo-without-thumb',
                    fileUrl: 'http://localhost:8080/photo-full@webp',
                    thumbnailUrl: null,
                    previewUrl: null,
                    filename: 'paris.webp',
                    fileType: 'image/webp',
                    isPrivate: true,
                    isCover: false,
                },
            ],
            checklist: [],
            places: [],
            cities: [{ id: 'city-1', name: 'Paris', countryCode: 'FR' }],
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

        expect(image).toHaveAttribute('src', 'http://localhost:8080/photo-full@webp')
    })

    it('opens the selected detail photo in full quality', async () => {
        apiMocks.fetchTripDetails.mockResolvedValueOnce({
            visit: {
                id: 'visit-1',
                status: 'visited',
                title: 'Paris',
                description: null,
                countryCode: 'FR',
                countryName: 'France',
                cityIds: ['city-1'],
                tripStart: null,
                tripEnd: null,
                coverFileId: null,
                coverUrl: null,
                created: '2026-01-01T00:00:00Z',
                updated: '2026-01-01T00:00:00Z',
            },
            photos: [
                {
                    id: 'photo-viewer',
                    fileUrl: 'http://localhost:8080/photo-viewer-full@webp',
                    thumbnailUrl: 'http://localhost:8080/photo-viewer-thumb@webp',
                    previewUrl: 'http://localhost:8080/photo-viewer-preview@webp',
                    filename: 'paris-full.webp',
                    fileType: 'image/webp',
                    isPrivate: true,
                    isCover: false,
                },
                {
                    id: 'photo-viewer-next',
                    fileUrl: 'http://localhost:8080/photo-viewer-next-full@webp',
                    thumbnailUrl: 'http://localhost:8080/photo-viewer-next-thumb@webp',
                    previewUrl: 'http://localhost:8080/photo-viewer-next-preview@webp',
                    filename: 'rome-full.webp',
                    fileType: 'image/webp',
                    isPrivate: true,
                    isCover: false,
                },
            ],
            checklist: [],
            places: [],
            cities: [{ id: 'city-1', name: 'Paris', countryCode: 'FR' }],
        })

        render(
            <MemoryRouter initialEntries={['/trips/visit-1']}>
                <Routes>
                    <Route path="/trips/:visitId" element={<TripDetailPage />} />
                </Routes>
            </MemoryRouter>,
        )

        expect(await screen.findByRole('heading', { name: 'Paris' })).toBeInTheDocument()
        expect(
            screen
                .getByRole('button', { name: /view photo paris-full\.webp/i })
                .querySelector('img'),
        ).toHaveAttribute('src', 'http://localhost:8080/photo-viewer-thumb@webp')

        fireEvent.click(screen.getByRole('button', { name: /view photo paris-full\.webp/i }))

        expect(await screen.findByRole('dialog', { name: 'Photo viewer' })).toBeInTheDocument()
        await waitFor(() =>
            expect(screen.getByAltText('paris-full.webp')).toHaveAttribute(
                'src',
                'http://localhost:8080/photo-viewer-full@webp',
            ),
        )

        fireEvent.click(screen.getByRole('button', { name: 'Close photo' }))
        await waitFor(() =>
            expect(screen.queryByRole('dialog', { name: 'Photo viewer' })).not.toBeInTheDocument(),
        )

        fireEvent.click(screen.getByRole('button', { name: /view photo paris-full\.webp/i }))
        expect(await screen.findByRole('dialog', { name: 'Photo viewer' })).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Next photo' }))
        await waitFor(() =>
            expect(screen.getByAltText('rome-full.webp')).toHaveAttribute(
                'src',
                'http://localhost:8080/photo-viewer-next-full@webp',
            ),
        )

        fireEvent.click(screen.getByRole('button', { name: 'Previous photo' }))
        await waitFor(() =>
            expect(screen.getByAltText('paris-full.webp')).toHaveAttribute(
                'src',
                'http://localhost:8080/photo-viewer-full@webp',
            ),
        )
    })
})
