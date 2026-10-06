import { performance } from 'node:perf_hooks'
import { describe, expect, it, vi } from 'vitest'

import type { RecommendationCandidate } from './recommendations.dto'
import { createRecommendationsService } from './recommendations.service'

const zone = {
  id: 'zone_1',
  nameTh: 'โซนทดสอบ',
  nameEn: 'Test Zone',
  descriptionTh: null,
  descriptionEn: null,
  sortOrder: 0,
  createdAt: new Date('2026-09-30T00:00:00.000Z'),
  updatedAt: new Date('2026-09-30T00:00:00.000Z'),
}
const foodType = {
  id: 'food_1',
  nameTh: 'อาหารทดสอบ',
  nameEn: 'Test Food',
  icon: null,
  sortOrder: 0,
  createdAt: new Date('2026-09-30T00:00:00.000Z'),
  updatedAt: new Date('2026-09-30T00:00:00.000Z'),
}

function buildCandidate(index: number): RecommendationCandidate {
  const restaurantId = `restaurant_${index}`
  return {
    id: `menu_${index}`,
    restaurantId,
    foodTypeId: foodType.id,
    nameTh: `เมนู ${index}`,
    nameEn: `Menu ${index}`,
    descriptionTh: null,
    descriptionEn: null,
    price: 65,
    imageKey: null,
    imageUrl: null,
    deletedAt: null,
    createdAt: new Date('2026-09-30T00:00:00.000Z'),
    updatedAt: new Date('2026-09-30T00:00:00.000Z'),
    restaurant: {
      id: restaurantId,
      zoneId: zone.id,
      nameTh: `ร้าน ${index}`,
      nameEn: `Restaurant ${index}`,
      descriptionTh: null,
      descriptionEn: null,
      phone: null,
      imageKey: null,
      imageUrl: null,
      deletedAt: null,
      createdAt: new Date('2026-09-30T00:00:00.000Z'),
      updatedAt: new Date('2026-09-30T00:00:00.000Z'),
      zone,
    },
    foodType,
    tastes: [],
  }
}

describe('recommendation warm performance', () => {
  it('keeps warm service p95 below two seconds for 500 distinct Restaurants', async () => {
    const candidates = Array.from({ length: 500 }, (_, index) =>
      buildCandidate(index),
    )
    const repository = {
      findTaste: vi.fn(),
      findFoodType: vi.fn(),
      findZone: vi.fn(),
      findCandidates: vi.fn().mockResolvedValue(candidates),
      findSuggestionPool: vi.fn(),
    }
    const service = createRecommendationsService(repository as never)
    const input = {
      conditions: {
        budget: 'BETWEEN_50_100' as const,
        tasteId: null,
        foodTypeId: null,
        zoneId: null,
      },
      rejectedMenuItemIds: [],
      displayedMenuItemIds: [],
      count: 3 as const,
    }

    await service.recommend(input)
    const samples: number[] = []
    for (let sample = 0; sample < 30; sample += 1) {
      const startedAt = performance.now()
      await service.recommend(input)
      samples.push(performance.now() - startedAt)
    }
    samples.sort((left, right) => left - right)
    const p95 = samples[Math.ceil(samples.length * 0.95) - 1]

    expect(p95).toBeDefined()
    console.info(
      `Recommendation warm service p95: ${p95?.toFixed(2)} ms (30 samples, 500 Restaurants)`,
    )
    expect(p95).toBeLessThanOrEqual(2_000)
  })

  it('keeps the worst-case no-match suggestion p95 below two seconds for 500 items', async () => {
    // Every chosen filter misses the whole pool, so the search tries all 15 field sets.
    const option = (prefix: string, index: number) => ({
      id: `${prefix}_${index}`,
      nameTh: `${prefix} ${index}`,
      nameEn: `${prefix} ${index}`,
      sortOrder: index,
    })
    const pool = Array.from({ length: 500 }, (_, index) => ({
      price: 65 + (index % 150),
      zone: option('zone', index % 10),
      foodType: option('food', index % 6),
      tastes: [option('taste', index % 8), option('taste', (index + 3) % 8)],
    }))
    const missing = { id: 'missing', nameTh: 'ไม่มี', nameEn: 'None' }
    const repository = {
      findTaste: vi.fn().mockResolvedValue(missing),
      findFoodType: vi.fn().mockResolvedValue(missing),
      findZone: vi.fn().mockResolvedValue(missing),
      findCandidates: vi.fn().mockResolvedValue([]),
      findSuggestionPool: vi.fn().mockResolvedValue(pool),
    }
    const service = createRecommendationsService(repository as never)
    const input = {
      conditions: {
        budget: 'UNDER_50' as const,
        tasteId: 'missing',
        foodTypeId: 'missing',
        zoneId: 'missing',
      },
      rejectedMenuItemIds: [],
      displayedMenuItemIds: [],
      count: 3 as const,
    }

    const first = await service.recommend(input)
    expect(first.suggestion?.changes).toHaveLength(4)
    const samples: number[] = []
    for (let sample = 0; sample < 30; sample += 1) {
      const startedAt = performance.now()
      await service.recommend(input)
      samples.push(performance.now() - startedAt)
    }
    samples.sort((left, right) => left - right)
    const p95 = samples[Math.ceil(samples.length * 0.95) - 1]

    expect(p95).toBeDefined()
    console.info(
      `Recommendation no-match suggestion p95: ${p95?.toFixed(2)} ms (30 samples, 500 items)`,
    )
    expect(p95).toBeLessThanOrEqual(2_000)
  })
})
