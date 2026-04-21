export interface ApiErrorPayload {
    detail?:
        | string
        | {
              error?: string
              retry_after?: number
          }
}

export interface TelegramAppAuthRequest {
    init_data: string
}

export interface TelegramAuthData {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    auth_date: number
    hash: string
}

export interface RefreshRequest {
    refresh_token: string
}

export interface TokenPairResponse {
    access_token: string
    refresh_token: string
    token_type: string
}

export interface AccessTokenResponse {
    access_token: string
    token_type: string
}

export interface OtpRequest {
    contact: string
}

export interface OtpResponse {
    otp_id: string
    message: string
}

export interface ConfirmOtpRequest {
    otp_id: string
    code: string
}

export interface DashboardMilestone {
    progressPercent: number
    currentValue: number
    targetValue: number
}

export interface DashboardRecap {
    period: string
    isReady: boolean
    shareUrl: string | null
    shareRoute: string | null
}

export interface StoryCounters {
    views: number | null
    likes: number | null
    comments: number | null
}

export type StoryVisibility = 'public' | 'private' | 'followers'

export interface StoryLocation {
    countryCode: string
    countryName: string | null
    cityId: string | null
    cityName: string | null
}

export interface DashboardStory {
    id: string
    visibility: StoryVisibility
    createdAt: string
    location: StoryLocation
    cover: string | null
    counters: StoryCounters
}

export interface DashboardNotification {
    type: string
    text: string
    createdAt: string
    isRead: boolean
}

export interface DashboardMostVisitedCountry {
    countryName: string | null
    tripsCount: number
    relativeBarValue: number
}

export interface MyTravelsDashboardResponse {
    me: {
        displayName: string | null
        username: string | null
    }
    stats: {
        countriesCount: number
        citiesCount: number
        storiesCount: number
    }
    nextMilestone: DashboardMilestone
    recap: DashboardRecap
    recentStories: DashboardStory[]
    inboxPreview: {
        unreadCount: number
        items: DashboardNotification[]
    }
    mostVisited: DashboardMostVisitedCountry[]
}
