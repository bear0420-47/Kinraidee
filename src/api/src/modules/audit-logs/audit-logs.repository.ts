import { Prisma, type AuditAction, type AuditEntityType } from '@prisma/client'

import type { AuditContext } from '@/shared/auditContext'

type AuditEntry = AuditContext & {
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  before: Prisma.InputJsonObject | null
  after: Prisma.InputJsonObject | null
}

// Runs inside the caller's transaction so the mutation and its audit row commit together.
export function createAuditLog(
  tx: Prisma.TransactionClient,
  { before, after, ...entry }: AuditEntry,
) {
  return tx.auditLog.create({
    data: {
      ...entry,
      before: before ?? Prisma.DbNull,
      after: after ?? Prisma.DbNull,
    },
  })
}
