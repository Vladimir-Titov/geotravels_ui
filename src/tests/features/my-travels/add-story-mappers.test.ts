import { describe, expect, it } from 'vitest'
import {
    mapDraftToCreateVisitPayload,
    mapDraftToUpdateVisitPayload,
    mapVisibilityApiToOption,
    mapVisibilityOptionToApi,
    mapVisitResponseToDraft,
} from '../../../features/my-travels/add-story/add-story-mappers'

const draft = {
    title: '  Weekend in Istanbul  ',
    country: {
        code: 'TR',
        name: 'Turkey',
    },
    cities: [
        {
            id: 'city-1',
            name: 'Istanbul',
            countryCode: 'TR',
        },
    ],
    dateFrom: '2026-04-01',
    dateTo: '2026-04-05',
    description: '  Amazing food and sea  ',
}

describe('add-story mappers', () => {
    it('maps friends visibility to followers in API payload', () => {
        expect(mapVisibilityOptionToApi('friends')).toBe('followers')
        expect(mapVisibilityApiToOption('followers')).toBe('friends')
    })

    it('maps draft to create payload', () => {
        const payload = mapDraftToCreateVisitPayload(draft, 'private')

        expect(payload).toEqual({
            country_code: 'TR',
            title: 'Weekend in Istanbul',
            visibility: 'private',
            date_from: '2026-04-01',
            date_to: '2026-04-05',
            city_ids: ['city-1'],
            description: 'Amazing food and sea',
        })
    })

    it('maps draft to update payload with cover', () => {
        const payload = mapDraftToUpdateVisitPayload(draft, 'followers', 'cover-1')

        expect(payload.visibility).toBe('followers')
        expect(payload.cover_file_id).toBe('cover-1')
        expect(payload.country_code).toBe('TR')
        expect(payload.city_ids).toEqual(['city-1'])
    })

    it('hydrates draft from API response', () => {
        const mapped = mapVisitResponseToDraft({
            id: 'visit-1',
            country_code: 'FR',
            title: 'Paris Spring',
            description: 'Great museums',
            visibility: 'public',
            date_from: '2026-03-01',
            date_to: '2026-03-07',
            city_ids: ['city-paris'],
            cover_file_id: null,
        })

        expect(mapped).toEqual({
            title: 'Paris Spring',
            country: {
                code: 'FR',
                name: 'FR',
            },
            cities: [
                {
                    id: 'city-paris',
                    name: 'city-paris',
                    countryCode: 'FR',
                },
            ],
            dateFrom: '2026-03-01',
            dateTo: '2026-03-07',
            description: 'Great museums',
        })
    })
})
