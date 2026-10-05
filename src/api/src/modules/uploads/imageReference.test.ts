import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
  imageReferenceFields,
  toImageReferenceCreateData,
  toImageReferenceUpdateData,
  validateImageReference,
} from './imageReference'

const localKey = '123e4567-e89b-42d3-a456-426614174000.webp'

const schema = z
  .object(imageReferenceFields)
  .strict()
  .superRefine(validateImageReference)

function firstIssue(input: unknown) {
  const result = schema.safeParse(input)
  if (result.success) throw new Error('Expected validation to fail.')
  const [issue] = result.error.issues
  return { path: issue?.path.join('.'), message: issue?.message }
}

describe('image reference rule', () => {
  it.each([
    [{}, {}],
    [
      { imageKey: null, imageUrl: null },
      { imageKey: null, imageUrl: null },
    ],
    [{ imageUrl: '  ' }, { imageUrl: null }],
    [
      { imageUrl: ' https://images.example.com/a.jpg ' },
      { imageUrl: 'https://images.example.com/a.jpg' },
    ],
    [
      { imageKey: localKey, imageUrl: `/uploads/${localKey}` },
      { imageKey: localKey, imageUrl: `/uploads/${localKey}` },
    ],
  ])('accepts %o', (input, expected) => {
    expect(schema.parse(input)).toEqual(expected)
  })

  it.each([
    [{ imageUrl: 'javascript:alert(1)' }, 'imageUrl'],
    [{ imageUrl: 'ftp://images.example.com/a.jpg' }, 'imageUrl'],
    [{ imageKey: 'photo.jpg', imageUrl: '/uploads/photo.jpg' }, 'imageKey'],
    [{ imageKey: localKey }, 'imageUrl'],
    [{ imageKey: localKey, imageUrl: '/uploads/other.webp' }, 'imageUrl'],
    [
      { imageKey: localKey, imageUrl: 'https://images.example.com/a.jpg' },
      'imageUrl',
    ],
    [{ imageUrl: `/uploads/${localKey}` }, 'imageKey'],
    [{ imageKey: null, imageUrl: `/uploads/${localKey}` }, 'imageKey'],
  ])('rejects %o on %s', (input, path) => {
    expect(firstIssue(input).path).toBe(path)
  })
})

describe('image reference data', () => {
  it('always sets both columns on create', () => {
    expect(toImageReferenceCreateData({})).toEqual({
      imageKey: null,
      imageUrl: null,
    })
    expect(
      toImageReferenceCreateData({
        imageKey: localKey,
        imageUrl: `/uploads/${localKey}`,
      }),
    ).toEqual({ imageKey: localKey, imageUrl: `/uploads/${localKey}` })
  })

  it('leaves both columns alone on update when imageUrl is not sent', () => {
    expect(toImageReferenceUpdateData({})).toEqual({})
  })

  it('sets a local upload key with its URL on update', () => {
    expect(
      toImageReferenceUpdateData({
        imageKey: localKey,
        imageUrl: `/uploads/${localKey}`,
      }),
    ).toEqual({ imageKey: localKey, imageUrl: `/uploads/${localKey}` })
  })

  it('clears the key for an external URL or a removed image', () => {
    expect(
      toImageReferenceUpdateData({
        imageUrl: 'https://images.example.com/a.jpg',
      }),
    ).toEqual({ imageKey: null, imageUrl: 'https://images.example.com/a.jpg' })
    expect(toImageReferenceUpdateData({ imageUrl: null })).toEqual({
      imageKey: null,
      imageUrl: null,
    })
  })
})
