import { requestJson } from '../../shared/api/http'
import type {
    ConfirmOtpRequest,
    OtpRequest,
    OtpResponse,
    TelegramAppAuthRequest,
    TelegramAuthData,
    TokenPairResponse,
} from '../../shared/api/types'

export const getOtp = async (data: OtpRequest): Promise<OtpResponse> => {
    return requestJson<OtpResponse>('/api/v1/auth/otp/request', {
        method: 'POST',
        auth: false,
        body: data,
    })
}

export const confirmOtp = async (data: ConfirmOtpRequest): Promise<TokenPairResponse> => {
    return requestJson<TokenPairResponse>('/api/v1/auth/otp/verify', {
        method: 'POST',
        auth: false,
        body: data,
    })
}

export const telegramLogin = async (data: TelegramAuthData): Promise<TokenPairResponse> => {
    return requestJson<TokenPairResponse>('/api/v1/auth/telegram', {
        method: 'POST',
        auth: false,
        body: data,
    })
}

export const telegramAppLogin = async (initData: string): Promise<TokenPairResponse> => {
    return requestJson<TokenPairResponse>('/api/v1/auth/telegram_app', {
        method: 'POST',
        auth: false,
        body: { init_data: initData } satisfies TelegramAppAuthRequest,
    })
}
