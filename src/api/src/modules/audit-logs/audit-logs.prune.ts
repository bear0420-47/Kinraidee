import {
  auditLogsRepository,
  type AuditLogsRepository,
} from './audit-logs.repository'

export const AUDIT_LOG_RETENTION_DAYS = 180

export function auditLogRetentionThreshold(now: Date) {
  const threshold = new Date(now)
  threshold.setUTCDate(threshold.getUTCDate() - AUDIT_LOG_RETENTION_DAYS)
  return threshold
}

export async function pruneAuditLogs(
  now = new Date(),
  repository: Pick<
    AuditLogsRepository,
    'deleteOlderThan'
  > = auditLogsRepository,
) {
  const result = await repository.deleteOlderThan(
    auditLogRetentionThreshold(now),
  )
  return result.count
}
