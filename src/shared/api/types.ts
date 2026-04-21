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

export interface DashboardUser {
    firstName: string
    fullName: string
    unreadInboxCount: number
}

export interface DashboardHeader {
    title: string
    subtitle: string
    recapBadge: string
}

export interface DashboardHeroStat {
    label: string
    value: number
}

export interface DashboardHero {
    greeting: string
    title: string
    description: string
    image: string
    stats: DashboardHeroStat[]
}

export interface DashboardMilestone {
    title: string
    description: string
    progressPercent: number
    ctaLabel: string
}

export interface DashboardRecap {
    title: string
    summary: string
    ctaLabel: string
}

export interface StoryCounters {
    views: number | null
    likes: number | null
    comments: number | null
}

export type StoryVisibility = 'public' | 'private' | 'followers'

export interface DashboardStory {
    id: string
    title: string
    description: string
    visibility: StoryVisibility
    image: string
    counters: StoryCounters
}

export interface DashboardStoriesBlock {
    draftCount: number
    publicCount: number
    featured: DashboardStory
    compact: DashboardStory[]
}

export interface DashboardNotification {
    id: string
    title: string
    description: string
    status: string
    tone: 'success' | 'warning'
}

export interface DashboardInboxPreview {
    title: string
    subtitle: string
    items: DashboardNotification[]
}

export interface DashboardMostVisitedCountry {
    rank: number
    country: string
    trips: number
    progressPercent: number
}

export interface DashboardMostVisited {
    title: string
    subtitle: string
    countries: DashboardMostVisitedCountry[]
}

export interface MyTravelsDashboardResponse {
    user: DashboardUser
    header: DashboardHeader
    hero: DashboardHero
    milestone: DashboardMilestone
    recap: DashboardRecap
    stories: DashboardStoriesBlock
    inboxPreview: DashboardInboxPreview
    mostVisited: DashboardMostVisited
}
