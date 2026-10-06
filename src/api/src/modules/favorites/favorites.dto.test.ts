import { describe, expect, it } from 'vitest'

import {
  favoriteItemSchema,
  toFavoriteItem,
  type FavoriteWithMenuItem,
} from './favorites.dto'

const now = new Date('2026-10-07T00:00:00.000Z')
const deletedAt = new Date('2026-10-06T00:00:00.000Z')

function favorite({
  itemDeletedAt = null,
  restaurantDeletedAt = null,
}: {
  itemDeletedAt?: Date | null
  restaurantDeletedAt?: Date | null
} = {}): FavoriteWithMenuItem {
  return {
    userId: 'user_1',
    menuItemId: 'menu_1',
    createdAt: now,
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

describe('toFavoriteItem', () => {
  it('returns only the allowed summary fields', () => {
    const item = toFavoriteItem(favorite())

    expect(item).toEqual({
      menuItemId: 'menu_1',
      createdAt: '2026-10-07T00:00:00.000Z',
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
    expect(favoriteItemSchema.parse(item)).toEqual(item)
    const json = JSON.stringify(item)
    for (const field of ['phone', 'imageKey', 'deletedAt', 'updatedAt']) {
      expect(json).not.toContain(field)
    }
  })

  it.each([
    ['a deleted MenuItem', { itemDeletedAt: deletedAt }],
    [
      'a MenuItem under a deleted Restaurant',
      { restaurantDeletedAt: deletedAt },
    ],
  ])('marks %s unavailable', (_, deleted) => {
    expect(toFavoriteItem(favorite(deleted)).available).toBe(false)
  })
})
