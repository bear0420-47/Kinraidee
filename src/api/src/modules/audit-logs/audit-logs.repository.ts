import { Prisma, type AuditAction, type AuditEntityType } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import type { AuditContext } from '@/shared/auditContext'
import type { AuditLogListQuery } from './audit-logs.dto'

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

function auditLogWhere({
  entityType,
  action,
  actorId,
  entityId,
  requestId,
  createdFrom,
  createdTo,
}: AuditLogListQuery): Prisma.AuditLogWhereInput {
  return {
    ...(entityType ? { entityType } : {}),
    ...(action ? { action } : {}),
    ...(actorId ? { actorId } : {}),
    ...(entityId ? { entityId } : {}),
    ...(requestId ? { requestId } : {}),
    ...(createdFrom || createdTo
      ? {
          createdAt: {
            ...(createdFrom ? { gte: new Date(createdFrom) } : {}),
            ...(createdTo ? { lte: new Date(createdTo) } : {}),
          },
        }
      : {}),
  }
}

export const auditLogsRepository = {
  async list(query: AuditLogListQuery) {
    const where = auditLogWhere(query)
    const [items, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          actorId: true,
          action: true,
          entityType: true,
          entityId: true,
          before: true,
          after: true,
          requestId: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.auditLog.count({ where }),
    ])

    return { items, total }
  },

  deleteOlderThan(threshold: Date) {
    return prisma.auditLog.deleteMany({
      where: { createdAt: { lt: threshold } },
    })
  },
}

export type AuditLogsRepository = typeof auditLogsRepository
