import { AuditAction, AuditEntityType, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/modules/audit-logs/audit-logs.repository'
import type { AuditContext } from '@/shared/auditContext'
import {
  menuItemWithRelations,
  toMenuItemAuditSnapshot,
  type MenuItemData,
  type MenuItemListQuery,
} from './menu-items.dto'

const withRelations = menuItemWithRelations.include

function menuItemWhere({
  includeDeleted,
  restaurantId,
  foodTypeId,
  tasteId,
  search,
}: MenuItemListQuery): Prisma.MenuItemWhereInput {
  return {
    ...(includeDeleted
      ? {}
      : { deletedAt: null, restaurant: { deletedAt: null } }),
    ...(restaurantId ? { restaurantId } : {}),
    ...(foodTypeId ? { foodTypeId } : {}),
    ...(tasteId ? { tastes: { some: { tasteId } } } : {}),
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

function bulkSnapshot(ids: string[], countField: string) {
  return {
    ids: [...ids].sort(),
    [countField]: ids.length,
  } satisfies Prisma.InputJsonObject
}

async function lockRestaurant(tx: Prisma.TransactionClient, id: string) {
  const restaurants = await tx.$queryRaw<
    Array<{ id: string; deletedAt: Date | null }>
  >(Prisma.sql`
    SELECT "id", "deletedAt"
    FROM "Restaurant"
    WHERE "id" = ${id}
    FOR UPDATE
  `)
  const restaurant = restaurants[0]
  if (!restaurant) return 'not-found' as const
  return restaurant.deletedAt ? ('deleted' as const) : ('active' as const)
}

export const menuItemsRepository = {
  async list(query: MenuItemListQuery) {
    const where = menuItemWhere(query)
    const [items, total] = await prisma.$transaction([
      prisma.menuItem.findMany({
        where,
        include: withRelations,
        orderBy: [{ nameTh: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.menuItem.count({ where }),
    ])
    return { items, total }
  },

  findById(id: string) {
    return prisma.menuItem.findUnique({
      where: { id },
      include: withRelations,
    })
  },

  async foodTypeExists(id: string) {
    return (await prisma.foodType.count({ where: { id } })) > 0
  },

  async findTasteIds(ids: string[]) {
    return (
      await prisma.taste.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      })
    ).map(({ id }) => id)
  },

  create(
    data: Required<MenuItemData>,
    tasteIds: string[],
    audit: AuditContext,
  ) {
    return prisma.$transaction(async (tx) => {
      const restaurantState = await lockRestaurant(tx, data.restaurantId)
      if (restaurantState === 'not-found') return { kind: 'not-found' as const }
      if (restaurantState === 'deleted') return { kind: 'deleted' as const }

      const menuItem = await tx.menuItem.create({
        data: {
          ...data,
          tastes: { create: tasteIds.map((tasteId) => ({ tasteId })) },
        },
        include: withRelations,
      })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.CREATE,
        entityType: AuditEntityType.MENU_ITEM,
        entityId: menuItem.id,
        before: null,
        after: toMenuItemAuditSnapshot(menuItem),
      })
      return { kind: 'ok' as const, menuItem }
    })
  },

  update(
    id: string,
    data: MenuItemData,
    tasteIds: string[] | undefined,
    audit: AuditContext,
  ) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.menuItem.findUniqueOrThrow({
        where: { id },
        include: withRelations,
      })
      const restaurantState = await lockRestaurant(
        tx,
        data.restaurantId ?? before.restaurantId,
      )
      if (restaurantState === 'not-found') return { kind: 'not-found' as const }
      if (restaurantState === 'deleted') return { kind: 'deleted' as const }
      if (Object.keys(data).length === 0 && tasteIds === undefined) {
        return { kind: 'ok' as const, menuItem: before }
      }

      const menuItem = await tx.menuItem.update({
        where: { id },
        data: {
          ...data,
          ...(tasteIds
            ? {
                tastes: {
                  deleteMany: {},
                  create: tasteIds.map((tasteId) => ({ tasteId })),
                },
              }
            : {}),
        },
        include: withRelations,
      })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.MENU_ITEM,
        entityId: id,
        before: toMenuItemAuditSnapshot(before),
        after: toMenuItemAuditSnapshot(menuItem),
      })
      return { kind: 'ok' as const, menuItem }
    })
  },

  softDelete(id: string, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.menuItem.findUniqueOrThrow({
        where: { id },
        include: withRelations,
      })
      if (before.deletedAt) return { menuItem: before, changed: false }

      const deletedAt = new Date()
      const claimed = await tx.menuItem.updateManyAndReturn({
        where: { id, deletedAt: null },
        data: { deletedAt },
        select: { id: true },
      })
      if (claimed.length === 0) {
        return {
          menuItem: await tx.menuItem.findUniqueOrThrow({
            where: { id },
            include: withRelations,
          }),
          changed: false,
        }
      }

      const menuItem = await tx.menuItem.findUniqueOrThrow({
        where: { id },
        include: withRelations,
      })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.DELETE,
        entityType: AuditEntityType.MENU_ITEM,
        entityId: id,
        before: toMenuItemAuditSnapshot(before),
        after: toMenuItemAuditSnapshot(menuItem),
      })
      return { menuItem, changed: true }
    })
  },

  restore(id: string, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.menuItem.findUniqueOrThrow({
        where: { id },
        include: withRelations,
      })
      if (before.restaurant.deletedAt) {
        return { kind: 'restaurant-deleted' as const }
      }
      if (!before.deletedAt) {
        return { kind: 'ok' as const, menuItem: before, changed: false }
      }

      const claimed = await tx.menuItem.updateManyAndReturn({
        where: {
          id,
          deletedAt: { not: null },
          restaurant: { deletedAt: null },
        },
        data: { deletedAt: null },
        select: { id: true },
      })
      if (claimed.length === 0) {
        const current = await tx.menuItem.findUniqueOrThrow({
          where: { id },
          include: withRelations,
        })
        return current.restaurant.deletedAt
          ? { kind: 'restaurant-deleted' as const }
          : { kind: 'ok' as const, menuItem: current, changed: false }
      }

      const menuItem = await tx.menuItem.findUniqueOrThrow({
        where: { id },
        include: withRelations,
      })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.MENU_ITEM,
        entityId: id,
        before: toMenuItemAuditSnapshot(before),
        after: toMenuItemAuditSnapshot(menuItem),
      })
      return { kind: 'ok' as const, menuItem, changed: true }
    })
  },

  bulkDelete(ids: string[], audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.menuItem.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      })
      if (existing.length !== ids.length) return { kind: 'unknown' as const }

      const changed = await tx.menuItem.updateManyAndReturn({
        where: { id: { in: ids }, deletedAt: null },
        data: { deletedAt: new Date() },
        select: { id: true },
      })
      const changedIds = changed.map(({ id }) => id)
      if (changedIds.length === 0) {
        return { kind: 'ok' as const, updatedCount: 0 }
      }

      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.DELETE,
        entityType: AuditEntityType.MENU_ITEM,
        entityId: 'bulk',
        before: bulkSnapshot(changedIds, 'activeCount'),
        after: bulkSnapshot(changedIds, 'deletedCount'),
      })
      return { kind: 'ok' as const, updatedCount: changedIds.length }
    })
  },

  bulkRestore(ids: string[], audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.menuItem.findMany({
        where: { id: { in: ids } },
        select: { id: true, restaurant: { select: { deletedAt: true } } },
      })
      if (existing.length !== ids.length) return { kind: 'unknown' as const }
      if (existing.some(({ restaurant }) => restaurant.deletedAt)) {
        return { kind: 'restaurant-deleted' as const }
      }

      const changed = await tx.menuItem.updateManyAndReturn({
        where: {
          id: { in: ids },
          deletedAt: { not: null },
          restaurant: { deletedAt: null },
        },
        data: { deletedAt: null },
        select: { id: true },
      })
      const changedIds = changed.map(({ id }) => id)
      if (changedIds.length === 0) {
        return { kind: 'ok' as const, updatedCount: 0 }
      }

      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.MENU_ITEM,
        entityId: 'bulk',
        before: bulkSnapshot(changedIds, 'deletedCount'),
        after: bulkSnapshot(changedIds, 'restoredCount'),
      })
      return { kind: 'ok' as const, updatedCount: changedIds.length }
    })
  },
}

export type MenuItemsRepository = typeof menuItemsRepository
