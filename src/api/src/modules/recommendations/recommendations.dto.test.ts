import { describe, expect, it } from 'vitest'

import { parseRecommendationRequest } from './recommendations.dto'

const validRequest = {
  conditions: {
    budget: 'BETWEEN_50_100',
    tasteId: null,
    foodTypeId: null,
    zoneId: null,
  },
  rejectedMenuItemIds: [],
  displayedMenuItemIds: [],
  count: 3,
}

describe('recommendation request DTO', () => {
  it.each(['UNDER_50', 'BETWEEN_50_100', 'BETWEEN_101_200', 'OVER_200'])(
    'accepts BudgetRange %s',
    (budget) => {
      expect(
        parseRecommendationRequest({
          ...validRequest,
          conditions: { ...validRequest.conditions, budget },
        }).conditions.budget,
      ).toBe(budget)
    },
  )

  it.each([1, 3])('accepts count %i', (count) => {
    expect(parseRecommendationRequest({ ...validRequest, count }).count).toBe(
      count,
    )
  })

  it('trims and deduplicates exclusion IDs', () => {
    const parsed = parseRecommendationRequest({
      ...validRequest,
      rejectedMenuItemIds: [' menu_1 ', 'menu_1', 'menu_2'],
    })

    expect(parsed.rejectedMenuItemIds).toEqual(['menu_1', 'menu_2'])
  })

  it.each([
    { ...validRequest, count: 2 },
    {
      ...validRequest,
      conditions: { ...validRequest.conditions, budget: 'CHEAP' },
    },
    { ...validRequest, rejectedMenuItemIds: [''] },
    { ...validRequest, displayedMenuItemIds: [123] },
    { ...validRequest, extra: true },
  ])('rejects malformed requests', (input) => {
    expect(() => parseRecommendationRequest(input)).toThrow(
      expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR' }),
    )
  })

  it('enforces the 500-ID boundary independently for each exclusion list', () => {
    expect(
      parseRecommendationRequest({
        ...validRequest,
        rejectedMenuItemIds: Array.from({ length: 500 }, (_, i) => `id_${i}`),
      }).rejectedMenuItemIds,
    ).toHaveLength(500)

    expect(() =>
      parseRecommendationRequest({
        ...validRequest,
        displayedMenuItemIds: Array.from({ length: 501 }, (_, i) => `id_${i}`),
      }),
    ).toThrow(expect.objectContaining({ status: 400 }))
  })
})
