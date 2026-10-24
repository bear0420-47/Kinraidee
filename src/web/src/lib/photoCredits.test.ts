import { describe, expect, it, vi } from 'vitest'

vi.mock('@/generated/photoCredits.json', () => ({
  default: {
    'https://images.pexels.com/photos/35049884/pexels-photo-35049884.jpeg': {
      creator: 'UNDO KIM',
      license: 'Pexels License',
      pageUrl: 'https://www.pexels.com/photo/food-35049884/',
      source: 'Pexels',
    },
  },
}))

import { creativeCommonsCredit, isStockPhoto } from './photoCredits'

describe('Pexels stock-photo presentation', () => {
  const url =
    'https://images.pexels.com/photos/35049884/pexels-photo-35049884.jpeg'

  it('marks the provider image as illustrative and exposes its attribution', () => {
    expect(isStockPhoto(url)).toBe(true)
    expect(creativeCommonsCredit(url)).toMatchObject({
      creator: 'UNDO KIM',
      license: 'Pexels License',
      source: 'Pexels',
    })
  })

  it('does not classify a lookalike host as a provider image', () => {
    expect(isStockPhoto('https://images.pexels.com.example.com/a.jpg')).toBe(
      false,
    )
    expect(creativeCommonsCredit('/uploads/own.jpg')).toBeNull()
  })
})
