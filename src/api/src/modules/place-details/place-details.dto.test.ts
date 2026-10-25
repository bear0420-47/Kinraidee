import { describe, expect, it } from 'vitest'

import { parsePlaceDetailsRestaurantId } from './place-details.dto'

describe('place details DTO', () => {
  it('normalizes a valid restaurant ID', () => {
    expect(
      parsePlaceDetailsRestaurantId({ restaurantId: ' restaurant_1 ' }),
    ).toBe('restaurant_1')
  })

  it('rejects a blank restaurant ID', () => {
    expect(() => parsePlaceDetailsRestaurantId({ restaurantId: ' ' })).toThrow()
  })
})
