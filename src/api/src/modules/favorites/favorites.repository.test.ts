import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const tx = {
    favoriteMenuItem: { deleteMany: vi.fn(), createMany: vi.fn() },
  }
  return {
    tx,
    prisma: {
      $transaction: vi.fn(async (work: (client: typeof tx) => unknown) =>
        work(tx),
      ),
      favoriteMenuItem: {
        findMany: vi.fn(),
        createMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      menuItem: { findUnique: vi.fn() },
    },
  }
})

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }))

import { favoritesRepository } from './favorites.repository'

const key = { userId: 'user_1', menuItemId: 'menu_1' }
// `ON CONFLICT DO NOTHING`: a repeat or a simultaneous add never fails or resets `createdAt`.
const insertArgs = { data: [key], skipDuplicates: true }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Favorites repository', () => {
  it('lists only the user favorites, newest first, with a stable tie-break', async () => {
    await favoritesRepository.list('user_1')

    expect(mocks.prisma.favoriteMenuItem.findMany).toHaveBeenCalledWith({
      where: { userId: 'user_1' },
      include: { menuItem: { include: { restaurant: true } } },
      orderBy: [{ createdAt: 'desc' }, { menuItemId: 'asc' }],
    })
  })

  it('adds idempotently, keeping an existing favorite unchanged', async () => {
    await favoritesRepository.add(key)
    await favoritesRepository.add(key)

    expect(mocks.prisma.favoriteMenuItem.createMany).toHaveBeenCalledTimes(2)
    expect(mocks.prisma.favoriteMenuItem.createMany).toHaveBeenCalledWith(
      insertArgs,
    )
  })

  it('removes idempotently, whether or not the favorite exists', async () => {
    mocks.prisma.favoriteMenuItem.deleteMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 })

    await favoritesRepository.remove(key)
    await favoritesRepository.remove(key)

    expect(mocks.prisma.favoriteMenuItem.deleteMany).toHaveBeenNthCalledWith(
      2,
      { where: key },
    )
  })

  it('toggles a saved favorite off without checking availability', async () => {
    mocks.tx.favoriteMenuItem.deleteMany.mockResolvedValue({ count: 1 })
    const assertCanAdd = vi.fn()

    await expect(favoritesRepository.toggle(key, assertCanAdd)).resolves.toBe(
      false,
    )
    expect(assertCanAdd).not.toHaveBeenCalled()
    expect(mocks.tx.favoriteMenuItem.createMany).not.toHaveBeenCalled()
  })

  it('toggles an unsaved favorite on inside the same transaction', async () => {
    mocks.tx.favoriteMenuItem.deleteMany.mockResolvedValue({ count: 0 })
    const assertCanAdd = vi.fn()

    await expect(favoritesRepository.toggle(key, assertCanAdd)).resolves.toBe(
      true,
    )
    expect(mocks.prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(assertCanAdd).toHaveBeenCalledTimes(1)
    expect(mocks.tx.favoriteMenuItem.createMany).toHaveBeenCalledWith(
      insertArgs,
    )
  })

  it('does not add when the availability check fails', async () => {
    mocks.tx.favoriteMenuItem.deleteMany.mockResolvedValue({ count: 0 })

    await expect(
      favoritesRepository.toggle(key, () => {
        throw new Error('unavailable')
      }),
    ).rejects.toThrow('unavailable')
    expect(mocks.tx.favoriteMenuItem.createMany).not.toHaveBeenCalled()
  })
})
