import { AuditAction, AuditEntityType, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/modules/audit-logs/audit-logs.repository'
import type { AuditContext } from '@/shared/auditContext'
import {
  toRestaurantAuditSnapshot,
  type RestaurantData,
  type RestaurantListQuery,
} from './restaurants.dto'

const withZone = { zone: true } as const

function restaurantWhere({
  includeDeleted,
  zoneId,
  search,
}: RestaurantListQuery): Prisma.RestaurantWhereInput {
  return {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(zoneId ? { zoneId } : {}),
    ...(search
      ? {
          OR: [
            { nameTh: { contains: search, mode: 'insensitive' } },
            { nameEn: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
}

export const restaurantsRepository = {
  async list(query: RestaurantListQuery) {
    const where = restaurantWhere(query)
    const [items, total] = await prisma.$transaction([
      prisma.restaurant.findMany({
        where,
        include: withZone,
        orderBy: [{ nameTh: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.restaurant.count({ where }),
    ])
    return { items, total }
  },

  findById(id: string) {
    return prisma.restaurant.findUnique({ where: { id }, include: withZone })
  },

  async zoneExists(zoneId: string) {
    return (await prisma.zone.count({ where: { id: zoneId } })) > 0
  },

  create(data: Required<RestaurantData>, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data,
        include: withZone,
      })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.CREATE,
        entityType: AuditEntityType.RESTAURANT,
        entityId: restaurant.id,
        before: null,
        after: toRestaurantAuditSnapshot(restaurant),
      })
      return restaurant
    })
  },

  update(id: string, data: RestaurantData, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.restaurant.findUniqueOrThrow({
        where: { id },
        include: withZone,
      })
      const restaurant = await tx.restaurant.update({
        where: { id },
        data,
        include: withZone,
      })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.RESTAURANT,
        entityId: id,
        before: toRestaurantAuditSnapshot(before),
        after: toRestaurantAuditSnapshot(restaurant),
      })
      return restaurant
    })
  },

  softDelete(id: string, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.restaurant.findUniqueOrThrow({
        where: { id },
        include: withZone,
      })
      if (before.deletedAt) {
        return { restaurant: before, affectedMenuItemCount: 0, changed: false }
      }

      const deletedAt = new Date()
      const restaurant = await tx.restaurant.update({
        where: { id },
        data: { deletedAt },
        include: withZone,
      })
      const affected = await tx.menuItem.updateMany({
        where: { restaurantId: id, deletedAt: null },
        data: { deletedAt },
      })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.DELETE,
        entityType: AuditEntityType.RESTAURANT,
        entityId: id,
        before: toRestaurantAuditSnapshot(before),
        after: {
          ...toRestaurantAuditSnapshot(restaurant),
          affectedMenuItemCount: affected.count,
        },
      })
      return {
        restaurant,
        affectedMenuItemCount: affected.count,
        changed: true,
      }
    })
  },

  restore(id: string, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.restaurant.findUniqueOrThrow({
        where: { id },
        include: withZone,
      })
      if (!before.deletedAt) return { restaurant: before, changed: false }

      const restaurant = await tx.restaurant.update({
        where: { id },
        data: { deletedAt: null },
        include: withZone,
      })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.RESTAURANT,
        entityId: id,
        before: toRestaurantAuditSnapshot(before),
        after: toRestaurantAuditSnapshot(restaurant),
      })
      return { restaurant, changed: true }
    })
  },
}

export type RestaurantsRepository = typeof restaurantsRepository
