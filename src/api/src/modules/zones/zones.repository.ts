import { AuditAction, AuditEntityType } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/modules/audit-logs/audit-logs.repository'
import type { AuditContext } from '@/shared/auditContext'
import { toAdminZone, type ZoneData } from './zones.dto'

export const zonesRepository = {
  list() {
    return prisma.zone.findMany({
      orderBy: [{ sortOrder: 'asc' }, { nameTh: 'asc' }],
    })
  },

  findById(id: string) {
    return prisma.zone.findUnique({ where: { id } })
  },

  countRestaurants(zoneId: string) {
    return prisma.restaurant.count({ where: { zoneId } })
  },

  create(data: Required<ZoneData>, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const zone = await tx.zone.create({ data })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.CREATE,
        entityType: AuditEntityType.ZONE,
        entityId: zone.id,
        before: null,
        after: toAdminZone(zone),
      })
      return zone
    })
  },

  update(id: string, data: ZoneData, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.zone.findUniqueOrThrow({ where: { id } })
      const zone = await tx.zone.update({ where: { id }, data })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.ZONE,
        entityId: id,
        before: toAdminZone(before),
        after: toAdminZone(zone),
      })
      return zone
    })
  },

  delete(id: string, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const zone = await tx.zone.delete({ where: { id } })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.DELETE,
        entityType: AuditEntityType.ZONE,
        entityId: id,
        before: toAdminZone(zone),
        after: null,
      })
    })
  },
}

export type ZonesRepository = typeof zonesRepository
