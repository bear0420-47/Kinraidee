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
      countCandidates: vi.fn(),
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
})
