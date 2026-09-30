import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import {
  auditLogListEnvelopeSchema,
  auditLogListQuerySchema,
} from './audit-logs.dto'

export function registerAuditLogsOpenApi(registry: OpenAPIRegistry) {
  const errorEnvelope = registry.register('ErrorEnvelope', errorEnvelopeSchema)
  const listEnvelope = registry.register(
    'AuditLogListEnvelope',
    auditLogListEnvelopeSchema,
  )
  const error = (description: string) => ({
    description,
    content: { 'application/json': { schema: errorEnvelope } },
  })

  registry.registerPath({
    method: 'get',
    path: '/api/audit-logs',
    security: [{ cookieAuth: [] }],
    request: { query: auditLogListQuerySchema },
    responses: {
      200: {
        description: 'Paginated administrator application audit log list',
        content: { 'application/json': { schema: listEnvelope } },
      },
      400: error('Invalid query'),
      401: error('Missing, invalid, or expired token'),
      403: error('Authenticated user is not an administrator'),
    },
  })
}
