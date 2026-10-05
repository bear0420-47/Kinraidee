import { describe, expect, it } from 'vitest'

import {
  parseCreateRestaurant,
  parseRestaurantListQuery,
  parseUpdateRestaurant,
  toRestaurantAuditSnapshot,
  toRestaurantCreateData,
  toRestaurantUpdateData,
  type RestaurantWithZone,
} from './restaurants.dto'

const localKey = '123e4567-e89b-42d3-a456-426614174000.webp'

const validBody = {
  zoneId: ' zone_1 ',
  name: { th: ' ร้านครัวไทย ', en: ' Thai Kitchen ' },
  description: { th: ' อาหารไทย ', en: ' Thai food ' },
  phone: ' 053-123-456 ',
  imageUrl: ' https://images.example.com/restaurant.webp ',
}

const restaurant: RestaurantWithZone = {
  id: 'restaurant_1',
  zoneId: 'zone_1',
  nameTh: 'ร้านครัวไทย',
  nameEn: 'Thai Kitchen',
  descriptionTh: 'อาหารไทย',
  descriptionEn: 'Thai food',
  phone: '053-123-456',
  imageKey: null,
  imageUrl: 'https://images.example.com/restaurant.webp',
  deletedAt: null,
  createdAt: new Date('2026-09-29T00:00:00.000Z'),
  updatedAt: new Date('2026-09-29T00:00:00.000Z'),
  zone: {
    id: 'zone_1',
    nameTh: 'หน้ามอ',
    nameEn: 'Front Gate',
    descriptionTh: null,
    descriptionEn: null,
    sortOrder: 0,
    createdAt: new Date('2026-09-29T00:00:00.000Z'),
    updatedAt: new Date('2026-09-29T00:00:00.000Z'),
  },
}

describe('Restaurant DTOs', () => {
  it('trims create fields and stores external images without imageKey', () => {
    const input = parseCreateRestaurant(validBody)

    expect(toRestaurantCreateData(input)).toEqual({
      zoneId: 'zone_1',
      nameTh: 'ร้านครัวไทย',
      nameEn: 'Thai Kitchen',
      descriptionTh: 'อาหารไทย',
      descriptionEn: 'Thai food',
      phone: '053-123-456',
      imageKey: null,
      imageUrl: 'https://images.example.com/restaurant.webp',
    })
  })

  it('normalizes empty optional strings to null', () => {
    const input = parseCreateRestaurant({
      zoneId: 'zone_1',
      name: { th: 'ร้าน', en: 'Restaurant' },
      phone: '  ',
      imageUrl: '',
    })

    expect(input.phone).toBeNull()
    expect(input.imageUrl).toBeNull()
  })

  it.each([
    ['empty Thai name', { ...validBody, name: { th: ' ', en: 'Valid' } }],
    ['invalid URL', { ...validBody, imageUrl: 'not-a-url' }],
    ['non-HTTP URL', { ...validBody, imageUrl: 'javascript:alert(1)' }],
    ['empty zone', { ...validBody, zoneId: ' ' }],
    ['unknown field', { ...validBody, rating: 5 }],
    [
      'local URL without its key',
      { ...validBody, imageUrl: `/uploads/${localKey}` },
    ],
    [
      'key with a different URL',
      { ...validBody, imageKey: localKey, imageUrl: '/uploads/other.webp' },
    ],
    ['non-generated key', { ...validBody, imageKey: 'local.jpg' }],
  ])('rejects %s', (_name, input) => {
    expect(() => parseCreateRestaurant(input)).toThrowError(
      expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR' }),
    )
  })

  it('stores a local upload key with its matching URL', () => {
    const input = parseCreateRestaurant({
      ...validBody,
      imageKey: localKey,
      imageUrl: `/uploads/${localKey}`,
    })

    expect(toRestaurantCreateData(input)).toMatchObject({
      imageKey: localKey,
      imageUrl: `/uploads/${localKey}`,
    })
    expect(
      toRestaurantUpdateData(
        parseUpdateRestaurant({
          imageKey: localKey,
          imageUrl: `/uploads/${localKey}`,
        }),
      ),
    ).toEqual({ imageKey: localKey, imageUrl: `/uploads/${localKey}` })
  })

  it('requires at least one update field and clears imageKey with imageUrl', () => {
    expect(() => parseUpdateRestaurant({})).toThrowError(
      expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR' }),
    )

    expect(
      toRestaurantUpdateData(
        parseUpdateRestaurant({ imageUrl: 'https://example.com/new.jpg' }),
      ),
    ).toEqual({
      imageKey: null,
      imageUrl: 'https://example.com/new.jpg',
    })
  })

  it('applies list defaults and accepts the maximum page size boundary', () => {
    expect(parseRestaurantListQuery({})).toEqual({
      includeDeleted: false,
      page: 1,
      pageSize: 20,
    })
    expect(
      parseRestaurantListQuery({
        includeDeleted: 'true',
        search: ' ครัว ',
        page: '2',
        pageSize: '100',
      }),
    ).toEqual({
      includeDeleted: true,
      search: 'ครัว',
      page: 2,
      pageSize: 100,
    })
  })

  it.each([
    { includeDeleted: 'yes' },
    { page: '0' },
    { pageSize: '101' },
    { zoneId: '' },
  ])('rejects invalid list query %#', (query) => {
    expect(() => parseRestaurantListQuery(query)).toThrowError(
      expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR' }),
    )
  })

  it('omits contact phone from audit snapshots', () => {
    const snapshot = toRestaurantAuditSnapshot(restaurant)

    expect(snapshot).not.toHaveProperty('phone')
    expect(snapshot).toMatchObject({
      zoneId: restaurant.zoneId,
      imageKey: restaurant.imageKey,
    })
  })
})
