import { requestJson } from '../../shared/api/http'
import type { ConfirmOtpRequest, LoginRequest, OtpRequest, OtpResponse, TelegramAuthData, TokenPairResponse } from '../../shared/api/types'

export const registerUser = async (payload: LoginRequest): Promise<TokenPairResponse> => {
    return requestJson<TokenPairResponse>('/api/v1/auth/register', {
        method: 'POST',
        auth: false,
        body: payload,
    })
}

export const loginUser = async (payload: LoginRequest): Promise<TokenPairResponse> => {
    return requestJson<TokenPairResponse>('/api/v1/auth/login', {
        method: 'POST',
        auth: false,
        body: payload,
    })
}

export const telegramLogin = async (data: TelegramAuthData): Promise<TokenPairResponse> => {
    return requestJson<TokenPairResponse>('/api/v1/auth/telegram', {
        method: 'POST',
        auth: false,
        body: data,
    })
}


export const getOtp = async (data: OtpRequest): Promise<OtpResponse> => {
    return {
        message: 'OTP sent',
    }
    //     return requestJson<OtpResponse>('/api/v1/auth/otp', {
    //         method: 'POST',
    //         auth: false,
    //         body: data,
    //     })
    // 
}

export const confirmOtp = async (data: ConfirmOtpRequest): Promise<TokenPairResponse> => {
    return {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        token_type: 'bearer'
    }
    //     return requestJson<OtpResponse>('/api/v1/auth/otp/confirm', {
    //         method: 'POST',
    //         auth: false,
    //         body: data,
    //     })
    // 
}
