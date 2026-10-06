import { Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RecommendationHistoryRepository } from './recommendation-history.repository'
import { createRecommendationHistoryService } from './recommendation-history.service'

const now = new Date('2026-10-07T00:00:00.000Z')
const deletedAt = new Date('2026-10-06T00:00:00.000Z')
const active = { deletedAt: null, restaurant: { deletedAt: null } }

const repository = {
  list: vi.fn(),
  findMenuItemStatus: vi.fn(),
  create: vi.fn(),
  clear: vi.fn(),
} as unknown as RecommendationHistoryRepository

const service = createRecommendationHistoryService(repository)

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(repository.findMenuItemStatus).mockResolvedValue(active as never)
  vi.mocked(repository.create).mockResolvedValue({
    id: 'history_1',
    menuItemId: 'menu_1',
    selectedAt: now,
  })
})

describe('Recommendation history service', () => {
  it('records a selection of an active MenuItem', async () => {
    await expect(service.record('user_1', 'menu_1')).resolves.toEqual({
      id: 'history_1',
      menuItemId: 'menu_1',
      selectedAt: '2026-10-07T00:00:00.000Z',
    })
    expect(repository.create).toHaveBeenCalledWith('user_1', 'menu_1')
  })

  it('records the same MenuItem twice as two selections', async () => {
    await service.record('user_1', 'menu_1')
    await service.record('user_1', 'menu_1')

    expect(repository.create).toHaveBeenCalledTimes(2)
  })

  it('returns 404 for an unknown MenuItem', async () => {
    vi.mocked(repository.findMenuItemStatus).mockResolvedValue(null)

    await expect(service.record('user_1', 'menu_x')).rejects.toMatchObject({
      status: 404,
      code: 'MENU_ITEM_NOT_FOUND',
    })
    expect(repository.create).not.toHaveBeenCalled()
  })

  it.each([
    ['a deleted MenuItem', { deletedAt, restaurant: { deletedAt: null } }],
    [
      'a MenuItem under a deleted Restaurant',
      { deletedAt: null, restaurant: { deletedAt } },
    ],
  ])('rejects %s with 409', async (_, status) => {
    vi.mocked(repository.findMenuItemStatus).mockResolvedValue(status as never)

    await expect(service.record('user_1', 'menu_1')).rejects.toMatchObject({
      status: 409,
      code: 'MENU_ITEM_UNAVAILABLE',
    })
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('returns 404 when the MenuItem disappears between the check and the insert', async () => {
    vi.mocked(repository.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Prisma error', {
        code: 'P2003',
        clientVersion: 'test',
      }),
    )

    await expect(service.record('user_1', 'menu_1')).rejects.toMatchObject({
      status: 404,
      code: 'MENU_ITEM_NOT_FOUND',
    })
  })

  it('lists a page of history with its metadata', async () => {
    vi.mocked(repository.list).mockResolvedValue({ items: [], total: 41 })

    await expect(
      service.list('user_1', { page: 3, pageSize: 20 }),
    ).resolves.toEqual({
      items: [],
      meta: { page: 3, pageSize: 20, total: 41 },
    })
    expect(repository.list).toHaveBeenCalledWith('user_1', {
      page: 3,
      pageSize: 20,
    })
  })

  it('clears the user history', async () => {
    await service.clear('user_1')

    expect(repository.clear).toHaveBeenCalledWith('user_1')
  })
})
