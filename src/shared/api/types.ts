export interface ApiErrorPayload {
  detail?: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
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
