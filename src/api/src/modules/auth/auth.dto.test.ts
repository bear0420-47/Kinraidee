import { describe, expect, it } from 'vitest'

import { parseAuthCredentials } from './auth.dto'

describe('auth credentials', () => {
  it('normalizes email and trims password', () => {
    expect(
      parseAuthCredentials({
        email: ' User@Example.COM ',
        password: ' password8 ',
      }),
    ).toEqual({ email: 'user@example.com', password: 'password8' })
  })

  it.each([
    [{ email: 'invalid', password: 'password8' }, 'email'],
    [{ email: 'user@example.com', password: '1234567' }, 'password'],
    [
      { email: 'user@example.com', password: 'password8', role: 'ADMIN' },
      'body',
    ],
  ])('rejects invalid credentials %#', (input, field) => {
    expect(() => parseAuthCredentials(input)).toThrowError(
      expect.objectContaining({
        status: 400,
        code: 'VALIDATION_ERROR',
        fields: expect.objectContaining({ [field]: expect.any(String) }),
      }),
    )
  })

  it.each(['12345678', ' 12345678 '])(
    'accepts the 8-character boundary: %s',
    (password) => {
      expect(
        parseAuthCredentials({ email: 'user@example.com', password }).password,
      ).toBe('12345678')
    },
  )
})
