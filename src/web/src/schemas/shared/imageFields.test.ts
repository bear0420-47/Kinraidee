import { describe, expect, it } from 'vitest'

import {
  getImageChange,
  isHttpImageUrl,
  toImageBody,
  toImageFormValues,
} from './imageFields'

const key = '123e4567-e89b-42d3-a456-426614174000.webp'

describe('isHttpImageUrl', () => {
  it.each(['https://images.example.com/a.jpg', 'HTTP://example.com/a.png'])(
    'accepts %s',
    (url) => {
      expect(isHttpImageUrl(url)).toBe(true)
    },
  )

  it.each([
    'images.example.com/a.jpg',
    'ftp://example.com/a.jpg',
    'https://',
    '',
  ])('rejects %o', (url) => {
    expect(isHttpImageUrl(url)).toBe(false)
  })
})

describe('toImageFormValues', () => {
  it('picks the image mode from the stored reference', () => {
    expect(toImageFormValues()).toEqual({
      imageMode: 'none',
      imageUrl: '',
      uploadedImage: null,
    })
    expect(
      toImageFormValues({ imageKey: null, imageUrl: 'https://x.test/a.jpg' }),
    ).toEqual({
      imageMode: 'url',
      imageUrl: 'https://x.test/a.jpg',
      uploadedImage: null,
    })
    expect(
      toImageFormValues({ imageKey: key, imageUrl: `/uploads/${key}` }),
    ).toEqual({
      imageMode: 'upload',
      imageUrl: '',
      uploadedImage: { key, url: `/uploads/${key}` },
    })
  })
})

describe('toImageBody', () => {
  it('sends only the active source', () => {
    const uploadedImage = { key, url: `/uploads/${key}` }

    expect(
      toImageBody({
        imageMode: 'none',
        imageUrl: 'https://x.test',
        uploadedImage,
      }),
    ).toEqual({ imageKey: null, imageUrl: null })
    expect(
      toImageBody({
        imageMode: 'url',
        imageUrl: 'https://x.test',
        uploadedImage,
      }),
    ).toEqual({ imageKey: null, imageUrl: 'https://x.test' })
    expect(
      toImageBody({
        imageMode: 'upload',
        imageUrl: 'https://x.test',
        uploadedImage,
      }),
    ).toEqual({ imageKey: key, imageUrl: `/uploads/${key}` })
  })
})

describe('getImageChange', () => {
  it('returns the key and URL together only when either changed', () => {
    const stored = { imageKey: key, imageUrl: `/uploads/${key}` }

    expect(getImageChange(stored, stored)).toBeNull()
    expect(
      getImageChange(stored, { imageKey: null, imageUrl: 'https://x.test' }),
    ).toEqual({ imageKey: null, imageUrl: 'https://x.test' })
    expect(getImageChange(stored, {})).toEqual({
      imageKey: null,
      imageUrl: null,
    })
  })
})
