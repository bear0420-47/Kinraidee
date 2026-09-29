import { describe, expect, it } from 'vitest'

import { parseUploadFileName, parseUploadedImage } from './uploads.dto'

const generatedFileName = '123e4567-e89b-42d3-a456-426614174000.webp'

describe('upload DTOs', () => {
  it('accepts generated image keys', () => {
    expect(parseUploadFileName({ fileName: generatedFileName })).toBe(
      generatedFileName,
    )
  })

  it.each([
    '../secret.jpg',
    '..%2Fsecret.jpg',
    '123e4567-e89b-42d3-a456-426614174000.svg',
    'original-file.jpg',
  ])('rejects unsafe or non-generated key %s', (fileName) => {
    expect(() => parseUploadFileName({ fileName })).toThrowError(
      expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR' }),
    )
  })

  it('requires an uploaded file', () => {
    expect(() => parseUploadedImage(undefined)).toThrowError(
      expect.objectContaining({ status: 400, code: 'UPLOAD_REQUIRED' }),
    )
  })
})
