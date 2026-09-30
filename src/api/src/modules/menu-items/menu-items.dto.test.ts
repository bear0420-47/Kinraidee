import { describe, expect, it } from 'vitest'

import {
  parseBulkMenuItems,
  parseCreateMenuItem,
  parseMenuItemListQuery,
  parseUpdateMenuItem,
  toAdminMenuItem,
  toMenuItemCreateData,
  toMenuItemUpdateData,
  type MenuItemWithRelations,
} from './menu-items.dto'

const localKey = '123e4567-e89b-42d3-a456-426614174000.jpg'
const validBody = {
  restaurantId: ' restaurant_1 ',
  foodTypeId: ' food_type_1 ',
  tasteIds: [' taste_2 ', 'taste_1', 'taste_2'],
  name: { th: ' ข้าวกะเพรา ', en: ' Basil Rice ' },
  description: { th: ' เผ็ด ', en: ' Spicy ' },
  price: 65,
  imageKey: localKey,
  imageUrl: `/uploads/${localKey}`,
}

const menuItem: MenuItemWithRelations = {
  id: 'menu_1',
  restaurantId: 'restaurant_1',
  foodTypeId: 'food_type_1',
  nameTh: 'ข้าวกะเพรา',
  nameEn: 'Basil Rice',
  descriptionTh: 'เผ็ด',
  descriptionEn: 'Spicy',
  price: 65,
  imageKey: localKey,
  imageUrl: `/uploads/${localKey}`,
  deletedAt: null,
  createdAt: new Date('2026-09-30T00:00:00.000Z'),
  updatedAt: new Date('2026-09-30T00:00:00.000Z'),
  restaurant: {
    id: 'restaurant_1',
    zoneId: 'zone_1',
    nameTh: 'ร้านอาหาร',
    nameEn: 'Restaurant',
    descriptionTh: null,
    descriptionEn: null,
    phone: '053-000-000',
    imageKey: null,
    imageUrl: null,
    deletedAt: null,
    createdAt: new Date('2026-09-30T00:00:00.000Z'),
    updatedAt: new Date('2026-09-30T00:00:00.000Z'),
  },
  foodType: {
    id: 'food_type_1',
    nameTh: 'ข้าว',
    nameEn: 'Rice',
    icon: 'rice',
    sortOrder: 0,
    createdAt: new Date('2026-09-30T00:00:00.000Z'),
    updatedAt: new Date('2026-09-30T00:00:00.000Z'),
  },
  tastes: [
    {
      menuItemId: 'menu_1',
      tasteId: 'taste_2',
      taste: {
        id: 'taste_2',
        nameTh: 'หวาน',
        nameEn: 'Sweet',
        icon: 'candy',
        sortOrder: 2,
        createdAt: new Date('2026-09-30T00:00:00.000Z'),
        updatedAt: new Date('2026-09-30T00:00:00.000Z'),
      },
    },
    {
      menuItemId: 'menu_1',
      tasteId: 'taste_1',
      taste: {
        id: 'taste_1',
        nameTh: 'เผ็ด',
        nameEn: 'Spicy',
        icon: 'flame',
        sortOrder: 1,
        createdAt: new Date('2026-09-30T00:00:00.000Z'),
        updatedAt: new Date('2026-09-30T00:00:00.000Z'),
      },
    },
  ],
}

describe('MenuItem DTOs', () => {
  it('normalizes create data and deduplicates taste IDs', () => {
    const input = parseCreateMenuItem(validBody)

    expect(toMenuItemCreateData(input)).toEqual({
      data: {
        restaurantId: 'restaurant_1',
        foodTypeId: 'food_type_1',
        nameTh: 'ข้าวกะเพรา',
        nameEn: 'Basil Rice',
        descriptionTh: 'เผ็ด',
        descriptionEn: 'Spicy',
        price: 65,
        imageKey: localKey,
        imageUrl: `/uploads/${localKey}`,
      },
      tasteIds: ['taste_2', 'taste_1'],
    })
  })

  it.each([
    ['zero price', { ...validBody, price: 0 }],
    ['fractional price', { ...validBody, price: 65.5 }],
    ['empty tastes', { ...validBody, tasteIds: [] }],
    ['empty name', { ...validBody, name: { th: ' ', en: 'Rice' } }],
    ['unknown field', { ...validBody, phone: '053-000-000' }],
    [
      'unsafe external URL',
      { ...validBody, imageKey: null, imageUrl: 'ftp://x.test/a.jpg' },
    ],
    ['local URL without key', { ...validBody, imageKey: null }],
    ['key without URL', { ...validBody, imageUrl: undefined }],
    [
      'mismatched local pair',
      {
        ...validBody,
        imageUrl: '/uploads/123e4567-e89b-42d3-a456-426614174001.jpg',
      },
    ],
  ])('rejects %s', (_name, input) => {
    expect(() => parseCreateMenuItem(input)).toThrowError(
      expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR' }),
    )
  })

  it('accepts an external HTTP image and clears imageKey in update data', () => {
    expect(
      toMenuItemUpdateData(
        parseUpdateMenuItem({
          imageUrl: ' https://images.example.com/menu.webp ',
        }),
      ),
    ).toEqual({
      data: {
        imageKey: null,
        imageUrl: 'https://images.example.com/menu.webp',
      },
      tasteIds: undefined,
    })
  })

  it('requires an update field', () => {
    expect(() => parseUpdateMenuItem({})).toThrowError(
      expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR' }),
    )
  })

  it('applies list defaults and accepts all filters', () => {
    expect(parseMenuItemListQuery({})).toEqual({
      includeDeleted: false,
      page: 1,
      pageSize: 20,
    })
    expect(
      parseMenuItemListQuery({
        includeDeleted: 'true',
        restaurantId: ' restaurant_1 ',
        foodTypeId: 'food_type_1',
        tasteId: 'taste_1',
        search: ' กะเพรา ',
        page: '2',
        pageSize: '100',
      }),
    ).toEqual({
      includeDeleted: true,
      restaurantId: 'restaurant_1',
      foodTypeId: 'food_type_1',
      tasteId: 'taste_1',
      search: 'กะเพรา',
      page: 2,
      pageSize: 100,
    })
  })

  it.each([
    { includeDeleted: 'yes' },
    { page: '0' },
    { pageSize: '101' },
    { tasteId: '' },
  ])('rejects invalid list query %#', (query) => {
    expect(() => parseMenuItemListQuery(query)).toThrowError(
      expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR' }),
    )
  })

  it('deduplicates bulk IDs and enforces the raw 50-ID maximum', () => {
    expect(
      parseBulkMenuItems({ ids: [' menu_1 ', 'menu_1', 'menu_2'] }),
    ).toEqual(['menu_1', 'menu_2'])
    expect(() =>
      parseBulkMenuItems({
        ids: Array.from({ length: 51 }, (_, index) => `menu_${index}`),
      }),
    ).toThrowError(expect.objectContaining({ status: 400 }))
  })

  it('maps nested relations without exposing Restaurant phone', () => {
    const result = toAdminMenuItem(menuItem)

    expect(result).toMatchObject({
      id: 'menu_1',
      restaurantId: 'restaurant_1',
      foodTypeId: 'food_type_1',
      restaurant: {
        id: 'restaurant_1',
        name: { th: 'ร้านอาหาร', en: 'Restaurant' },
      },
      foodType: { id: 'food_type_1', icon: 'rice' },
      tastes: [{ id: 'taste_1' }, { id: 'taste_2' }],
    })
    expect(result.restaurant).not.toHaveProperty('phone')
  })
})
