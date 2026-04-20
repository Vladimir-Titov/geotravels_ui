import { describe, expect, it } from 'vitest'
import { normalizeMyTravelsDashboard } from '../../../features/my-travels/my-travels-normalize'

describe('normalizeMyTravelsDashboard', () => {
    it('fills defaults when API returns partial payload', () => {
        const dashboard = normalizeMyTravelsDashboard({
            user: { fullName: 'Ada Lovelace' },
            stories: {
                featured: {
                    title: 'Draft story',
                    visibility: 'PRIVATE',
                    counters: { views: '120', likes: 'oops' },
                },
            },
            inboxPreview: {
                items: [{ title: 'Hello', tone: 'warning', status: '1h' }],
            },
        })

        expect(dashboard.user.firstName).toBe('Ada')
        expect(dashboard.header.title).toBe('My travels')
        expect(dashboard.stories.featured.visibility).toBe('private')
        expect(dashboard.stories.featured.counters.views).toBe(120)
        expect(dashboard.stories.featured.counters.likes).toBeNull()
        expect(dashboard.inboxPreview.items).toHaveLength(1)
        expect(dashboard.mostVisited.countries).toEqual([])
    })

    it('keeps numeric metrics and normalizes unsupported values to null', () => {
        const dashboard = normalizeMyTravelsDashboard({
            stories: {
                featured: {
                    title: 'Feature',
                    counters: { views: 11, likes: 7, comments: '5' },
                },
                compact: [
                    {
                        id: 'story-1',
                        title: 'Compact',
                        counters: { views: 'x', likes: '4', comments: null },
                    },
                ],
            },
        })

        expect(dashboard.stories.featured.counters).toEqual({
            views: 11,
            likes: 7,
            comments: 5,
        })

        expect(dashboard.stories.compact[0].counters).toEqual({
            views: null,
            likes: 4,
            comments: null,
        })
    })
})
