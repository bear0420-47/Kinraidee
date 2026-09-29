import { describe, expect, it } from 'vitest'

import { AUTH_TOKEN_LIFETIME_SECONDS } from '@/config/auth'
import { getAuthCookieClearOptions, getAuthCookieOptions } from './auth.helpers'

describe('auth helpers', () => {
  it('uses the approved cookie settings and production Secure flag', () => {
    expect(getAuthCookieOptions('test')).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: AUTH_TOKEN_LIFETIME_SECONDS * 1000,
    })
    expect(getAuthCookieOptions('production').secure).toBe(true)
    expect(getAuthCookieClearOptions('production')).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    })
  })
})
