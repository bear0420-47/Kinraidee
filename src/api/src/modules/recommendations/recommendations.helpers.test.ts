import { describe, expect, it } from 'vitest'

import type { RecommendationCandidate } from './recommendations.dto'
import {
  budgetWhere,
  nextBudgetRange,
  selectDiverseCandidates,
} from './recommendations.helpers'

function candidate(id: string, restaurantId: string) {
  return { id, restaurantId } as RecommendationCandidate
}

describe('recommendation helpers', () => {
  it('maps every budget range to exact integer boundaries', () => {
    expect(budgetWhere('UNDER_50')).toEqual({ lt: 50 })
    expect(budgetWhere('BETWEEN_50_100')).toEqual({ gte: 50, lte: 100 })
    expect(budgetWhere('BETWEEN_101_200')).toEqual({ gte: 101, lte: 200 })
    expect(budgetWhere('OVER_200')).toEqual({ gt: 200 })
  })

  it('moves budget up exactly one range and stops after OVER_200', () => {
    expect(nextBudgetRange('UNDER_50')).toBe('BETWEEN_50_100')
    expect(nextBudgetRange('BETWEEN_50_100')).toBe('BETWEEN_101_200')
    expect(nextBudgetRange('BETWEEN_101_200')).toBe('OVER_200')
    expect(nextBudgetRange('OVER_200')).toBeNull()
  })

  it('fills distinct Restaurants before repeating one', () => {
    const selected = selectDiverseCandidates(
      [
        candidate('a1', 'a'),
        candidate('a2', 'a'),
        candidate('b1', 'b'),
        candidate('c1', 'c'),
      ],
      3,
      () => 0.5,
    )

    expect(selected).toHaveLength(3)
    expect(new Set(selected.map(({ restaurantId }) => restaurantId)).size).toBe(
      3,
    )
    expect(new Set(selected.map(({ id }) => id)).size).toBe(3)
  })

  it('uses another MenuItem from a represented Restaurant only when needed', () => {
    const selected = selectDiverseCandidates(
      [candidate('a1', 'a'), candidate('a2', 'a'), candidate('b1', 'b')],
      3,
      () => 0.5,
    )

    expect(selected).toHaveLength(3)
    expect(new Set(selected.map(({ restaurantId }) => restaurantId)).size).toBe(
      2,
    )
    expect(new Set(selected.map(({ id }) => id)).size).toBe(3)
  })

  it('never exceeds the requested count', () => {
    expect(
      selectDiverseCandidates([candidate('a1', 'a'), candidate('b1', 'b')], 1),
    ).toHaveLength(1)
  })

  it('returns fewer than three when only two candidates qualify', () => {
    expect(
      selectDiverseCandidates([candidate('a1', 'a'), candidate('b1', 'b')], 3),
    ).toHaveLength(2)
  })
})
