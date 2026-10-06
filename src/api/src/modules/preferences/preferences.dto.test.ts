import { describe, expect, it } from 'vitest'

import {
  preferenceSchema,
  toPreference,
  toPreferenceRow,
  type Preference,
} from './preferences.dto'

const full = {
  budget: 'BETWEEN_50_100',
  zoneId: 'zone_1',
  foodTypeId: 'food_type_1',
  tasteId: 'taste_1',
}

describe('preferenceSchema', () => {
  it('accepts a full set of four fields', () => {
    expect(preferenceSchema.parse(full)).toEqual(full)
  })

  it('accepts null fields while at least one is set', () => {
    const partial = { ...full, budget: null, zoneId: null, tasteId: null }
    expect(preferenceSchema.parse(partial)).toEqual(partial)
  })

  it('accepts a saved "any" choice for taste, food type, and zone, even for all three', () => {
    const anyChoice = {
      budget: null,
      zoneId: 'ANY',
      foodTypeId: 'ANY',
      tasteId: 'ANY',
    }
    expect(preferenceSchema.parse(anyChoice)).toEqual(anyChoice)
  })

  it('rejects an all-null preference', () => {
    expect(
      preferenceSchema.safeParse({
        budget: null,
        zoneId: null,
        foodTypeId: null,
        tasteId: null,
      }).success,
    ).toBe(false)
  })

  it('requires all four fields, since PUT is a full replacement', () => {
    const { tasteId: _taste, ...missing } = full
    expect(preferenceSchema.safeParse(missing).success).toBe(false)
  })

  it.each([
    ['an unknown budget', { ...full, budget: 'FREE' }],
    ['"any" as a budget', { ...full, budget: 'ANY' }],
    ['a blank ID', { ...full, zoneId: '  ' }],
    ['a client-supplied user', { ...full, userId: 'user_2' }],
    ['allergy data', { ...full, allergies: ['peanut'] }],
    ['health data', { ...full, health: 'diabetic' }],
    ['religion data', { ...full, religion: 'none' }],
    ['rejected IDs', { ...full, rejectedMenuItemIds: ['menu_1'] }],
    ['a displayed shortlist', { ...full, displayedMenuItemIds: ['menu_1'] }],
  ])('rejects %s', (_, input) => {
    expect(preferenceSchema.safeParse(input).success).toBe(false)
  })
})

describe('preference storage mapping', () => {
  const preference: Preference = {
    budget: 'UNDER_50',
    zoneId: 'ANY',
    foodTypeId: null,
    tasteId: 'taste_1',
  }
  const row = {
    budget: 'UNDER_50' as const,
    zoneId: null,
    foodTypeId: null,
    tasteId: 'taste_1',
    zoneAny: true,
    foodTypeAny: false,
    tasteAny: false,
  }

  it('stores "any" as a flag and keeps record IDs in their columns', () => {
    expect(toPreferenceRow(preference)).toEqual(row)
  })

  it('reads a row back as the same four fields', () => {
    expect(toPreference(row)).toEqual(preference)
  })
})
