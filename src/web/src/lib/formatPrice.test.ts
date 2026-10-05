import { describe, expect, it } from 'vitest'

import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('shows whole baht with Thai digit grouping', () => {
    expect(formatPrice(50)).toBe('฿50')
    expect(formatPrice(1250)).toBe('฿1,250')
  })
})
