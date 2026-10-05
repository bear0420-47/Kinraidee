import { describe, expect, it } from 'vitest'

import {
  budgetOptions,
  firstOpenStep,
  isCompleteConditions,
  storedFlowSchema,
  withKnownIds,
} from './recommendationSchemas'

describe('budgetOptions', () => {
  it('maps the approved labels to the API values in order', () => {
    expect(budgetOptions).toEqual([
      { value: 'UNDER_50', label: 'ไม่เกิน ฿50' },
      { value: 'BETWEEN_50_100', label: '฿50–100' },
      { value: 'BETWEEN_101_200', label: '฿101–200' },
      { value: 'OVER_200', label: 'มากกว่า ฿200' },
    ])
  })
})

describe('storedFlowSchema', () => {
  it('accepts a partial draft with "any" stored as null', () => {
    const flow = {
      step: 'zone',
      conditions: { budget: 'UNDER_50', tasteId: null, foodTypeId: 'food_1' },
    }
    expect(storedFlowSchema.parse(flow)).toEqual(flow)
  })

  it.each([
    ['an extra top-level key', { step: 'budget', conditions: {}, token: 'x' }],
    [
      'an extra condition key',
      { step: 'budget', conditions: { allergy: 'nuts' } },
    ],
    ['an unknown step', { step: 'cards', conditions: {} }],
    ['an unknown budget', { step: 'budget', conditions: { budget: 'FREE' } }],
    ['an empty ID', { step: 'taste', conditions: { tasteId: '' } }],
  ])('rejects %s', (_, value) => {
    expect(storedFlowSchema.safeParse(value).success).toBe(false)
  })
})

describe('condition helpers', () => {
  const complete = {
    budget: 'OVER_200',
    tasteId: null,
    foodTypeId: 'food_1',
    zoneId: 'zone_1',
  } as const

  it('treats null as answered and a missing field as unanswered', () => {
    expect(isCompleteConditions(complete)).toBe(true)
    expect(isCompleteConditions({ ...complete, zoneId: undefined })).toBe(false)
    expect(firstOpenStep({ budget: 'UNDER_50' })).toBe('taste')
    expect(firstOpenStep(complete)).toBe('summary')
  })

  it('drops stored IDs that no longer exist, keeping null and known IDs', () => {
    expect(
      withKnownIds(
        { ...complete, tasteId: 'taste_gone', zoneId: 'zone_gone' },
        { tasteIds: ['taste_1'], foodTypeIds: ['food_1'], zoneIds: [] },
      ),
    ).toEqual({ budget: 'OVER_200', foodTypeId: 'food_1' })
    expect(
      withKnownIds(complete, {
        tasteIds: [],
        foodTypeIds: ['food_1'],
        zoneIds: ['zone_1'],
      }),
    ).toEqual(complete)
  })
})
