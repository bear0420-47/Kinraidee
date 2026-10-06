import { isForeignKeyConstraintError } from '@/lib/prismaErrors'
import { menuItemNotFoundError } from '@/modules/menu-items/menu-items.helpers'
import {
  isAvailableMenuItem,
  menuItemUnavailableError,
} from '@/modules/menu-items/menu-items.summary'
import {
  toHistoryItem,
  toHistoryRecord,
  type HistoryListQuery,
} from './recommendation-history.dto'
import {
  recommendationHistoryRepository,
  type RecommendationHistoryRepository,
} from './recommendation-history.repository'

export function createRecommendationHistoryService(
  repository: RecommendationHistoryRepository = recommendationHistoryRepository,
) {
  return {
    async list(userId: string, query: HistoryListQuery) {
      const { items, total } = await repository.list(userId, query)
      return {
        items: items.map(toHistoryItem),
        meta: { page: query.page, pageSize: query.pageSize, total },
      }
    },

    // Called only after the user confirms `เอาเมนูนี้แหละ`.
    async record(userId: string, menuItemId: string) {
      const menuItem = await repository.findMenuItemStatus(menuItemId)
      if (!menuItem) throw menuItemNotFoundError()
      if (!isAvailableMenuItem(menuItem)) throw menuItemUnavailableError()

      try {
        return toHistoryRecord(await repository.create(userId, menuItemId))
      } catch (error) {
        // A MenuItem removed between the check and the insert fails its foreign key.
        if (isForeignKeyConstraintError(error)) throw menuItemNotFoundError()
        throw error
      }
    },

    async clear(userId: string) {
      await repository.clear(userId)
    },
  }
}

export type RecommendationHistoryService = ReturnType<
  typeof createRecommendationHistoryService
>

export const recommendationHistoryService = createRecommendationHistoryService()
