import type { Request } from 'express'

import { unauthenticatedError } from '@/modules/auth/auth.helpers'

export type AuditContext = {
  actorId: string
  requestId: string
}

export function getAuditContext(request: Request): AuditContext {
  if (!request.user) throw unauthenticatedError()
  return { actorId: request.user.id, requestId: request.requestId }
}
