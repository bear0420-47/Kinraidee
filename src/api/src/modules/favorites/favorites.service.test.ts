import { Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FavoriteWithMenuItem } from './favorites.dto'
import type { FavoritesRepository } from './favorites.repository'
import { createFavoritesService } from './favorites.service'

const now = new Date('2026-10-07T00:00:00.000Z')
const deletedAt = new Date('2026-10-06T00:00:00.000Z')
const active = { deletedAt: null, restaurant: { deletedAt: null } }

const repository = {
  list: vi.fn(),
  findMenuItemStatus: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  toggle: vi.fn(),
} as unknown as FavoritesRepository

const service = createFavoritesService(repository)

// Runs the toggle the way the repository does: remove if present, otherwise check and add.
function toggleWith(favorited: boolean) {
  vi.mocked(repository.toggle).mockImplementation(
    async (_key, assertCanAdd) => {
      if (favorited) return false
      assertCanAdd()
      return true
    },
  )
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(repository.findMenuItemStatus).mockResolvedValue(active as never)
})

describe('Favorites service', () => {
  it('lists the user favorites as summaries', async () => {
    const favorite = {
      userId: 'user_1',
      menuItemId: 'menu_1',
      createdAt: now,
      menuItem: {
        id: 'menu_1',
        nameTh: 'ข้าวกะเพรา',
        nameEn: 'Basil Rice',
        price: 65,
        imageUrl: null,
        deletedAt: null,
        restaurant: {
          id: 'restaurant_1',
          nameTh: 'ร้านอาหาร',
          nameEn: 'Restaurant',
          deletedAt,
        },
      },
    } as unknown as FavoriteWithMenuItem
    vi.mocked(repository.list).mockResolvedValue([favorite])

    const items = await service.list('user_1')

    expect(repository.list).toHaveBeenCalledWith('user_1')
    expect(items).toEqual([
      expect.objectContaining({ menuItemId: 'menu_1', available: false }),
    ])
  })

  it('favorites an active MenuItem', async () => {
    await expect(service.favorite('user_1', 'menu_1')).resolves.toEqual({
      menuItemId: 'menu_1',
      favorited: true,
    })
    expect(repository.add).toHaveBeenCalledWith({
      userId: 'user_1',
      menuItemId: 'menu_1',
    })
  })

  it.each([
    ['a deleted MenuItem', { deletedAt, restaurant: { deletedAt: null } }],
    [
      'a MenuItem under a deleted Restaurant',
      { deletedAt: null, restaurant: { deletedAt } },
    ],
  ])('does not newly favorite %s', async (_, status) => {
    vi.mocked(repository.findMenuItemStatus).mockResolvedValue(status as never)

    await expect(service.favorite('user_1', 'menu_1')).rejects.toMatchObject({
      status: 409,
      code: 'MENU_ITEM_UNAVAILABLE',
    })
    expect(repository.add).not.toHaveBeenCalled()
  })

  it('unfavorites an unavailable MenuItem', async () => {
    vi.mocked(repository.findMenuItemStatus).mockResolvedValue({
      deletedAt,
      restaurant: { deletedAt },
    } as never)

    await expect(service.unfavorite('user_1', 'menu_1')).resolves.toEqual({
      menuItemId: 'menu_1',
      favorited: false,
    })
    expect(repository.remove).toHaveBeenCalledWith({
      userId: 'user_1',
      menuItemId: 'menu_1',
    })
  })

  it.each(['favorite', 'unfavorite', 'toggle'] as const)(
    'returns 404 from %s for an unknown MenuItem without writing',
    async (action) => {
      vi.mocked(repository.findMenuItemStatus).mockResolvedValue(null)

      await expect(service[action]('user_1', 'menu_x')).rejects.toMatchObject({
        status: 404,
        code: 'MENU_ITEM_NOT_FOUND',
      })
      expect(repository.add).not.toHaveBeenCalled()
      expect(repository.remove).not.toHaveBeenCalled()
      expect(repository.toggle).not.toHaveBeenCalled()
    },
  )

  it('toggles an unsaved MenuItem on and a saved one off', async () => {
    toggleWith(false)
    await expect(service.toggle('user_1', 'menu_1')).resolves.toEqual({
      menuItemId: 'menu_1',
      favorited: true,
    })

    toggleWith(true)
    await expect(service.toggle('user_1', 'menu_1')).resolves.toEqual({
      menuItemId: 'menu_1',
      favorited: false,
    })
  })

  it('refuses a toggle that would add an unavailable MenuItem, but removes a saved one', async () => {
    vi.mocked(repository.findMenuItemStatus).mockResolvedValue({
      deletedAt,
      restaurant: { deletedAt: null },
    } as never)

    toggleWith(false)
    await expect(service.toggle('user_1', 'menu_1')).rejects.toMatchObject({
      status: 409,
      code: 'MENU_ITEM_UNAVAILABLE',
    })

    toggleWith(true)
    await expect(service.toggle('user_1', 'menu_1')).resolves.toEqual({
      menuItemId: 'menu_1',
      favorited: false,
    })
  })

  it('returns 404 when the MenuItem disappears between the check and the insert', async () => {
    const foreignKeyError = new Prisma.PrismaClientKnownRequestError(
      'Prisma error',
      { code: 'P2003', clientVersion: 'test' },
    )
    vi.mocked(repository.add).mockRejectedValue(foreignKeyError)
    vi.mocked(repository.toggle).mockRejectedValue(foreignKeyError)

    for (const action of ['favorite', 'toggle'] as const) {
      await expect(service[action]('user_1', 'menu_1')).rejects.toMatchObject({
        status: 404,
        code: 'MENU_ITEM_NOT_FOUND',
      })
    }
  })

  it('passes any other write error through unchanged', async () => {
    const failure = new Error('connection lost')
    vi.mocked(repository.add).mockRejectedValue(failure)

    await expect(service.favorite('user_1', 'menu_1')).rejects.toBe(failure)
  })
})
