import { describe, expect, it } from 'vitest'

import { iconKeySchema } from './iconKey'

describe('iconKeySchema', () => {
  it.each([
    ['rice', 'rice'],
    ['bowl-food', 'bowl-food'],
    [' flame ', 'flame'],
    ['a'.repeat(50), 'a'.repeat(50)],
  ])('accepts %j', (input, expected) => {
    expect(iconKeySchema.parse(input)).toBe(expected)
  })

  it.each(['', '   ', null])('normalizes %j to null', (input) => {
    expect(iconKeySchema.parse(input)).toBeNull()
  })

  it.each([
    '<svg><path d="M0 0"/></svg>',
    '<img src=x onerror=alert(1)>',
    'https://icons.example/rice.svg',
    'data:image/svg+xml;base64,PHN2Zz4=',
    '{"name":"rice"}',
    'Rice',
    'bowl_food',
    'bowl--food',
    '-rice',
    'a'.repeat(51),
  ])('rejects %j', (input) => {
    expect(iconKeySchema.safeParse(input).success).toBe(false)
  })
})
