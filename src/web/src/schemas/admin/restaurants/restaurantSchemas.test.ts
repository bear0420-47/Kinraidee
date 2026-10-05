import { describe, expect, it } from 'vitest'

import {
  defaultRestaurantFilters,
  getRestaurantChanges,
  restaurantFormSchema,
  toRestaurantFormValues,
  toRestaurantListQuery,
  type Restaurant,
  type RestaurantFormInput,
} from './restaurantSchemas'

const localKey = '123e4567-e89b-42d3-a456-426614174000.webp'

const restaurant: Restaurant = {
  id: 'restaurant_1',
  zoneId: 'zone_1',
  zone: { id: 'zone_1', name: { th: 'หน้ามอ', en: 'Front Gate' } },
  name: { th: 'ครัวไทย', en: 'Thai Kitchen' },
  description: null,
  phone: '053-123-456',
  imageKey: localKey,
  imageUrl: `/uploads/${localKey}`,
  deletedAt: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
}

const validInput: RestaurantFormInput = {
  zoneId: 'zone_1',
  nameTh: ' ครัวไทย ',
  nameEn: ' Thai Kitchen ',
  descriptionTh: '',
  descriptionEn: '',
  phone: '  ',
  imageMode: 'none',
  imageUrl: '',
  uploadedImage: null,
}

function issues(input: Partial<RestaurantFormInput>) {
  const result = restaurantFormSchema.safeParse({ ...validInput, ...input })
  if (result.success) throw new Error('Expected validation to fail.')
  return result.error.issues.map((issue) => [issue.path[0], issue.message])
}

describe('restaurantFormSchema', () => {
  it('trims text, turns an empty phone into null, and sends no image', () => {
    expect(restaurantFormSchema.parse(validInput)).toEqual({
      zoneId: 'zone_1',
      name: { th: 'ครัวไทย', en: 'Thai Kitchen' },
      description: null,
      phone: null,
      imageKey: null,
      imageUrl: null,
    })
  })

  it('requires a Zone and both localized names', () => {
    expect(issues({ zoneId: '', nameTh: ' ', nameEn: '' })).toEqual([
      ['zoneId', 'กรุณาเลือกโซน'],
      ['nameTh', 'กรุณากรอกชื่อภาษาไทย'],
      ['nameEn', 'กรุณากรอกชื่อภาษาอังกฤษ'],
    ])
  })

  it('requires both description languages or neither', () => {
    expect(issues({ descriptionTh: 'อาหารไทย' })).toEqual([
      [
        'descriptionEn',
        'กรุณากรอกคำอธิบายทั้งภาษาไทยและภาษาอังกฤษ หรือเว้นว่างทั้งสองช่อง',
      ],
    ])
  })

  it('sends an external URL with imageKey null', () => {
    const body = restaurantFormSchema.parse({
      ...validInput,
      imageMode: 'url',
      imageUrl: ' https://images.example.com/shop.jpg ',
      // A leftover upload from switching modes is ignored.
      uploadedImage: { key: localKey, url: `/uploads/${localKey}` },
    })
    expect(body).toMatchObject({
      imageKey: null,
      imageUrl: 'https://images.example.com/shop.jpg',
    })
  })

  it.each([
    ['', 'กรุณากรอก URL รูปภาพ'],
    ['not a url', 'URL รูปภาพต้องขึ้นต้นด้วย http:// หรือ https://'],
    ['javascript:alert(1)', 'URL รูปภาพต้องขึ้นต้นด้วย http:// หรือ https://'],
    [
      'ftp://images.example.com/a.jpg',
      'URL รูปภาพต้องขึ้นต้นด้วย http:// หรือ https://',
    ],
  ])('rejects the external URL %o', (imageUrl, message) => {
    expect(issues({ imageMode: 'url', imageUrl })).toEqual([
      ['imageUrl', message],
    ])
  })

  it('sends an uploaded image as its key and URL, and requires one in upload mode', () => {
    expect(
      restaurantFormSchema.parse({
        ...validInput,
        imageMode: 'upload',
        uploadedImage: { key: localKey, url: `/uploads/${localKey}` },
      }),
    ).toMatchObject({ imageKey: localKey, imageUrl: `/uploads/${localKey}` })
    expect(issues({ imageMode: 'upload' })).toEqual([
      ['uploadedImage', 'กรุณาเลือกรูปเพื่ออัปโหลด'],
    ])
  })
})

describe('toRestaurantFormValues', () => {
  it('starts a new restaurant with no image', () => {
    expect(toRestaurantFormValues()).toEqual({
      zoneId: '',
      nameTh: '',
      nameEn: '',
      descriptionTh: '',
      descriptionEn: '',
      phone: '',
      imageMode: 'none',
      imageUrl: '',
      uploadedImage: null,
    })
  })

  it('picks the image mode from the stored image', () => {
    expect(toRestaurantFormValues(restaurant)).toMatchObject({
      imageMode: 'upload',
      imageUrl: '',
      uploadedImage: { key: localKey, url: `/uploads/${localKey}` },
    })
    expect(
      toRestaurantFormValues({
        ...restaurant,
        imageKey: null,
        imageUrl: 'https://images.example.com/shop.jpg',
      }),
    ).toMatchObject({
      imageMode: 'url',
      imageUrl: 'https://images.example.com/shop.jpg',
      uploadedImage: null,
    })
  })
})

describe('getRestaurantChanges', () => {
  const unchanged = restaurantFormSchema.parse(
    toRestaurantFormValues(restaurant),
  )

  it('returns null when nothing changed', () => {
    expect(getRestaurantChanges(restaurant, unchanged)).toBeNull()
  })

  it('sends only changed fields, and the image key and URL together', () => {
    expect(
      getRestaurantChanges(restaurant, {
        ...unchanged,
        phone: null,
        imageKey: null,
        imageUrl: 'https://images.example.com/shop.jpg',
      }),
    ).toEqual({
      phone: null,
      imageKey: null,
      imageUrl: 'https://images.example.com/shop.jpg',
    })
  })
})

describe('toRestaurantListQuery', () => {
  it('sends only active filters with the fixed page size', () => {
    expect(toRestaurantListQuery(defaultRestaurantFilters)).toEqual({
      page: 1,
      pageSize: 20,
    })
    expect(
      toRestaurantListQuery({
        page: 3,
        search: ' ครัว ',
        zoneId: 'zone_1',
        includeDeleted: true,
      }),
    ).toEqual({
      page: 3,
      pageSize: 20,
      search: 'ครัว',
      zoneId: 'zone_1',
      includeDeleted: 'true',
    })
  })
})
