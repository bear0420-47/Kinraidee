import { AuditAction, AuditEntityType } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/modules/audit-logs/audit-logs.repository'
import type { AuditContext } from '@/shared/auditContext'
import { toAdminTaste, type TasteData } from './tastes.dto'

export const tastesRepository = {
  list() {
    return prisma.taste.findMany({
      orderBy: [{ sortOrder: 'asc' }, { nameTh: 'asc' }],
    })
  },

  findById(id: string) {
    return prisma.taste.findUnique({ where: { id } })
  },

  countMenuItemLinks(tasteId: string) {
    return prisma.menuItemTaste.count({ where: { tasteId } })
  },

  create(data: Required<TasteData>, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const taste = await tx.taste.create({ data })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.CREATE,
        entityType: AuditEntityType.TASTE,
        entityId: taste.id,
        before: null,
        after: toAdminTaste(taste),
      })
      return taste
    })
  },

  update(id: string, data: TasteData, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.taste.findUniqueOrThrow({ where: { id } })
      const taste = await tx.taste.update({ where: { id }, data })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.TASTE,
        entityId: id,
        before: toAdminTaste(before),
        after: toAdminTaste(taste),
      })
      return taste
    })
  },

  delete(id: string, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const taste = await tx.taste.delete({ where: { id } })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.DELETE,
        entityType: AuditEntityType.TASTE,
        entityId: id,
        before: toAdminTaste(taste),
        after: null,
      })
    })
  },
}

export type TastesRepository = typeof tastesRepository
