import type { MyTravelsDashboardResponse } from '../../shared/api/types'

export const mockMyTravelsDashboard: MyTravelsDashboardResponse = {
    me: {
        displayName: 'Olivia Parker',
        username: 'olivia',
    },
    stats: {
        countriesCount: 27,
        citiesCount: 143,
        storiesCount: 14,
    },
    nextMilestone: {
        progressPercent: 70,
        currentValue: 7,
        targetValue: 10,
    },
    recap: {
        period: '2026-04',
        isReady: false,
        shareUrl: null,
        shareRoute: null,
    },
    recentStories: [
        {
            id: 'story-1',
            visibility: 'followers',
            createdAt: '2026-04-11T12:00:00.000Z',
            location: {
                countryCode: 'PT',
                countryName: 'Portugal',
                cityId: 'city-lisbon',
                cityName: 'Lisbon',
            },
            cover: null,
            counters: {
                views: 286,
                likes: 18,
                comments: 6,
            },
        },
        {
            id: 'story-2',
            visibility: 'public',
            createdAt: '2026-04-06T18:30:00.000Z',
            location: {
                countryCode: 'JP',
                countryName: 'Japan',
                cityId: 'city-kyoto',
                cityName: 'Kyoto',
            },
            cover: null,
            counters: {
                views: 412,
                likes: 31,
                comments: 9,
            },
        },
        {
            id: 'story-3',
            visibility: 'private',
            createdAt: '2026-03-29T09:20:00.000Z',
            location: {
                countryCode: 'TR',
                countryName: 'Turkey',
                cityId: 'city-istanbul',
                cityName: 'Istanbul',
            },
            cover: null,
            counters: {
                views: null,
                likes: null,
                comments: null,
            },
        },
    ],
    inboxPreview: {
        unreadCount: 3,
        items: [
            {
                type: 'like',
                text: 'Maya liked your Lisbon draft cover',
                createdAt: '2026-04-21T10:00:00.000Z',
                isRead: false,
            },
            {
                type: 'follow',
                text: 'New follower: Theo Matsuda',
                createdAt: '2026-04-21T09:00:00.000Z',
                isRead: true,
            },
        ],
    },
    mostVisited: [
        { countryName: 'Italy', tripsCount: 12, relativeBarValue: 100 },
        { countryName: 'Spain', tripsCount: 9, relativeBarValue: 75 },
        { countryName: 'France', tripsCount: 7, relativeBarValue: 60 },
    ],
}
