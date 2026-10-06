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
    mocks.prisma.menuItem.findMany.mockResolvedValue([])

    await recommendationsRepository.findCandidates(
      {
        budget: 'OVER_200',
        tasteId: null,
        foodTypeId: null,
        zoneId: null,
      },
      [],
    )

    expect(mocks.prisma.menuItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          price: { gt: 200 },
          restaurant: { deletedAt: null },
        },
      }),
    )
  })

  it('loads the suggestion pool with no condition filters and only matching fields', async () => {
    const option = (id: string) => ({
      id,
      nameTh: id,
      nameEn: id,
      sortOrder: 0,
    })
    mocks.prisma.menuItem.findMany.mockResolvedValue([
      {
        price: 120,
        foodType: option('food_1'),
        tastes: [{ taste: option('taste_1') }, { taste: option('taste_2') }],
        restaurant: { zone: option('zone_1') },
      },
    ])

    const pool = await recommendationsRepository.findSuggestionPool([
      'rejected_1',
    ])

    const optionSelect = {
      select: { id: true, nameTh: true, nameEn: true, sortOrder: true },
    }
    expect(mocks.prisma.menuItem.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        id: { notIn: ['rejected_1'] },
        restaurant: { deletedAt: null },
      },
      select: {
        price: true,
        foodType: optionSelect,
        tastes: { select: { taste: optionSelect } },
        restaurant: { select: { zone: optionSelect } },
      },
    })
    expect(pool).toEqual([
      {
        price: 120,
        zone: option('zone_1'),
        foodType: option('food_1'),
        tastes: [option('taste_1'), option('taste_2')],
      },
    ])
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
