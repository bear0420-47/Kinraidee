import { Router, type Router as ExpressRouter } from 'express'

import { requireAdmin } from '@/middleware/requireAdmin'
import { requireAuth } from '@/middleware/requireAuth'
import {
  auditLogsController,
  type AuditLogsController,
} from './audit-logs.controller'

export function createAuditLogsRoutes(
  controller: AuditLogsController = auditLogsController,
): ExpressRouter {
  const router = Router()
  router.get('/', requireAuth, requireAdmin, controller.list)
  return router
}

export const auditLogsRoutes = createAuditLogsRoutes()
