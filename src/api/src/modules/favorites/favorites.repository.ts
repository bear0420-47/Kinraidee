import { prisma } from '@/lib/prisma'
import { favoriteWithMenuItem } from './favorites.dto'

type FavoriteKey = { userId: string; menuItemId: string }

export const favoritesRepository = {
  list(userId: string) {
    return prisma.favoriteMenuItem.findMany({
      where: { userId },
      include: favoriteWithMenuItem.include,
      orderBy: [{ createdAt: 'desc' }, { menuItemId: 'asc' }],
    })
  },

  findMenuItemStatus(menuItemId: string) {
    return prisma.menuItem.findUnique({
      where: { id: menuItemId },
      select: { deletedAt: true, restaurant: { select: { deletedAt: true } } },
    })
  },

  // Idempotent and race-safe (`ON CONFLICT DO NOTHING`): an existing favorite keeps its
  // original `createdAt`, and two simultaneous adds never collide on the composite key.
  add(key: FavoriteKey) {
    return prisma.favoriteMenuItem.createMany({
      data: [key],
      skipDuplicates: true,
    })
  },

  // Idempotent: removing a favorite that does not exist changes nothing.
  remove({ userId, menuItemId }: FavoriteKey) {
    return prisma.favoriteMenuItem.deleteMany({ where: { userId, menuItemId } })
  },

  // Removes the favorite when it exists, otherwise adds it once `assertCanAdd` passes. The
  // read and write share one transaction, so a toggle never sees half of another one.
  toggle({ userId, menuItemId }: FavoriteKey, assertCanAdd: () => void) {
    return prisma.$transaction(async (tx) => {
      const { count } = await tx.favoriteMenuItem.deleteMany({
        where: { userId, menuItemId },
      })
      if (count > 0) return false

      assertCanAdd()
      await tx.favoriteMenuItem.createMany({
        data: [{ userId, menuItemId }],
        skipDuplicates: true,
      })
      return true
    })
  },
}

export type FavoritesRepository = typeof favoritesRepository
