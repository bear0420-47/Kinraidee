import { describe, expect, it } from 'vitest'

import {
  historyItemSchema,
  historyListQuerySchema,
  recordHistorySchema,
  toHistoryItem,
  type HistoryWithMenuItem,
} from './recommendation-history.dto'

const now = new Date('2026-10-07T00:00:00.000Z')
const deletedAt = new Date('2026-10-06T00:00:00.000Z')

function row({
  itemDeletedAt = null,
  restaurantDeletedAt = null,
}: {
  itemDeletedAt?: Date | null
  restaurantDeletedAt?: Date | null
} = {}): HistoryWithMenuItem {
  return {
    id: 'history_1',
    userId: 'user_1',
    menuItemId: 'menu_1',
    selectedAt: now,
    menuItem: {
      id: 'menu_1',
      restaurantId: 'restaurant_1',
      foodTypeId: 'food_type_1',
      nameTh: 'ข้าวกะเพรา',
      nameEn: 'Basil Rice',
      descriptionTh: null,
      descriptionEn: null,
      price: 65,
      imageKey: 'menu/basil.webp',
      imageUrl: '/uploads/menu/basil.webp',
      deletedAt: itemDeletedAt,
      createdAt: now,
      updatedAt: now,
      restaurant: {
        id: 'restaurant_1',
        zoneId: 'zone_1',
        nameTh: 'ร้านอาหาร',
        nameEn: 'Restaurant',
        descriptionTh: null,
        descriptionEn: null,
        phone: '053-000-000',
        imageKey: 'restaurant/front.webp',
        imageUrl: null,
        deletedAt: restaurantDeletedAt,
        createdAt: now,
        updatedAt: now,
      },
    },
  }
}

describe('recordHistorySchema', () => {
  it('accepts only the chosen MenuItem', () => {
    expect(recordHistorySchema.parse({ menuItemId: 'menu_1' })).toEqual({
      menuItemId: 'menu_1',
    })
  })

  it.each([
    ['a missing ID', {}],
    ['a blank ID', { menuItemId: '  ' }],
    ['a client-supplied user', { menuItemId: 'menu_1', userId: 'user_2' }],
    [
      'conditions',
      { menuItemId: 'menu_1', conditions: { budget: 'UNDER_50' } },
    ],
    ['rejected IDs', { menuItemId: 'menu_1', rejectedMenuItemIds: ['m'] }],
    [
      'a displayed shortlist',
      { menuItemId: 'menu_1', displayedMenuItemIds: ['m'] },
    ],
  ])('rejects %s', (_, input) => {
    expect(recordHistorySchema.safeParse(input).success).toBe(false)
  })
})

describe('historyListQuerySchema', () => {
  it('defaults to the first page of 20 and caps the page size at 100', () => {
    expect(historyListQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 })
    expect(
      historyListQuerySchema.parse({ page: '2', pageSize: '100' }),
    ).toEqual({ page: 2, pageSize: 100 })
    expect(historyListQuerySchema.safeParse({ pageSize: '101' }).success).toBe(
      false,
    )
    expect(historyListQuerySchema.safeParse({ page: '0' }).success).toBe(false)
  })
})

describe('toHistoryItem', () => {
  it('returns only the allowed summary fields', () => {
    const item = toHistoryItem(row())

    expect(item).toEqual({
      id: 'history_1',
      menuItemId: 'menu_1',
      selectedAt: '2026-10-07T00:00:00.000Z',
      available: true,
      menuItem: {
        id: 'menu_1',
        name: { th: 'ข้าวกะเพรา', en: 'Basil Rice' },
        price: 65,
        imageUrl: '/uploads/menu/basil.webp',
        restaurant: {
          id: 'restaurant_1',
          name: { th: 'ร้านอาหาร', en: 'Restaurant' },
        },
      },
    })
    expect(historyItemSchema.parse(item)).toEqual(item)
    const json = JSON.stringify(item)
    for (const field of ['phone', 'imageKey', 'deletedAt', 'userId']) {
      expect(json).not.toContain(field)
    }
  })

  it.each([
    ['a deleted MenuItem', { itemDeletedAt: deletedAt }],
    [
      'a MenuItem under a deleted Restaurant',
      { restaurantDeletedAt: deletedAt },
    ],
  ])('keeps %s as unavailable', (_, deleted) => {
    expect(toHistoryItem(row(deleted)).available).toBe(false)
  })
})
