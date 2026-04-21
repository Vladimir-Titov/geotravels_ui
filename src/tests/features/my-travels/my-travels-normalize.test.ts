import { describe, expect, it } from 'vitest'
import { normalizeMyTravelsDashboard } from '../../../features/my-travels/my-travels-normalize'

describe('normalizeMyTravelsDashboard', () => {
    it('fills defaults when API returns partial payload', () => {
        const dashboard = normalizeMyTravelsDashboard({
            me: { display_name: 'Ada Lovelace' },
            recent_stories: [
                {
                    visibility: 'PRIVATE',
                    counters: { views: '120', likes: 'oops' },
                },
            ],
            inbox_preview: {
                items: [
                    {
                        type: 'like',
                        text: 'Hello',
                        created_at: '2026-04-20T12:00:00.000Z',
                        is_read: false,
                    },
                ],
            },
        })

        expect(dashboard.me.displayName).toBe('Ada Lovelace')
        expect(dashboard.nextMilestone.progressPercent).toBe(0)
        expect(dashboard.recentStories[0].visibility).toBe('private')
        expect(dashboard.recentStories[0].counters.views).toBe(120)
        expect(dashboard.recentStories[0].counters.likes).toBeNull()
        expect(dashboard.inboxPreview.items).toHaveLength(1)
        expect(dashboard.mostVisited).toEqual([])
    })

    it('keeps numeric metrics and clamps most visited values', () => {
        const dashboard = normalizeMyTravelsDashboard({
            recent_stories: [
                {
                    id: 'story-1',
                    cover: '/api/v1/files/file-1/download',
                    counters: { views: 11, likes: 7, comments: '5' },
                },
                {
                    id: 'story-2',
                    cover: 'https://cdn.example.com/file-2.jpg',
                    counters: { views: 'x', likes: '4', comments: null },
                },
            ],
            most_visited: [
                {
                    country_name: 'France',
                    trips_count: '3',
                    relative_bar_value: 155,
                },
            ],
        })

        expect(dashboard.recentStories[0].counters).toEqual({
            views: 11,
            likes: 7,
            comments: 5,
        })
        expect(dashboard.recentStories[0].cover).toBe(
            'http://localhost:8000/api/v1/files/file-1/download',
        )

        expect(dashboard.recentStories[1].counters).toEqual({
            views: null,
            likes: 4,
            comments: null,
        })
        expect(dashboard.recentStories[1].cover).toBe('https://cdn.example.com/file-2.jpg')

        expect(dashboard.mostVisited[0]).toEqual({
            countryName: 'France',
            tripsCount: 3,
            relativeBarValue: 100,
        })
    })
})
