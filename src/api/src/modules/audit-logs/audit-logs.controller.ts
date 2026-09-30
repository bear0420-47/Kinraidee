import type { RequestHandler } from 'express'

import { ok } from '@/shared/httpResponse'
import { parseAuditLogListQuery } from './audit-logs.dto'
import { auditLogsService, type AuditLogsService } from './audit-logs.service'

export type AuditLogsController = { list: RequestHandler }

export function createAuditLogsController(
  service: AuditLogsService = auditLogsService,
): AuditLogsController {
  return {
    list: async (request, response) => {
      const result = await service.list(parseAuditLogListQuery(request.query))
      return ok(response, { items: result.items }, result.meta)
    },
  }
}

export const auditLogsController = createAuditLogsController()
