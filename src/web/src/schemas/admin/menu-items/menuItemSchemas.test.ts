import { describe, expect, it } from 'vitest'

import {
  defaultMenuItemFilters,
  formatPrice,
  getMenuItemChanges,
  MAX_BULK_SELECTION,
  menuItemFormSchema,
  toggleAllVisible,
  toggleSelection,
  toMenuItemFormValues,
  toMenuItemListQuery,
  type MenuItem,
  type MenuItemFormInput,
} from './menuItemSchemas'

const menuItem: MenuItem = {
  id: 'menu_1',
  restaurantId: 'restaurant_1',
  foodTypeId: 'food_1',
  restaurant: {
    id: 'restaurant_1',
    name: { th: 'ครัวไทย', en: 'Thai Kitchen' },
    deletedAt: null,
  },
  foodType: { id: 'food_1', name: { th: 'ข้าว', en: 'Rice' }, icon: 'rice' },
  tastes: [
    { id: 'taste_1', name: { th: 'เผ็ด', en: 'Spicy' }, icon: 'flame' },
    { id: 'taste_2', name: { th: 'หวาน', en: 'Sweet' }, icon: 'heart' },
  ],
  name: { th: 'ผัดกะเพรา', en: 'Basil Stir-fry' },
  description: null,
  price: 50,
  imageKey: null,
  imageUrl: 'https://images.example.com/dish.jpg',
  deletedAt: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
}

function formInput(changes: Partial<MenuItemFormInput> = {}) {
  return { ...toMenuItemFormValues(menuItem), ...changes }
}

const ids = (count: number, prefix = 'id') =>
  Array.from({ length: count }, (_, index) => `${prefix}_${index}`)

describe('menuItemFormSchema', () => {
  it('builds the API body, deduplicating tastes and parsing whole-baht prices', () => {
    const result = menuItemFormSchema.parse(
      formInput({
        tasteIds: ['taste_2', 'taste_1', 'taste_2'],
        price: ' 0120 ',
        nameTh: ' ผัดกะเพรา ',
      }),
    )

    expect(result).toEqual({
      restaurantId: 'restaurant_1',
      foodTypeId: 'food_1',
      tasteIds: ['taste_2', 'taste_1'],
      name: { th: 'ผัดกะเพรา', en: 'Basil Stir-fry' },
      description: null,
      price: 120,
      imageKey: null,
      imageUrl: 'https://images.example.com/dish.jpg',
    })
  })

  it('requires at least one taste', () => {
    const result = menuItemFormSchema.safeParse(formInput({ tasteIds: [] }))

    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'กรุณาเลือกรสชาติอย่างน้อย 1 รายการ',
    ])
  })

  it.each([
    ['', 'กรุณากรอกราคา'],
    ['0', 'ราคาต้องมากกว่า 0 บาท'],
    ['1.5', 'ราคาต้องเป็นจำนวนเต็มบาท'],
    ['1e3', 'ราคาต้องเป็นจำนวนเต็มบาท'],
    ['2147483648', 'ราคาสูงเกินกว่าที่ระบบรองรับ'],
  ])('rejects the price %o', (price, message) => {
    const result = menuItemFormSchema.safeParse(formInput({ price }))

    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      message,
    ])
  })

  it('accepts the largest price the database column holds', () => {
    expect(
      menuItemFormSchema.parse(formInput({ price: '2147483647' })).price,
    ).toBe(2_147_483_647)
  })
})

describe('getMenuItemChanges', () => {
  const body = () => menuItemFormSchema.parse(formInput())

  it('returns null when nothing changed, whatever the taste order', () => {
    expect(
      getMenuItemChanges(menuItem, {
        ...body(),
        tasteIds: ['taste_2', 'taste_1'],
      }),
    ).toBeNull()
  })

  it('sends only changed fields, and the image key and URL together', () => {
    expect(
      getMenuItemChanges(menuItem, {
        ...body(),
        tasteIds: ['taste_1'],
        price: 60,
        imageUrl: null,
      }),
    ).toEqual({
      tasteIds: ['taste_1'],
      price: 60,
      imageKey: null,
      imageUrl: null,
    })
  })
})

describe('toMenuItemListQuery', () => {
  it('sends only active filters with the fixed page size', () => {
    expect(toMenuItemListQuery(defaultMenuItemFilters)).toEqual({
      page: 1,
      pageSize: 20,
    })
    expect(
      toMenuItemListQuery({
        page: 3,
        search: ' กะเพรา ',
        restaurantId: 'restaurant_1',
        foodTypeId: 'food_1',
        tasteId: 'taste_1',
        includeDeleted: true,
      }),
    ).toEqual({
      page: 3,
      pageSize: 20,
      search: 'กะเพรา',
      restaurantId: 'restaurant_1',
      foodTypeId: 'food_1',
      tasteId: 'taste_1',
      includeDeleted: 'true',
    })
  })
})

describe('bulk selection', () => {
  it('toggles one row but never selects more than the API limit', () => {
    const full = new Set(ids(MAX_BULK_SELECTION))

    expect(toggleSelection(new Set(), 'a')).toEqual(new Set(['a']))
    expect(toggleSelection(new Set(['a']), 'a')).toEqual(new Set())
    expect(toggleSelection(full, 'extra')).toEqual(full)
    expect(toggleSelection(full, 'id_0').size).toBe(MAX_BULK_SELECTION - 1)
  })

  it('selects every visible row up to the limit, or clears them when all are selected', () => {
    const visible = ids(3)

    expect(toggleAllVisible(new Set(['id_1']), visible)).toEqual(
      new Set(visible),
    )
    expect(toggleAllVisible(new Set(visible), visible)).toEqual(new Set())
    expect(toggleAllVisible(new Set(), ids(60)).size).toBe(MAX_BULK_SELECTION)
  })
})

describe('formatPrice', () => {
  it('shows whole baht with Thai digit grouping', () => {
    expect(formatPrice(50)).toBe('฿50')
    expect(formatPrice(1250)).toBe('฿1,250')
  })
})
