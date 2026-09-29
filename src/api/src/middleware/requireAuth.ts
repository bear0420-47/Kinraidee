import type { NextFunction, Request, Response } from 'express'
import { AUTH_COOKIE_NAME } from '@/config/auth'
import { verifyAuthToken } from '@/lib/authSecurity'
import { unauthenticatedError } from '@/modules/auth/auth.helpers'

export async function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const token = request.cookies?.[AUTH_COOKIE_NAME]
  if (typeof token !== 'string' || !token) throw unauthenticatedError()

  let claims
  try {
    claims = await verifyAuthToken(token)
  } catch {
    throw unauthenticatedError()
  }

  request.user = { id: claims.sub, role: claims.role }
  return next()
}
