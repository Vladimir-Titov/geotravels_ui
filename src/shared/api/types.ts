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
