import { isForeignKeyConstraintError } from '@/lib/prismaErrors'
import { menuItemNotFoundError } from '@/modules/menu-items/menu-items.helpers'
import {
  isAvailableMenuItem,
  menuItemUnavailableError,
} from '@/modules/menu-items/menu-items.summary'
import { toFavoriteItem, type FavoriteState } from './favorites.dto'
import {
  favoritesRepository,
  type FavoritesRepository,
} from './favorites.repository'

export function createFavoritesService(
  repository: FavoritesRepository = favoritesRepository,
) {
  // Every route needs the MenuItem to exist; only adding also needs it to be available.
  async function findMenuItem(menuItemId: string) {
    const menuItem = await repository.findMenuItemStatus(menuItemId)
    if (!menuItem) throw menuItemNotFoundError()
    return menuItem
  }

  // A MenuItem removed between the check and the insert fails its foreign key: still a 404.
  async function addingFavorite<T>(write: Promise<T>) {
    try {
      return await write
    } catch (error) {
      if (isForeignKeyConstraintError(error)) throw menuItemNotFoundError()
      throw error
    }
  }

  return {
    async list(userId: string) {
      const favorites = await repository.list(userId)
      return favorites.map(toFavoriteItem)
    },

    async favorite(userId: string, menuItemId: string): Promise<FavoriteState> {
      const menuItem = await findMenuItem(menuItemId)
      if (!isAvailableMenuItem(menuItem)) throw menuItemUnavailableError()
      await addingFavorite(repository.add({ userId, menuItemId }))
      return { menuItemId, favorited: true }
    },

    async unfavorite(
      userId: string,
      menuItemId: string,
    ): Promise<FavoriteState> {
      await findMenuItem(menuItemId)
      await repository.remove({ userId, menuItemId })
      return { menuItemId, favorited: false }
    },

    async toggle(userId: string, menuItemId: string): Promise<FavoriteState> {
      const menuItem = await findMenuItem(menuItemId)
      const favorited = await addingFavorite(
        repository.toggle({ userId, menuItemId }, () => {
          if (!isAvailableMenuItem(menuItem)) throw menuItemUnavailableError()
        }),
      )
      return { menuItemId, favorited }
    },
  }
}

export type FavoritesService = ReturnType<typeof createFavoritesService>

export const favoritesService = createFavoritesService()
