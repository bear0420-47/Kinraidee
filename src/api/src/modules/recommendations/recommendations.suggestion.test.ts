import { describe, expect, it } from 'vitest'

import type {
  BudgetRange,
  RecommendationConditions,
} from './recommendations.dto'
import {
  findSuggestion,
  matchesConditions,
  nearestBudgetRanges,
  priceInBudget,
  type CurrentRecords,
  type SuggestionOption,
  type SuggestionPoolItem,
} from './recommendations.suggestion'

function option(id: string, sortOrder = 0): SuggestionOption {
  return { id, nameTh: `th ${id}`, nameEn: `en ${id}`, sortOrder }
}

function item({
  price = 80,
  zone = 'zone_a',
  foodType = 'food_a',
  tastes = ['taste_a'],
}: {
  price?: number
  zone?: string
  foodType?: string
  tastes?: string[]
} = {}): SuggestionPoolItem {
  return {
    price,
    zone: option(zone),
    foodType: option(foodType),
    tastes: tastes.map((id) => option(id)),
  }
}

const allChosen: RecommendationConditions = {
  budget: 'BETWEEN_50_100',
  tasteId: 'taste_a',
  foodTypeId: 'food_a',
  zoneId: 'zone_a',
}

function current(conditions: RecommendationConditions): CurrentRecords {
  const record = (id: string | null) =>
    id ? { id, nameTh: `th ${id}`, nameEn: `en ${id}` } : null
  return {
    zone: record(conditions.zoneId),
    taste: record(conditions.tasteId),
    foodType: record(conditions.foodTypeId),
  }
}

function suggest(
  pool: SuggestionPoolItem[],
  conditions: RecommendationConditions = allChosen,
) {
  return findSuggestion(pool, conditions, current(conditions))
}

describe('budget helpers', () => {
  it('matches the same integer bounds as the database filter', () => {
    expect(priceInBudget(49, 'UNDER_50')).toBe(true)
    expect(priceInBudget(50, 'UNDER_50')).toBe(false)
    expect(priceInBudget(50, 'BETWEEN_50_100')).toBe(true)
    expect(priceInBudget(100, 'BETWEEN_50_100')).toBe(true)
    expect(priceInBudget(101, 'BETWEEN_101_200')).toBe(true)
    expect(priceInBudget(200, 'BETWEEN_101_200')).toBe(true)
    expect(priceInBudget(201, 'OVER_200')).toBe(true)
  })

  it('orders other ranges nearest first, higher before lower', () => {
    expect(nearestBudgetRanges('UNDER_50')).toEqual([
      'BETWEEN_50_100',
      'BETWEEN_101_200',
      'OVER_200',
    ])
    expect(nearestBudgetRanges('BETWEEN_50_100')).toEqual([
      'BETWEEN_101_200',
      'UNDER_50',
      'OVER_200',
    ])
    expect(nearestBudgetRanges('OVER_200')).toEqual([
      'BETWEEN_101_200',
      'BETWEEN_50_100',
      'UNDER_50',
    ])
  })
})

describe('findSuggestion', () => {
  it('returns null only for an empty pool', () => {
    expect(suggest([])).toBeNull()
  })

  it('changes the zone first when that alone works', () => {
    // Changing taste would also work, but zone comes first in the approved priority.
    const result = suggest([
      item({ zone: 'zone_b' }),
      item({ tastes: ['taste_b'] }),
    ])

    expect(result).toEqual({
      changes: [
        {
          field: 'zone',
          from: {
            type: 'ZONE',
            id: 'zone_a',
            label: { th: 'th zone_a', en: 'en zone_a' },
          },
          to: {
            type: 'ZONE',
            id: 'zone_b',
            label: { th: 'th zone_b', en: 'en zone_b' },
          },
        },
      ],
      conditions: { ...allChosen, zoneId: 'zone_b' },
      resultCount: 1,
    })
  })

  it('tries budget, then taste, then food type as single changes', () => {
    expect(
      suggest([item({ price: 150 }), item({ tastes: ['taste_b'] })])?.changes,
    ).toMatchObject([{ field: 'budget' }])
    expect(
      suggest([item({ tastes: ['taste_b'] }), item({ foodType: 'food_b' })])
        ?.changes,
    ).toMatchObject([{ field: 'taste' }])
    expect(suggest([item({ foodType: 'food_b' })])?.changes).toMatchObject([
      { field: 'foodType', to: { type: 'FOOD_TYPE', id: 'food_b' } },
    ])
  })

  it('moves the budget to the nearest range with results, up before down', () => {
    const upAndDown = suggest([item({ price: 30 }), item({ price: 150 })])
    expect(upAndDown?.conditions.budget).toBe('BETWEEN_101_200')

    const downOnly = suggest([item({ price: 30 }), item({ price: 300 })], {
      ...allChosen,
      budget: 'BETWEEN_101_200',
    })
    expect(downOnly?.changes).toEqual([
      {
        field: 'budget',
        from: {
          type: 'BUDGET_RANGE',
          id: 'BETWEEN_101_200',
          label: { th: '฿101–200', en: '฿101–200' },
        },
        to: {
          type: 'BUDGET_RANGE',
          id: 'OVER_200',
          label: { th: 'มากกว่า ฿200', en: 'Over ฿200' },
        },
      },
    ])

    const fromTop = suggest([item({ price: 30 })], {
      ...allChosen,
      budget: 'OVER_200',
    })
    expect(fromTop?.conditions.budget).toBe('UNDER_50')
  })

  it('picks the specific option with the most results, then display order', () => {
    const result = suggest([
      item({ zone: 'zone_b' }),
      item({ zone: 'zone_c' }),
      item({ zone: 'zone_c' }),
    ])
    expect(result?.conditions.zoneId).toBe('zone_c')
    expect(result?.resultCount).toBe(2)

    // Display order wins over the Thai name ("th zone_b" sorts before "th zone_z").
    const tie = suggest([
      { ...item(), zone: option('zone_b', 5) },
      { ...item(), zone: option('zone_z', 1) },
    ])
    expect(tie?.conditions.zoneId).toBe('zone_z')

    const nameTie = suggest([
      { ...item(), zone: option('zone_z', 1) },
      { ...item(), zone: option('zone_b', 1) },
    ])
    expect(nameTie?.conditions.zoneId).toBe('zone_b')
  })

  it('counts each taste of an item when choosing a taste', () => {
    const result = suggest([
      item({ tastes: ['taste_b', 'taste_c'] }),
      item({ tastes: ['taste_c'] }),
    ])
    expect(result?.conditions.tasteId).toBe('taste_c')
    expect(result?.resultCount).toBe(2)
  })

  it('never changes a field the user left as any', () => {
    const conditions = { ...allChosen, zoneId: null, tasteId: null }
    const result = suggest(
      [item({ foodType: 'food_b', zone: 'zone_z' })],
      conditions,
    )

    expect(result?.changes.map(({ field }) => field)).toEqual(['foodType'])
    expect(result?.conditions).toEqual({ ...conditions, foodTypeId: 'food_b' })
  })

  it('changes two fields when no single change works', () => {
    const result = suggest([item({ zone: 'zone_b', price: 150 })])

    expect(result?.changes.map(({ field }) => field)).toEqual([
      'zone',
      'budget',
    ])
    expect(result?.conditions).toEqual({
      ...allChosen,
      zoneId: 'zone_b',
      budget: 'BETWEEN_101_200',
    })
    expect(result?.resultCount).toBe(1)
  })

  it('changes every chosen field when the only item differs in all of them', () => {
    const result = suggest([
      item({
        zone: 'zone_b',
        price: 300,
        tastes: ['taste_b'],
        foodType: 'food_b',
      }),
    ])

    expect(result?.changes.map(({ field }) => field)).toEqual([
      'zone',
      'budget',
      'taste',
      'foodType',
    ])
    expect(result?.conditions).toEqual({
      budget: 'OVER_200',
      tasteId: 'taste_b',
      foodTypeId: 'food_b',
      zoneId: 'zone_b',
    })
  })
})

// A small seeded generator, so a failure always reproduces.
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

describe('findSuggestion guarantee', () => {
  const budgets: BudgetRange[] = [
    'UNDER_50',
    'BETWEEN_50_100',
    'BETWEEN_101_200',
    'OVER_200',
  ]

  it('always suggests conditions that match exactly resultCount items when any exist', () => {
    for (let run = 0; run < 300; run += 1) {
      const random = seeded(run + 1)
      const pick = <T>(values: readonly T[]) =>
        values[Math.floor(random() * values.length)]!
      const zones = ['zone_a', 'zone_b', 'zone_c']
      const foods = ['food_a', 'food_b', 'food_c']
      const tastes = ['taste_a', 'taste_b', 'taste_c', 'taste_d']
      const pool = Array.from({ length: 1 + Math.floor(random() * 6) }, () =>
        item({
          price: 1 + Math.floor(random() * 320),
          zone: pick(zones),
          foodType: pick(foods),
          tastes: [...new Set([pick(tastes), pick(tastes)])],
        }),
      )
      const conditions: RecommendationConditions = {
        budget: pick(budgets),
        tasteId: random() < 0.3 ? null : pick(tastes),
        foodTypeId: random() < 0.3 ? null : pick(foods),
        zoneId: random() < 0.3 ? null : pick(zones),
      }
      if (pool.some((entry) => matchesConditions(entry, conditions))) continue

      const result = suggest(pool, conditions)

      expect(result, `run ${run}`).not.toBeNull()
      const matching = pool.filter((entry) =>
        matchesConditions(entry, result!.conditions),
      )
      expect(matching.length, `run ${run}`).toBe(result!.resultCount)
      expect(result!.resultCount).toBeGreaterThan(0)
      // Only the listed fields changed, each from the user's value.
      for (const change of result!.changes) {
        expect(change.from.id).not.toBe(change.to.id)
      }
      if (conditions.zoneId === null)
        expect(result!.conditions.zoneId).toBeNull()
      if (conditions.tasteId === null)
        expect(result!.conditions.tasteId).toBeNull()
      if (conditions.foodTypeId === null) {
        expect(result!.conditions.foodTypeId).toBeNull()
      }
    }
  })
})
