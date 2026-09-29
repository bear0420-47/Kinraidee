import { describe, expect, it } from 'vitest'

import { duplicateNameError } from './duplicateNameError'

describe('duplicateNameError', () => {
  it('maps unique columns to request field paths', () => {
    expect(
      duplicateNameError('TASTE_NAME_ALREADY_EXISTS', 'taste', [
        'nameTh',
        'nameEn',
      ]),
    ).toMatchObject({
      status: 409,
      code: 'TASTE_NAME_ALREADY_EXISTS',
      message: 'Another taste already uses this name.',
      fields: {
        'name.th': 'Already used by another taste.',
        'name.en': 'Already used by another taste.',
      },
    })
  })

  it('falls back to the name field when the column is unknown', () => {
    expect(duplicateNameError('X', 'zone', ['other']).fields).toEqual({
      name: 'Already used by another zone.',
    })
  })
})
