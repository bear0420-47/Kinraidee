import type { AuditContext } from '@/shared/auditContext'
import { hasFieldChanges } from '@/shared/recordChanges'
import {
  toAdminMenuItem,
  toMenuItemCreateData,
  toMenuItemUpdateData,
  type CreateMenuItemInput,
  type MenuItemListQuery,
  type UpdateMenuItemInput,
} from './menu-items.dto'
import {
  menuItemFoodTypeNotFoundError,
  menuItemNotFoundError,
  menuItemRestaurantDeletedError,
  menuItemRestaurantNotFoundError,
  menuItemTastesNotFoundError,
  toMenuItemWriteError,
  unknownBulkMenuItemsError,
} from './menu-items.helpers'
import {
  menuItemsRepository,
  type MenuItemsRepository,
} from './menu-items.repository'

function sameIds(left: string[], right: string[]) {
  if (left.length !== right.length) return false
  const rightIds = new Set(right)
  return left.every((id) => rightIds.has(id))
}

export function createMenuItemsService(
  repository: MenuItemsRepository = menuItemsRepository,
) {
  async function findOrThrow(id: string) {
    const menuItem = await repository.findById(id)
    if (!menuItem) throw menuItemNotFoundError()
    return menuItem
  }

  async function requireFoodType(id: string) {
    if (!(await repository.foodTypeExists(id))) {
      throw menuItemFoodTypeNotFoundError()
    }
  }

  async function requireTastes(ids: string[]) {
    const existingIds = await repository.findTasteIds(ids)
    if (!sameIds(ids, existingIds)) throw menuItemTastesNotFoundError()
  }

  return {
    async list(query: MenuItemListQuery) {
      const { items, total } = await repository.list(query)
      return {
        items: items.map(toAdminMenuItem),
        meta: { page: query.page, pageSize: query.pageSize, total },
      }
    },

    async detail(id: string) {
      return toAdminMenuItem(await findOrThrow(id))
    },

    async create(input: CreateMenuItemInput, audit: AuditContext) {
      await Promise.all([
        requireFoodType(input.foodTypeId),
        requireTastes(input.tasteIds),
      ])
      const { data, tasteIds } = toMenuItemCreateData(input)

      try {
        const result = await repository.create(data, tasteIds, audit)
        if (result.kind === 'not-found') {
          throw menuItemRestaurantNotFoundError()
        }
        if (result.kind === 'deleted') {
          throw menuItemRestaurantDeletedError()
        }
        return toAdminMenuItem(result.menuItem)
      } catch (error) {
        throw toMenuItemWriteError(error)
      }
    },

    async update(id: string, input: UpdateMenuItemInput, audit: AuditContext) {
      const current = await findOrThrow(id)
      const currentTasteIds = current.tastes.map(({ tasteId }) => tasteId)

      await Promise.all([
        input.foodTypeId !== undefined &&
        input.foodTypeId !== current.foodTypeId
          ? requireFoodType(input.foodTypeId)
          : undefined,
        input.tasteIds !== undefined
          ? requireTastes(input.tasteIds)
          : undefined,
      ])

      const { data, tasteIds } = toMenuItemUpdateData(input)
      const tastesChanged =
        tasteIds !== undefined && !sameIds(tasteIds, currentTasteIds)
      const changedData = hasFieldChanges(current, data) ? data : {}

      try {
        const result = await repository.update(
          id,
          changedData,
          tastesChanged ? tasteIds : undefined,
          audit,
        )
        if (result.kind === 'not-found') {
          throw menuItemRestaurantNotFoundError()
        }
        if (result.kind === 'deleted') {
          throw menuItemRestaurantDeletedError()
        }
        return toAdminMenuItem(result.menuItem)
      } catch (error) {
        throw toMenuItemWriteError(error)
      }
    },

    async delete(id: string, audit: AuditContext) {
      await findOrThrow(id)
      try {
        await repository.softDelete(id, audit)
      } catch (error) {
        throw toMenuItemWriteError(error)
      }
    },

    async restore(id: string, audit: AuditContext) {
      await findOrThrow(id)
      try {
        const result = await repository.restore(id, audit)
        if (result.kind === 'restaurant-deleted') {
          throw menuItemRestaurantDeletedError()
        }
        return toAdminMenuItem(result.menuItem)
      } catch (error) {
        throw toMenuItemWriteError(error)
      }
    },

    async bulkDelete(ids: string[], audit: AuditContext) {
      try {
        const result = await repository.bulkDelete(ids, audit)
        if (result.kind === 'unknown') throw unknownBulkMenuItemsError()
        return { updatedCount: result.updatedCount }
      } catch (error) {
        throw toMenuItemWriteError(error)
      }
    },

    async bulkRestore(ids: string[], audit: AuditContext) {
      try {
        const result = await repository.bulkRestore(ids, audit)
        if (result.kind === 'unknown') throw unknownBulkMenuItemsError()
        if (result.kind === 'restaurant-deleted') {
          throw menuItemRestaurantDeletedError()
        }
        return { updatedCount: result.updatedCount }
      } catch (error) {
        throw toMenuItemWriteError(error)
      }
    },
  }
}

export const menuItemsService = createMenuItemsService()
export type MenuItemsService = ReturnType<typeof createMenuItemsService>
