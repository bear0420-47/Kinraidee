import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '@/shared/httpError'

export function requireAuth(
  _request: Request,
  _response: Response,
  _next: NextFunction,
): never {
  throw new HttpError({
    status: 501,
    code: 'AUTH_NOT_IMPLEMENTED',
    message: 'Authentication is not implemented yet.',
  })
}
