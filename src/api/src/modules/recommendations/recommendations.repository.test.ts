import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  prisma: {
    taste: { findUnique: vi.fn() },
    foodType: { findUnique: vi.fn() },
    zone: { findUnique: vi.fn() },
    menuItem: { findMany: vi.fn(), count: vi.fn() },
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }))

import { recommendationsRepository } from './recommendations.repository'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('recommendations repository', () => {
  it('queries all mandatory filters, active records, and exclusions', async () => {
    mocks.prisma.menuItem.findMany.mockResolvedValue([])

    await recommendationsRepository.findCandidates(
      {
        budget: 'BETWEEN_50_100',
        tasteId: 'taste_1',
        foodTypeId: 'food_1',
        zoneId: 'zone_1',
      },
      ['rejected_1', 'displayed_1'],
    )

    expect(mocks.prisma.menuItem.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        price: { gte: 50, lte: 100 },
        foodTypeId: 'food_1',
        tastes: { some: { tasteId: 'taste_1' } },
        id: { notIn: ['rejected_1', 'displayed_1'] },
        restaurant: { deletedAt: null, zoneId: 'zone_1' },
      },
      include: {
        restaurant: { include: { zone: true } },
        foodType: true,
        tastes: { include: { taste: true } },
      },
    })
  })

  it('omits unrestricted optional filters and empty exclusions', async () => {
    mocks.prisma.menuItem.count.mockResolvedValue(0)

    await recommendationsRepository.countCandidates(
      {
        budget: 'OVER_200',
        tasteId: null,
        foodTypeId: null,
        zoneId: null,
      },
      [],
    )

    expect(mocks.prisma.menuItem.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        price: { gt: 200 },
        restaurant: { deletedAt: null },
      },
    })
  })

  it('loads only localized fields needed to validate selected masters', async () => {
    await Promise.all([
      recommendationsRepository.findTaste('taste_1'),
      recommendationsRepository.findFoodType('food_1'),
      recommendationsRepository.findZone('zone_1'),
    ])

    const expected = {
      where: expect.any(Object),
      select: { id: true, nameTh: true, nameEn: true },
    }
    expect(mocks.prisma.taste.findUnique).toHaveBeenCalledWith(expected)
    expect(mocks.prisma.foodType.findUnique).toHaveBeenCalledWith(expected)
    expect(mocks.prisma.zone.findUnique).toHaveBeenCalledWith(expected)
  })
})
