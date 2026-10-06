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
  findSuggestionPool: vi.fn(),
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

  it('suggests a filter change from the pool when nothing matches', async () => {
    repository.findCandidates.mockResolvedValue([])
    const market = {
      id: 'zone_2',
      nameTh: 'ตลาด',
      nameEn: 'Market',
      sortOrder: 1,
    }
    repository.findSuggestionPool.mockResolvedValue([
      {
        price: 65,
        zone: market,
        foodType: { ...foodType },
        tastes: [{ ...taste }],
      },
    ])
    const service = createRecommendationsService(repository as never)
    const result = await service.recommend({
      ...fullRequest,
      rejectedMenuItemIds: ['menu_9'],
      displayedMenuItemIds: ['menu_8'],
    })

    expect(repository.findSuggestionPool).toHaveBeenCalledWith([
      'menu_9',
      'menu_8',
    ])
    expect(result).toEqual({
      items: [],
      suggestion: {
        changes: [
          {
            field: 'zone',
            from: {
              type: 'ZONE',
              id: zone.id,
              label: { th: 'หน้ามอ', en: 'Front Gate' },
            },
            to: {
              type: 'ZONE',
              id: 'zone_2',
              label: { th: 'ตลาด', en: 'Market' },
            },
          },
        ],
        conditions: { ...fullRequest.conditions, zoneId: 'zone_2' },
        resultCount: 1,
      },
    })
  })

  it('returns a null suggestion only when no item is available', async () => {
    repository.findCandidates.mockResolvedValue([])
    repository.findSuggestionPool.mockResolvedValue([])
    const service = createRecommendationsService(repository as never)

    await expect(service.recommend(fullRequest)).resolves.toEqual({
      items: [],
      suggestion: null,
    })
  })

  it('never suggests a change for replacement requests', async () => {
    repository.findCandidates.mockResolvedValue([])
    const service = createRecommendationsService(repository as never)

    await expect(
      service.recommend({ ...fullRequest, count: 1 }),
    ).resolves.toEqual({ items: [], suggestion: null })
    expect(repository.findSuggestionPool).not.toHaveBeenCalled()
  })

  it('does not load the suggestion pool when items match', async () => {
    const service = createRecommendationsService(repository as never)
    await service.recommend(fullRequest)

    expect(repository.findSuggestionPool).not.toHaveBeenCalled()
  })
})
