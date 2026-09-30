import type { Prisma } from '@prisma/client'

import {
  auditLogsRepository,
  type AuditLogsRepository,
} from './audit-logs.repository'
import type { AuditLogListQuery, AuditLogRecord } from './audit-logs.dto'

const unsafeKeyParts = [
  'password',
  'token',
  'jwt',
  'cookie',
  'secret',
  'authorization',
]

function isUnsafeKey(key: string) {
  const normalized = key.replaceAll(/[-_]/g, '').toLowerCase()
  return unsafeKeyParts.some((part) => normalized.includes(part))
}

export function redactAuditSnapshot(value: Prisma.JsonValue | null): unknown {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(redactAuditSnapshot)

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !isUnsafeKey(key))
      .map(([key, nested]) => [
        key,
        redactAuditSnapshot(nested as Prisma.JsonValue),
      ]),
  )
}

function toAuditLog(record: AuditLogRecord) {
  return {
    id: record.id,
    actorId: record.actorId,
    action: record.action,
    entityType: record.entityType,
    entityId: record.entityId,
    before: redactAuditSnapshot(record.before),
    after: redactAuditSnapshot(record.after),
    requestId: record.requestId,
    createdAt: record.createdAt.toISOString(),
  }
}

export function createAuditLogsService(
  repository: AuditLogsRepository = auditLogsRepository,
) {
  return {
    async list(query: AuditLogListQuery) {
      const { items, total } = await repository.list(query)
      return {
        items: items.map(toAuditLog),
        meta: { page: query.page, pageSize: query.pageSize, total },
      }
    },
  }
}

export const auditLogsService = createAuditLogsService()
export type AuditLogsService = ReturnType<typeof createAuditLogsService>
