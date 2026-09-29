import { UserRole } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'

import { HttpError } from '@/shared/httpError'

export function requireAdmin(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  if (request.user?.role !== UserRole.ADMIN) {
    throw new HttpError({
      status: 403,
      code: 'FORBIDDEN',
      message: 'Administrator access required.',
    })
  }

  return next()
}
