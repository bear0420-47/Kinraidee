import { prisma } from '@/lib/prisma'
import type { PreferenceRow } from './preferences.dto'

const preferenceFields = {
  budget: true,
  zoneId: true,
  foodTypeId: true,
  tasteId: true,
  zoneAny: true,
  foodTypeAny: true,
  tasteAny: true,
} as const

async function exists(count: Promise<number>) {
  return (await count) > 0
}

export const preferencesRepository = {
  find(userId: string) {
    return prisma.userPreference.findUnique({
      where: { userId },
      select: preferenceFields,
    })
  },

  // Whether each record ID exists; a field that names no record ("any" or not set) passes.
  async masterIdsExist({
    zoneId,
    foodTypeId,
    tasteId,
  }: Pick<PreferenceRow, 'zoneId' | 'foodTypeId' | 'tasteId'>) {
    const [zone, foodType, taste] = await Promise.all([
      zoneId ? exists(prisma.zone.count({ where: { id: zoneId } })) : true,
      foodTypeId
        ? exists(prisma.foodType.count({ where: { id: foodTypeId } }))
        : true,
      tasteId ? exists(prisma.taste.count({ where: { id: tasteId } })) : true,
    ])
    return { zoneId: zone, foodTypeId: foodType, tasteId: taste }
  },

  // One row per user. A single unique `where` with no nested writes lets Prisma use the
  // database's own upsert (`INSERT … ON CONFLICT`), so two first saves cannot collide.
  upsert(userId: string, row: PreferenceRow) {
    return prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...row },
      update: row,
      select: preferenceFields,
    })
  },

  // Idempotent: clearing a user with no preference changes nothing.
  remove(userId: string) {
    return prisma.userPreference.deleteMany({ where: { userId } })
  },
}

export type PreferencesRepository = typeof preferencesRepository
