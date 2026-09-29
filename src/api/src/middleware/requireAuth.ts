import type { NextFunction, Request, Response } from 'express'
import {
  AUTH_COOKIE_NAME,
  unauthenticatedError,
  verifyAuthToken,
} from '@/modules/auth/auth.helpers'

export async function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const token = request.cookies?.[AUTH_COOKIE_NAME]
  if (typeof token !== 'string' || !token) throw unauthenticatedError()

  try {
    const claims = await verifyAuthToken(token)
    request.user = { id: claims.sub, role: claims.role }
    next()
  } catch {
    throw unauthenticatedError()
  }
}
