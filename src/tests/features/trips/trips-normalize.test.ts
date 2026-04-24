import { describe, expect, it } from 'vitest'
import {
    normalizeTripCardsResponse,
    normalizeTripDetails,
    normalizeTripStatistics,
} from '../../../features/trips'

describe('trips normalizers', () => {
    it('normalizes cards with nullable dates and counters', () => {
        const response = normalizeTripCardsResponse({
            items: [
                {
                    id: 'visit-1',
                    status: 'visited',
                    title: 'Paris',
                    country_code: 'FR',
                    country_name: 'France',
                    city_id: null,
                    city_name: null,
                    date_from: null,
                    date_to: null,
                    cover_url: '/api/v1/files/file-1/download',
                    photos_count: '2',
                    checklist_total: 1,
                    checklist_done: 1,
                    places_total: 3,
                    places_visited: 2,
                },
            ],
            pagination: { limit: 100, offset: 0, total: 1 },
        })

        expect(response.items[0]).toMatchObject({
            id: 'visit-1',
            dateFrom: null,
            photosCount: 2,
            placesVisited: 2,
        })
    })

    it('normalizes trip details', () => {
        const details = normalizeTripDetails({
            visit: {
                id: 'visit-1',
                status: 'planned',
                title: 'Rome',
                country_code: 'IT',
                city_ids: [],
                created: '2026-01-01T00:00:00Z',
                updated: '2026-01-01T00:00:00Z',
            },
            photos: [{ id: 'file-1', file_url: '/api/v1/files/file-1/download' }],
            checklist: [{ id: 'task-1', visit_id: 'visit-1', content: 'Tickets', status: 'done' }],
            places: [{ id: 'place-1', visit_id: 'visit-1', title: 'Colosseum', is_visited: true }],
            cities: [],
        })

        expect(details.visit.status).toBe('planned')
        expect(details.checklist[0].status).toBe('done')
        expect(details.places[0].isVisited).toBe(true)
    })

    it('normalizes statistics', () => {
        const stats = normalizeTripStatistics({
            visited_count: 3,
            planned_count: 1,
            countries_count: 2,
            cities_count: 3,
            repeated_countries_count: 1,
            favorite_city: { city_id: 'city-1', city_name: 'Paris', visits_count: 2 },
            trips_by_country: [{ country_name: 'France', trips_count: 2 }],
        })

        expect(stats.favoriteCity?.cityName).toBe('Paris')
        expect(stats.tripsByCountry[0].tripsCount).toBe(2)
    })
})
