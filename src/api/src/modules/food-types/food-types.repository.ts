import { AuditAction, AuditEntityType } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/modules/audit-logs/audit-logs.repository'
import type { AuditContext } from '@/shared/auditContext'
import { toAdminFoodType, type FoodTypeData } from './food-types.dto'

export const foodTypesRepository = {
  list() {
    return prisma.foodType.findMany({
      orderBy: [{ sortOrder: 'asc' }, { nameTh: 'asc' }],
    })
  },

  findById(id: string) {
    return prisma.foodType.findUnique({ where: { id } })
  },

  countMenuItems(foodTypeId: string) {
    return prisma.menuItem.count({ where: { foodTypeId } })
  },

  create(data: Required<FoodTypeData>, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const foodType = await tx.foodType.create({ data })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.CREATE,
        entityType: AuditEntityType.FOOD_TYPE,
        entityId: foodType.id,
        before: null,
        after: toAdminFoodType(foodType),
      })
      return foodType
    })
  },

  update(id: string, data: FoodTypeData, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.foodType.findUniqueOrThrow({ where: { id } })
      const foodType = await tx.foodType.update({ where: { id }, data })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.FOOD_TYPE,
        entityId: id,
        before: toAdminFoodType(before),
        after: toAdminFoodType(foodType),
      })
      return foodType
    })
  },

  delete(id: string, audit: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const foodType = await tx.foodType.delete({ where: { id } })
      await createAuditLog(tx, {
        ...audit,
        action: AuditAction.DELETE,
        entityType: AuditEntityType.FOOD_TYPE,
        entityId: id,
        before: toAdminFoodType(foodType),
        after: null,
      })
    })
  },
}

export type FoodTypesRepository = typeof foodTypesRepository
