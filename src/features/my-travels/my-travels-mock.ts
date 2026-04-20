import type { MyTravelsDashboardResponse } from '../../shared/api/types'

export const mockMyTravelsDashboard: MyTravelsDashboardResponse = {
    user: {
        firstName: 'Olivia',
        fullName: 'Olivia Parker',
        unreadInboxCount: 3,
    },
    header: {
        title: 'My travels',
        subtitle:
            'Your personal travel cockpit: track progress, publish stories, and pick up the next journey in one glance.',
        recapBadge: 'April recap ready',
    },
    hero: {
        greeting: 'Good afternoon, Olivia',
        title: 'Your next story is one publish away.',
        description:
            'You already have enough material for a strong public profile: visited cities, photo archive, and one recap to share. Let’s turn that into momentum.',
        image:
            'linear-gradient(160deg, #7BB8C8 0%, #B8D3E7 28%, #F2DCC5 58%, #D9A989 100%)',
        stats: [
            { label: 'Countries', value: 27 },
            { label: 'Cities', value: 143 },
            { label: 'Stories', value: 14 },
        ],
    },
    milestone: {
        title: 'Explorer / 10 countries',
        description:
            '7 of 10 countries published as stories. One more strong week and this becomes your first visible achievement.',
        progressPercent: 70,
        ctaLabel: '+ Achievement',
    },
    recap: {
        title: 'April recap',
        summary: '9 trips, 3 new cities, 86 photos.',
        ctaLabel: 'Open share-card',
    },
    stories: {
        draftCount: 2,
        publicCount: 5,
        featured: {
            id: 'featured',
            title: 'A slow morning through Alfama, coffee in hand and zero plans.',
            description:
                'Saved as a polished draft with 14 photos and a cover already set. This is the kind of story that should become the visual benchmark for future posts.',
            visibility: 'Followers',
            image: 'linear-gradient(130deg, #F6B05F 0%, #ED9158 32%, #A26A8E 100%)',
            counters: {
                views: '286 views preview',
                likes: '18 likes',
                comments: '6 comments',
            },
        },
        compact: [
            {
                id: 'kyoto',
                title: 'Kyoto evenings and the first public story that felt truly finished.',
                description:
                    'Tight copy, clean cover, good reaction count. This becomes the reference card for the future profile grid.',
                visibility: 'Public',
                image: 'linear-gradient(135deg, #9FB8AD 0%, #B4C6BE 100%)',
                counters: {
                    views: '412 reach',
                    likes: '31 likes',
                    comments: '9 comments',
                },
            },
            {
                id: 'istanbul',
                title: 'Istanbul rooftop notes — waiting for cover and final caption.',
                description:
                    'Perfect example of a not-yet-published trip that should stay in the personal workspace until ready.',
                visibility: 'Private',
                image: 'linear-gradient(135deg, #4C6B8A 0%, #8D5D57 46%, #CB8C56 100%)',
                counters: {
                    views: 'Draft only',
                    likes: 'not visible',
                    comments: 'to followers',
                },
            },
        ],
    },
    inboxPreview: {
        title: 'Inbox preview',
        subtitle: 'A lightweight preview of the future notification center.',
        items: [
            {
                id: 'n-1',
                title: 'Maya liked your Lisbon draft cover',
                description: 'Reaction on Followers-only story',
                status: '2m',
                tone: 'success',
            },
            {
                id: 'n-2',
                title: 'New follower: Theo Matsuda',
                description: 'Good time to make one more story public',
                status: '1h',
                tone: 'warning',
            },
        ],
    },
    mostVisited: {
        title: 'Most visited',
        subtitle: 'Still useful, but now secondary to stories, progress and action.',
        countries: [
            { rank: 1, country: 'Italy', trips: 12, progressPercent: 100 },
            { rank: 2, country: 'Spain', trips: 9, progressPercent: 75 },
            { rank: 3, country: 'France', trips: 7, progressPercent: 60 },
        ],
    },
}
