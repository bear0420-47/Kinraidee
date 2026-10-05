import { describe, expect, it } from 'vitest'

import { getImageFileError, MAX_IMAGE_BYTES } from './useImageUpload'

function file(type: string, size = 10) {
  return new File([new Uint8Array(size)], 'image', { type })
}

describe('getImageFileError', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s', (type) => {
    expect(getImageFileError(file(type))).toBeNull()
  })

  it.each(['image/gif', 'image/svg+xml', 'application/pdf', ''])(
    'rejects %o',
    (type) => {
      expect(getImageFileError(file(type))).toBe(
        'รองรับเฉพาะไฟล์ JPEG, PNG หรือ WebP',
      )
    },
  )

  it('accepts exactly 2 MiB and rejects one byte more', () => {
    expect(getImageFileError(file('image/png', MAX_IMAGE_BYTES))).toBeNull()
    expect(getImageFileError(file('image/png', MAX_IMAGE_BYTES + 1))).toBe(
      'ไฟล์รูปต้องมีขนาดไม่เกิน 2 MB',
    )
  })
})
