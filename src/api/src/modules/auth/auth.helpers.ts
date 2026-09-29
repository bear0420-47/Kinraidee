import type { CookieOptions } from 'express'

import { AUTH_TOKEN_LIFETIME_SECONDS } from '@/config/auth'
import { HttpError } from '@/shared/httpError'

export function getAuthCookieOptions(
  nodeEnv: 'development' | 'test' | 'production',
): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: nodeEnv === 'production',
    path: '/',
    maxAge: AUTH_TOKEN_LIFETIME_SECONDS * 1000,
  }
}

export function getAuthCookieClearOptions(
  nodeEnv: 'development' | 'test' | 'production',
): CookieOptions {
  const { maxAge: _ignored, ...options } = getAuthCookieOptions(nodeEnv)
  return options
}

export function unauthenticatedError() {
  return new HttpError({
    status: 401,
    code: 'UNAUTHENTICATED',
    message: 'Authentication required.',
  })
}
