import { prisma } from '@/lib/prisma'
import {
  historyWithMenuItem,
  type HistoryListQuery,
} from './recommendation-history.dto'

export const recommendationHistoryRepository = {
  async list(userId: string, { page, pageSize }: HistoryListQuery) {
    const where = { userId }
    const [items, total] = await prisma.$transaction([
      prisma.recommendationHistory.findMany({
        where,
        include: historyWithMenuItem.include,
        orderBy: [{ selectedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.recommendationHistory.count({ where }),
    ])
    return { items, total }
  },

  findMenuItemStatus(menuItemId: string) {
    return prisma.menuItem.findUnique({
      where: { id: menuItemId },
      select: { deletedAt: true, restaurant: { select: { deletedAt: true } } },
    })
  },

  // Every confirmation is its own event: choosing the same menu again adds another row.
  create(userId: string, menuItemId: string) {
    return prisma.recommendationHistory.create({
      data: { userId, menuItemId },
      select: { id: true, menuItemId: true, selectedAt: true },
    })
  },

  // Removes only this user's rows; idempotent, and MenuItems are never touched.
  clear(userId: string) {
    return prisma.recommendationHistory.deleteMany({ where: { userId } })
  },
}

export type RecommendationHistoryRepository =
  typeof recommendationHistoryRepository
