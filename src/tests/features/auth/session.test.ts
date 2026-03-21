import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSessionTokens,
  getSessionTokens,
  resetSessionStateForTests,
  setSessionTokens,
  type AuthTokens,
} from '../../../features/auth/session'

const tokenPayload: AuthTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenType: 'bearer',
}

describe('session tokens storage', () => {
  beforeEach(() => {
    localStorage.clear()
    clearSessionTokens()
    resetSessionStateForTests()
  })

  it('stores and restores tokens from localStorage', () => {
    setSessionTokens(tokenPayload)

    expect(getSessionTokens()).toEqual(tokenPayload)

    resetSessionStateForTests()

    expect(getSessionTokens()).toEqual(tokenPayload)
  })

  it('clears tokens', () => {
    setSessionTokens(tokenPayload)
    clearSessionTokens()

    expect(getSessionTokens()).toBeNull()
    expect(localStorage.getItem('geotravels.session.tokens.v1')).toBeNull()
  })
})
