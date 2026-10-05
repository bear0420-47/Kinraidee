import { type Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import {
  recommendationCandidate,
  type RecommendationConditions,
} from './recommendations.dto'
import { budgetWhere } from './recommendations.helpers'

const include = recommendationCandidate.include

function candidateWhere(
  conditions: RecommendationConditions,
  excludedIds: string[],
): Prisma.MenuItemWhereInput {
  return {
    deletedAt: null,
    price: budgetWhere(conditions.budget),
    ...(conditions.foodTypeId ? { foodTypeId: conditions.foodTypeId } : {}),
    ...(conditions.tasteId
      ? { tastes: { some: { tasteId: conditions.tasteId } } }
      : {}),
    ...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
    restaurant: {
      deletedAt: null,
      ...(conditions.zoneId ? { zoneId: conditions.zoneId } : {}),
    },
  }
}

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

  countCandidates(conditions: RecommendationConditions, excludedIds: string[]) {
    return prisma.menuItem.count({
      where: candidateWhere(conditions, excludedIds),
    })
  },
}

export type RecommendationsRepository = typeof recommendationsRepository
