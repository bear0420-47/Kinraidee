import type { Prisma } from '@prisma/client'

import {
  auditLogsRepository,
  type AuditLogsRepository,
} from './audit-logs.repository'
import {
  toAuditLog,
  type AuditLogListQuery,
  type AuditLogRecord,
} from './audit-logs.dto'

const unsafeKeyParts = [
  'password',
  'token',
  'jwt',
  'cookie',
  'secret',
  'authorization',
]

const privateMetadataKeyParts = ['ipaddress', 'useragent']
const privateMetadataExactKeys = [
  'ip',
  'cfconnectingip',
  'clientip',
  'forwardedfor',
  'remoteip',
  'sourceip',
  'xforwardedfor',
  'xrealip',
]

function normalizedKey(key: string) {
  return key.replaceAll(/[-_]/g, '').toLowerCase()
}

function isUnsafeKey(key: string) {
  const normalized = normalizedKey(key)
  return unsafeKeyParts.some((part) => normalized.includes(part))
}

function isPrivateMetadataKey(key: string) {
  const normalized = normalizedKey(key)
  return (
    privateMetadataExactKeys.includes(normalized) ||
    privateMetadataKeyParts.some((part) => normalized.includes(part))
  )
}

export function redactAuditSnapshot(value: Prisma.JsonValue | null): unknown {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(redactAuditSnapshot)

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !isPrivateMetadataKey(key))
      .map(([key, nested]) => [
        key,
        isUnsafeKey(key)
          ? '[REDACTED]'
          : redactAuditSnapshot(nested as Prisma.JsonValue),
      ]),
  )
}

function toRedactedAuditLog(record: AuditLogRecord) {
  return toAuditLog(record, {
    before: redactAuditSnapshot(record.before),
    after: redactAuditSnapshot(record.after),
  })
}

export function createAuditLogsService(
  repository: AuditLogsRepository = auditLogsRepository,
) {
  return {
    async list(query: AuditLogListQuery) {
      const { items, total } = await repository.list(query)
      return {
        items: items.map(toRedactedAuditLog),
        meta: { page: query.page, pageSize: query.pageSize, total },
      }
    },
  }
}

export const auditLogsService = createAuditLogsService()
export type AuditLogsService = ReturnType<typeof createAuditLogsService>
