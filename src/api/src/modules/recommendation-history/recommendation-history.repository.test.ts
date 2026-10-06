import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(async (queries: unknown[]) => Promise.all(queries)),
    recommendationHistory: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    menuItem: { findUnique: vi.fn() },
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }))

import { recommendationHistoryRepository } from './recommendation-history.repository'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Recommendation history repository', () => {
  it('pages only the user rows, newest first with a stable tie-break', async () => {
    mocks.prisma.recommendationHistory.findMany.mockResolvedValue([])
    mocks.prisma.recommendationHistory.count.mockResolvedValue(45)

    await expect(
      recommendationHistoryRepository.list('user_1', { page: 3, pageSize: 20 }),
    ).resolves.toEqual({ items: [], total: 45 })
    expect(mocks.prisma.recommendationHistory.findMany).toHaveBeenCalledWith({
      where: { userId: 'user_1' },
      include: { menuItem: { include: { restaurant: true } } },
      orderBy: [{ selectedAt: 'desc' }, { id: 'desc' }],
      skip: 40,
      take: 20,
    })
    expect(mocks.prisma.recommendationHistory.count).toHaveBeenCalledWith({
      where: { userId: 'user_1' },
    })
  })

  it('creates a new row for every selection, never deduplicating', async () => {
    await recommendationHistoryRepository.create('user_1', 'menu_1')
    await recommendationHistoryRepository.create('user_1', 'menu_1')

    expect(mocks.prisma.recommendationHistory.create).toHaveBeenCalledTimes(2)
    expect(mocks.prisma.recommendationHistory.create).toHaveBeenCalledWith({
      data: { userId: 'user_1', menuItemId: 'menu_1' },
      select: { id: true, menuItemId: true, selectedAt: true },
    })
  })

  it('clears only the user rows, idempotently', async () => {
    mocks.prisma.recommendationHistory.deleteMany
      .mockResolvedValueOnce({ count: 3 })
      .mockResolvedValueOnce({ count: 0 })

    await recommendationHistoryRepository.clear('user_1')
    await recommendationHistoryRepository.clear('user_1')

    expect(
      mocks.prisma.recommendationHistory.deleteMany,
    ).toHaveBeenNthCalledWith(2, { where: { userId: 'user_1' } })
  })
})
