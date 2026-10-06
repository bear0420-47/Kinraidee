import { describe, expect, it } from 'vitest'

import {
  EMPTY_PREFERENCE_MESSAGE,
  preferenceFormSchema,
  toConditionDefaults,
  toPreferenceFormValues,
} from './preferenceSchemas'

describe('preferenceFormSchema', () => {
  it('turns the form into the complete four-field body, with "no default" as null', () => {
    expect(
      preferenceFormSchema.parse({
        budget: 'UNDER_50',
        tasteId: '',
        foodTypeId: 'food_1',
        zoneId: '',
      }),
    ).toEqual({
      budget: 'UNDER_50',
      tasteId: null,
      foodTypeId: 'food_1',
      zoneId: null,
    })
  })

  it('keeps a saved "any" as ANY, so an all-"any" form is valid', () => {
    expect(
      preferenceFormSchema.parse({
        budget: '',
        tasteId: 'ANY',
        foodTypeId: 'ANY',
        zoneId: 'ANY',
      }),
    ).toEqual({
      budget: null,
      tasteId: 'ANY',
      foodTypeId: 'ANY',
      zoneId: 'ANY',
    })
  })

  it('rejects an all-empty form on the first field', () => {
    const result = preferenceFormSchema.safeParse(toPreferenceFormValues(null))

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        path: ['budget'],
        message: EMPTY_PREFERENCE_MESSAGE,
      }),
    ])
  })

  it('rejects an unknown budget', () => {
    expect(
      preferenceFormSchema.safeParse({
        ...toPreferenceFormValues(null),
        budget: 'FREE',
      }).success,
    ).toBe(false)
  })
})

describe('preference mapping', () => {
  const preference = {
    budget: 'BETWEEN_50_100' as const,
    tasteId: 'taste_1',
    foodTypeId: null,
    zoneId: 'zone_1',
  }

  it('fills the form from a saved preference', () => {
    expect(toPreferenceFormValues(preference)).toEqual({
      budget: 'BETWEEN_50_100',
      tasteId: 'taste_1',
      foodTypeId: '',
      zoneId: 'zone_1',
    })
  })

  it('turns a saved "any" into the flow\'s "any" answer (null)', () => {
    expect(
      toConditionDefaults({ ...preference, tasteId: 'ANY', zoneId: 'ANY' }),
    ).toEqual({ budget: 'BETWEEN_50_100', tasteId: null, zoneId: null })
  })

  it('leaves a field with no default unanswered in the meal flow, never "any"', () => {
    expect(toConditionDefaults(preference)).toEqual({
      budget: 'BETWEEN_50_100',
      tasteId: 'taste_1',
      zoneId: 'zone_1',
    })
    // Every "not set" field is left out, whichever condition it is.
    expect(
      toConditionDefaults({
        budget: 'UNDER_50',
        tasteId: null,
        foodTypeId: null,
        zoneId: null,
      }),
    ).toEqual({ budget: 'UNDER_50' })
    expect(toConditionDefaults(null)).toEqual({})
    expect(toConditionDefaults(undefined)).toEqual({})
  })
})
