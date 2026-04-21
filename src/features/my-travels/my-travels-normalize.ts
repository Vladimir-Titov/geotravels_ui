import type {
    DashboardMostVisitedCountry,
    DashboardNotification,
    DashboardStory,
    MyTravelsDashboardResponse,
    StoryLocation,
    StoryVisibility,
} from '../../shared/api/types'

const asRecord = (value: unknown): Record<string, unknown> =>
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const asString = (value: unknown, fallback = ''): string =>
    typeof value === 'string' && value.trim().length > 0 ? value : fallback

const asNullableString = (value: unknown): string | null =>
    typeof value === 'string' && value.trim().length > 0 ? value : null

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

const asBoolean = (value: unknown, fallback = false): boolean =>
    typeof value === 'boolean' ? value : fallback

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

    return 'private'
}

const clampPercent = (value: number): number => Math.min(100, Math.max(0, value))

const normalizeLocation = (value: unknown): StoryLocation => {
    const location = asRecord(value)

    return {
        countryCode: asString(location.country_code),
        countryName: asNullableString(location.country_name),
        cityId: asNullableString(location.city_id),
        cityName: asNullableString(location.city_name),
    }
}

const normalizeStory = (value: unknown, index: number): DashboardStory => {
    const story = asRecord(value)
    const counters = asRecord(story.counters)

    return {
        id: asString(story.id, `${index + 1}`),
        visibility: normalizeVisibility(story.visibility),
        createdAt: asString(story.created_at),
        location: normalizeLocation(story.location),
        cover: asNullableString(story.cover),
        counters: {
            views: asNullableNumber(counters.views),
            likes: asNullableNumber(counters.likes),
            comments: asNullableNumber(counters.comments),
        },
    }
}

const normalizeNotifications = (value: unknown): DashboardNotification[] => {
    return asArray(value)
        .map((entry) => {
            const notification = asRecord(entry)

            return {
                type: asString(notification.type),
                text: asString(notification.text),
                createdAt: asString(notification.created_at),
                isRead: asBoolean(notification.is_read),
            }
        })
        .filter((entry) => entry.type.length > 0 || entry.text.length > 0)
}

const normalizeMostVisited = (value: unknown): DashboardMostVisitedCountry[] => {
    return asArray(value).map((entry) => {
        const country = asRecord(entry)

        return {
            countryName: asNullableString(country.country_name),
            tripsCount: Math.max(0, asNumber(country.trips_count)),
            relativeBarValue: clampPercent(asNumber(country.relative_bar_value)),
        }
    })
}

export const normalizeMyTravelsDashboard = (value: unknown): MyTravelsDashboardResponse => {
    const root = asRecord(value)
    const me = asRecord(root.me)
    const stats = asRecord(root.stats)
    const nextMilestone = asRecord(root.next_milestone)
    const recap = asRecord(root.recap)
    const inboxPreview = asRecord(root.inbox_preview)

    return {
        me: {
            displayName: asNullableString(me.display_name),
            username: asNullableString(me.username),
        },
        stats: {
            countriesCount: Math.max(0, asNumber(stats.countries_count)),
            citiesCount: Math.max(0, asNumber(stats.cities_count)),
            storiesCount: Math.max(0, asNumber(stats.stories_count)),
        },
        nextMilestone: {
            progressPercent: clampPercent(asNumber(nextMilestone.progress_percent)),
            currentValue: Math.max(0, asNumber(nextMilestone.current_value)),
            targetValue: Math.max(0, asNumber(nextMilestone.target_value)),
        },
        recap: {
            period: asString(recap.period),
            isReady: asBoolean(recap.is_ready),
            shareUrl: asNullableString(recap.share_url),
            shareRoute: asNullableString(recap.share_route),
        },
        recentStories: asArray(root.recent_stories).map(normalizeStory),
        inboxPreview: {
            unreadCount: Math.max(0, asNumber(inboxPreview.unread_count)),
            items: normalizeNotifications(inboxPreview.items),
        },
        mostVisited: normalizeMostVisited(root.most_visited),
    }
}

export const isMyTravelsDashboardEmpty = (dashboard: MyTravelsDashboardResponse): boolean => {
    const hasStats =
        dashboard.stats.countriesCount > 0 ||
        dashboard.stats.citiesCount > 0 ||
        dashboard.stats.storiesCount > 0

    return (
        !hasStats &&
        dashboard.recentStories.length === 0 &&
        dashboard.inboxPreview.items.length === 0 &&
        dashboard.mostVisited.length === 0
    )
}
