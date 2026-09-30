import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { pruneAuditLogs } from '@/modules/audit-logs/audit-logs.prune'

try {
  const deletedCount = await pruneAuditLogs()
  logger.info({ deletedCount }, 'Audit log prune completed')
} finally {
  await prisma.$disconnect()
}
