import { describe, expect, it } from 'vitest'
import { HttpError } from './httpError'

describe('HttpError', () => {
  it('keeps stable HTTP error details', () => {
    const error = new HttpError({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request.',
      fields: { budget: 'Budget is required.' },
    })

    expect(error.status).toBe(400)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.fields).toEqual({ budget: 'Budget is required.' })
  })
})
