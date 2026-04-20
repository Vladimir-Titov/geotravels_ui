import type {
    DashboardHeroStat,
    DashboardMostVisitedCountry,
    DashboardNotification,
    DashboardStory,
    MyTravelsDashboardResponse,
    StoryVisibility,
} from '../../shared/api/types'

const asRecord = (value: unknown): Record<string, unknown> =>
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const asString = (value: unknown, fallback = ''): string =>
    typeof value === 'string' && value.trim().length > 0 ? value : fallback

const asNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }

    return fallback
}

const asNullableNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }

    return null
}

const normalizeVisibility = (value: unknown): StoryVisibility => {
    if (value === 'public' || value === 'private' || value === 'followers') {
        return value
    }

    if (typeof value === 'string') {
        const lowered = value.toLowerCase()
        if (lowered === 'public' || lowered === 'private' || lowered === 'followers') {
            return lowered
        }
    }

    return 'public'
}

const normalizeStory = (value: unknown, fallbackId: string): DashboardStory => {
    const story = asRecord(value)
    const counters = asRecord(story.counters)

    return {
        id: asString(story.id, fallbackId),
        title: asString(story.title, 'Story in progress'),
        description: asString(story.description, 'No description yet.'),
        visibility: normalizeVisibility(story.visibility),
        image: asString(story.image, 'linear-gradient(135deg, #D4DCD6 0%, #C3CFC8 100%)'),
        counters: {
            views: asNullableNumber(counters.views),
            likes: asNullableNumber(counters.likes),
            comments: asNullableNumber(counters.comments),
        },
    }
}

const normalizeHeroStats = (value: unknown): DashboardHeroStat[] => {
    return asArray(value)
        .map((entry) => {
            const stat = asRecord(entry)
            const label = asString(stat.label)

            if (!label) {
                return null
            }

            return {
                label,
                value: asNumber(stat.value),
            }
        })
        .filter((entry): entry is DashboardHeroStat => entry !== null)
}

const normalizeNotifications = (value: unknown): DashboardNotification[] => {
    return asArray(value)
        .map((entry, index) => {
            const notification = asRecord(entry)
            const tone = notification.tone === 'warning' ? 'warning' : 'success'
            const title = asString(notification.title)

            if (!title) {
                return null
            }

            return {
                id: asString(notification.id, `notification-${index + 1}`),
                title,
                description: asString(notification.description),
                status: asString(notification.status, '-'),
                tone,
            }
        })
        .filter((entry): entry is DashboardNotification => entry !== null)
}

const normalizeMostVisited = (value: unknown): DashboardMostVisitedCountry[] => {
    return asArray(value)
        .map((entry, index) => {
            const country = asRecord(entry)
            const name = asString(country.country)
            if (!name) {
                return null
            }

            return {
                rank: asNumber(country.rank, index + 1),
                country: name,
                trips: asNumber(country.trips),
                progressPercent: Math.min(100, Math.max(0, asNumber(country.progressPercent))),
            }
        })
        .filter((entry): entry is DashboardMostVisitedCountry => entry !== null)
}

const fallbackHeaderTitle = 'My travels'
const fallbackHeaderSubtitle = 'Track your stories, progress and travel highlights in one place.'

export const normalizeMyTravelsDashboard = (value: unknown): MyTravelsDashboardResponse => {
    const root = asRecord(value)
    const user = asRecord(root.user)
    const header = asRecord(root.header)
    const hero = asRecord(root.hero)
    const milestone = asRecord(root.milestone)
    const recap = asRecord(root.recap)
    const stories = asRecord(root.stories)
    const inboxPreview = asRecord(root.inboxPreview)
    const mostVisited = asRecord(root.mostVisited)

    const fullName = asString(user.fullName, 'Traveler')
    const [fallbackFirstName = 'Traveler'] = fullName.split(' ')

    return {
        user: {
            firstName: asString(user.firstName, fallbackFirstName),
            fullName,
            unreadInboxCount: Math.max(0, asNumber(user.unreadInboxCount)),
        },
        header: {
            title: asString(header.title, fallbackHeaderTitle),
            subtitle: asString(header.subtitle, fallbackHeaderSubtitle),
            recapBadge: asString(header.recapBadge, 'Recap in progress'),
        },
        hero: {
            greeting: asString(hero.greeting, 'Welcome back'),
            title: asString(hero.title, 'Your dashboard is ready'),
            description: asString(hero.description, 'You can continue writing your travel stories.'),
            image: asString(hero.image, 'linear-gradient(160deg, #D7E2DA 0%, #C8D7CD 100%)'),
            stats: normalizeHeroStats(hero.stats),
        },
        milestone: {
            title: asString(milestone.title, 'Milestone in progress'),
            description: asString(milestone.description, 'Add more stories to unlock achievements.'),
            progressPercent: Math.min(100, Math.max(0, asNumber(milestone.progressPercent))),
            ctaLabel: asString(milestone.ctaLabel, '+ Achievement'),
        },
        recap: {
            title: asString(recap.title, 'Monthly recap'),
            summary: asString(recap.summary, 'No recap data yet.'),
            ctaLabel: asString(recap.ctaLabel, 'Open share-card'),
        },
        stories: {
            draftCount: Math.max(0, asNumber(stories.draftCount)),
            publicCount: Math.max(0, asNumber(stories.publicCount)),
            featured: normalizeStory(stories.featured, 'featured'),
            compact: asArray(stories.compact)
                .map((story, index) => normalizeStory(story, `compact-${index + 1}`))
                .slice(0, 2),
        },
        inboxPreview: {
            title: asString(inboxPreview.title, 'Inbox preview'),
            subtitle: asString(inboxPreview.subtitle, 'No notifications yet.'),
            items: normalizeNotifications(inboxPreview.items),
        },
        mostVisited: {
            title: asString(mostVisited.title, 'Most visited'),
            subtitle: asString(mostVisited.subtitle, 'No countries yet.'),
            countries: normalizeMostVisited(mostVisited.countries),
        },
    }
}

export const isMyTravelsDashboardEmpty = (dashboard: MyTravelsDashboardResponse): boolean => {
    const hasHeroStats = dashboard.hero.stats.length > 0
    const hasStories =
        dashboard.stories.compact.length > 0 ||
        dashboard.stories.featured.title !== 'Story in progress'
    const hasInbox = dashboard.inboxPreview.items.length > 0
    const hasMostVisited = dashboard.mostVisited.countries.length > 0

    return !hasHeroStats && !hasStories && !hasInbox && !hasMostVisited
}
