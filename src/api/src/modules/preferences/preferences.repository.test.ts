import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  prisma: {
    userPreference: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    zone: { count: vi.fn() },
    foodType: { count: vi.fn() },
    taste: { count: vi.fn() },
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }))

import { preferencesRepository } from './preferences.repository'

const select = {
  budget: true,
  zoneId: true,
  foodTypeId: true,
  tasteId: true,
  zoneAny: true,
  foodTypeAny: true,
  tasteAny: true,
}
// Zone and taste name records; food type is a saved "any".
const row = {
  budget: 'UNDER_50' as const,
  zoneId: 'zone_1',
  foodTypeId: null,
  tasteId: 'taste_1',
  zoneAny: false,
  foodTypeAny: true,
  tasteAny: false,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Preferences repository', () => {
  it('reads only the preference fields and any flags', async () => {
    await preferencesRepository.find('user_1')

    expect(mocks.prisma.userPreference.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user_1' },
      select,
    })
  })

  it('checks only the IDs that are set', async () => {
    mocks.prisma.zone.count.mockResolvedValue(1)
    mocks.prisma.taste.count.mockResolvedValue(0)

    await expect(preferencesRepository.masterIdsExist(row)).resolves.toEqual({
      zoneId: true,
      foodTypeId: true,
      tasteId: false,
    })
    expect(mocks.prisma.zone.count).toHaveBeenCalledWith({
      where: { id: 'zone_1' },
    })
    expect(mocks.prisma.foodType.count).not.toHaveBeenCalled()
  })

  it('upserts one row per user, replacing every field', async () => {
    await preferencesRepository.upsert('user_1', row)

    expect(mocks.prisma.userPreference.upsert).toHaveBeenCalledWith({
      where: { userId: 'user_1' },
      create: { userId: 'user_1', ...row },
      update: row,
      select,
    })
  })

  it('clears idempotently, whether or not a preference exists', async () => {
    mocks.prisma.userPreference.deleteMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 })

    await preferencesRepository.remove('user_1')
    await preferencesRepository.remove('user_1')

    expect(mocks.prisma.userPreference.deleteMany).toHaveBeenNthCalledWith(2, {
      where: { userId: 'user_1' },
    })
  })
})
