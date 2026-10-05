import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  RecommendationCandidate,
  RecommendationRequest,
} from './recommendations.dto'
import { createRecommendationsService } from './recommendations.service'

const zone = {
  id: 'zone_1',
  nameTh: 'หน้ามอ',
  nameEn: 'Front Gate',
  descriptionTh: null,
  descriptionEn: null,
  sortOrder: 0,
  createdAt: new Date('2026-09-30T00:00:00.000Z'),
  updatedAt: new Date('2026-09-30T00:00:00.000Z'),
}
const restaurant = {
  id: 'restaurant_1',
  zoneId: zone.id,
  nameTh: 'ร้านอาหาร',
  nameEn: 'Restaurant',
  descriptionTh: null,
  descriptionEn: null,
  phone: null,
  imageKey: null,
  imageUrl: null,
  deletedAt: null,
  createdAt: new Date('2026-09-30T00:00:00.000Z'),
  updatedAt: new Date('2026-09-30T00:00:00.000Z'),
  zone,
}
const foodType = {
  id: 'food_1',
  nameTh: 'ข้าว',
  nameEn: 'Rice',
  icon: 'rice',
  sortOrder: 0,
  createdAt: new Date('2026-09-30T00:00:00.000Z'),
  updatedAt: new Date('2026-09-30T00:00:00.000Z'),
}
const taste = {
  id: 'taste_1',
  nameTh: 'เผ็ด',
  nameEn: 'Spicy',
  icon: 'flame',
  sortOrder: 0,
  createdAt: new Date('2026-09-30T00:00:00.000Z'),
  updatedAt: new Date('2026-09-30T00:00:00.000Z'),
}
const menuItem = {
  id: 'menu_1',
  restaurantId: restaurant.id,
  foodTypeId: foodType.id,
  nameTh: 'ข้าวกะเพรา',
  nameEn: 'Basil Rice',
  descriptionTh: null,
  descriptionEn: null,
  price: 65,
  imageKey: 'private-key.webp',
  imageUrl: 'https://images.example/menu.webp',
  deletedAt: null,
  createdAt: new Date('2026-09-30T00:00:00.000Z'),
  updatedAt: new Date('2026-09-30T00:00:00.000Z'),
  restaurant,
  foodType,
  tastes: [{ menuItemId: 'menu_1', tasteId: taste.id, taste }],
} satisfies RecommendationCandidate

const fullRequest: RecommendationRequest = {
  conditions: {
    budget: 'BETWEEN_50_100',
    tasteId: taste.id,
    foodTypeId: foodType.id,
    zoneId: zone.id,
  },
  rejectedMenuItemIds: [],
  displayedMenuItemIds: [],
  count: 3,
}

const repository = {
  findTaste: vi.fn(),
  findFoodType: vi.fn(),
  findZone: vi.fn(),
  findCandidates: vi.fn(),
  countCandidates: vi.fn(),
}

beforeEach(() => {
  vi.resetAllMocks()
  repository.findTaste.mockResolvedValue(taste)
  repository.findFoodType.mockResolvedValue(foodType)
  repository.findZone.mockResolvedValue(zone)
  repository.findCandidates.mockResolvedValue([menuItem])
})

describe('recommendations service', () => {
  it('rejects every unknown selected master-data ID with field details', async () => {
    repository.findTaste.mockResolvedValue(null)
    repository.findFoodType.mockResolvedValue(null)
    repository.findZone.mockResolvedValue(null)
    const service = createRecommendationsService(repository as never)

    await expect(service.recommend(fullRequest)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      fields: {
        'conditions.tasteId': 'Unknown taste ID.',
        'conditions.foodTypeId': 'Unknown food type ID.',
        'conditions.zoneId': 'Unknown zone ID.',
      },
    })
    expect(repository.findCandidates).not.toHaveBeenCalled()
  })

  it('normalizes overlap with rejected state taking precedence', async () => {
    const service = createRecommendationsService(repository as never)

    await service.recommend({
      ...fullRequest,
      rejectedMenuItemIds: ['menu_1', 'menu_2'],
      displayedMenuItemIds: ['menu_1', 'menu_3'],
    })

    expect(repository.findCandidates).toHaveBeenCalledWith(
      fullRequest.conditions,
      ['menu_1', 'menu_2', 'menu_3'],
    )
  })

  it('maps complete public card data without internal fields', async () => {
    const service = createRecommendationsService(repository as never)
    const result = await service.recommend(fullRequest)

    expect(result.items).toEqual([
      expect.objectContaining({
        id: 'menu_1',
        name: { th: 'ข้าวกะเพรา', en: 'Basil Rice' },
        restaurant: {
          id: 'restaurant_1',
          name: { th: 'ร้านอาหาร', en: 'Restaurant' },
        },
        zone: {
          id: 'zone_1',
          name: { th: 'หน้ามอ', en: 'Front Gate' },
        },
        rationale: {
          matchedBudget: true,
          matchedTaste: true,
          matchedFoodType: true,
          matchedZone: true,
        },
      }),
    ])
    expect(result.items[0]).not.toHaveProperty('imageKey')
    expect(result.items[0]).not.toHaveProperty('deletedAt')
    expect(result.items[0]?.restaurant).not.toHaveProperty('phone')
  })

  it('marks unrestricted rationale fields false without weakening filters', async () => {
    const service = createRecommendationsService(repository as never)
    const result = await service.recommend({
      ...fullRequest,
      conditions: {
        ...fullRequest.conditions,
        tasteId: null,
        foodTypeId: null,
        zoneId: null,
      },
    })

    expect(result.items[0]?.rationale).toEqual({
      matchedBudget: true,
      matchedTaste: false,
      matchedFoodType: false,
      matchedZone: false,
    })
    expect(repository.findTaste).not.toHaveBeenCalled()
    expect(repository.findFoodType).not.toHaveBeenCalled()
    expect(repository.findZone).not.toHaveBeenCalled()
  })

  it('returns the first working relaxation in Zone then Budget order', async () => {
    repository.findCandidates.mockResolvedValue([])
    repository.countCandidates.mockResolvedValueOnce(0).mockResolvedValueOnce(4)
    const service = createRecommendationsService(repository as never)
    const result = await service.recommend(fullRequest)

    expect(repository.countCandidates).toHaveBeenNthCalledWith(
      1,
      { ...fullRequest.conditions, zoneId: null },
      [],
    )
    expect(repository.countCandidates).toHaveBeenNthCalledWith(
      2,
      { ...fullRequest.conditions, budget: 'BETWEEN_101_200' },
      [],
    )
    expect(result.relaxation).toMatchObject({
      field: 'budget',
      from: { type: 'BUDGET_RANGE', id: 'BETWEEN_50_100' },
      to: { type: 'BUDGET_RANGE', id: 'BETWEEN_101_200' },
      resultCount: 4,
    })
    expect(repository.countCandidates).toHaveBeenCalledTimes(2)
  })

  it('tries Taste before FoodType after earlier relaxations fail', async () => {
    repository.findCandidates.mockResolvedValue([])
    repository.countCandidates
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(2)
    const service = createRecommendationsService(repository as never)
    const result = await service.recommend(fullRequest)

    expect(result.relaxation).toMatchObject({
      field: 'foodType',
      from: { type: 'FOOD_TYPE', id: foodType.id },
      to: { type: 'ANY_FOOD_TYPE', id: null },
      resultCount: 2,
    })
    expect(repository.countCandidates).toHaveBeenNthCalledWith(
      3,
      { ...fullRequest.conditions, tasteId: null },
      [],
    )
  })

  it('returns null when no single initial relaxation works', async () => {
    repository.findCandidates.mockResolvedValue([])
    repository.countCandidates.mockResolvedValue(0)
    const service = createRecommendationsService(repository as never)

    await expect(service.recommend(fullRequest)).resolves.toEqual({
      items: [],
      relaxation: null,
    })
  })

  it('never suggests relaxation for replacement requests', async () => {
    repository.findCandidates.mockResolvedValue([])
    const service = createRecommendationsService(repository as never)

    await expect(
      service.recommend({ ...fullRequest, count: 1 }),
    ).resolves.toEqual({ items: [], relaxation: null })
    expect(repository.countCandidates).not.toHaveBeenCalled()
  })
})
