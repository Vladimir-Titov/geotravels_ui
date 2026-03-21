export interface ApiErrorPayload {
    detail?: string
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

export interface Country {
    iso_a2: string
    name: string
}

export interface CountriesListResponse {
    items: Country[]
}

export interface MarkVisitRequest {
    country_code: string
    trip_date?: string
}

export interface VisitEvent {
    id: string
    user_id: string
    country_code: string
    marked_at: string
    trip_date?: string | null
}

export interface VisitsResponse {
    visits: VisitEvent[]
    visited_country_codes: string[]
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
