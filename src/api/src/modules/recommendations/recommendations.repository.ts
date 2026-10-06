import { type Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import {
  recommendationCandidate,
  type RecommendationConditions,
} from './recommendations.dto'
import { budgetWhere } from './recommendations.helpers'

const include = recommendationCandidate.include

// Active, non-excluded items under an active Restaurant, before any condition.
function availableWhere(excludedIds: string[]) {
  return {
    deletedAt: null,
    ...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
  } satisfies Prisma.MenuItemWhereInput
}

function candidateWhere(
  conditions: RecommendationConditions,
  excludedIds: string[],
): Prisma.MenuItemWhereInput {
  return {
    ...availableWhere(excludedIds),
    price: budgetWhere(conditions.budget),
    ...(conditions.foodTypeId ? { foodTypeId: conditions.foodTypeId } : {}),
    ...(conditions.tasteId
      ? { tastes: { some: { tasteId: conditions.tasteId } } }
      : {}),
    restaurant: {
      deletedAt: null,
      ...(conditions.zoneId ? { zoneId: conditions.zoneId } : {}),
    },
  }
}

const optionSelect = {
  select: { id: true, nameTh: true, nameEn: true, sortOrder: true },
} as const

export const recommendationsRepository = {
  findTaste(id: string) {
    return prisma.taste.findUnique({
      where: { id },
      select: { id: true, nameTh: true, nameEn: true },
    })
  },

  findFoodType(id: string) {
    return prisma.foodType.findUnique({
      where: { id },
      select: { id: true, nameTh: true, nameEn: true },
    })
  },

  findZone(id: string) {
    return prisma.zone.findUnique({
      where: { id },
      select: { id: true, nameTh: true, nameEn: true },
    })
  },

  findCandidates(conditions: RecommendationConditions, excludedIds: string[]) {
    return prisma.menuItem.findMany({
      where: candidateWhere(conditions, excludedIds),
      include,
    })
  },

  // Every available item with only what the no-match suggestion matches on.
  async findSuggestionPool(excludedIds: string[]) {
    const items = await prisma.menuItem.findMany({
      where: {
        ...availableWhere(excludedIds),
        restaurant: { deletedAt: null },
      },
      select: {
        price: true,
        foodType: optionSelect,
        tastes: { select: { taste: optionSelect } },
        restaurant: { select: { zone: optionSelect } },
      },
    })
    return items.map((item) => ({
      price: item.price,
      zone: item.restaurant.zone,
      foodType: item.foodType,
      tastes: item.tastes.map(({ taste }) => taste),
    }))
  },
}

export type RecommendationsRepository = typeof recommendationsRepository
