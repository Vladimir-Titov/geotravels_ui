import { requestJson } from '../../shared/api/http'
import type { LoginRequest, TokenPairResponse } from '../../shared/api/types'

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
