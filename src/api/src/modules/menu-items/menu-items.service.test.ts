import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MenuItemWithRelations } from './menu-items.dto'
import type { MenuItemsRepository } from './menu-items.repository'
import { createMenuItemsService } from './menu-items.service'

const audit = { actorId: 'admin_1', requestId: 'req_test' }
const now = new Date('2026-09-30T00:00:00.000Z')
const menuItem: MenuItemWithRelations = {
  id: 'menu_1',
  restaurantId: 'restaurant_1',
  foodTypeId: 'food_type_1',
  nameTh: 'ข้าวกะเพรา',
  nameEn: 'Basil Rice',
  descriptionTh: null,
  descriptionEn: null,
  price: 65,
  imageKey: null,
  imageUrl: null,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
  restaurant: {
    id: 'restaurant_1',
    zoneId: 'zone_1',
    nameTh: 'ร้านอาหาร',
    nameEn: 'Restaurant',
    descriptionTh: null,
    descriptionEn: null,
    phone: null,
    imageKey: null,
    imageUrl: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  },
  foodType: {
    id: 'food_type_1',
    nameTh: 'ข้าว',
    nameEn: 'Rice',
    icon: 'rice',
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  },
  tastes: [
    {
      menuItemId: 'menu_1',
      tasteId: 'taste_1',
      taste: {
        id: 'taste_1',
        nameTh: 'เผ็ด',
        nameEn: 'Spicy',
        icon: 'flame',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      },
    },
  ],
}

const repository = {
  list: vi.fn(),
  findById: vi.fn(),
  findRestaurant: vi.fn(),
  foodTypeExists: vi.fn(),
  findTasteIds: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  restore: vi.fn(),
  bulkDelete: vi.fn(),
  bulkRestore: vi.fn(),
} as unknown as MenuItemsRepository

const service = createMenuItemsService(repository)

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(repository.findById).mockResolvedValue(menuItem)
  vi.mocked(repository.findRestaurant).mockResolvedValue({
    id: 'restaurant_1',
    deletedAt: null,
  })
  vi.mocked(repository.foodTypeExists).mockResolvedValue(true)
  vi.mocked(repository.findTasteIds).mockImplementation(async (ids) => ids)
})

describe('MenuItems service', () => {
  it('lists with pagination metadata and maps relations', async () => {
    vi.mocked(repository.list).mockResolvedValue({
      items: [menuItem],
      total: 1,
    })

    const result = await service.list({
      includeDeleted: false,
      page: 1,
      pageSize: 20,
    })

    expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1 })
    expect(result.items[0]?.tastes).toEqual([
      expect.objectContaining({ id: 'taste_1' }),
    ])
  })

  it('rejects an unknown or deleted Restaurant before create', async () => {
    vi.mocked(repository.findRestaurant).mockResolvedValueOnce(null)

    await expect(
      service.create(
        {
          restaurantId: 'missing',
          foodTypeId: 'food_type_1',
          tasteIds: ['taste_1'],
          name: { th: 'เมนู', en: 'Menu' },
          price: 50,
        },
        audit,
      ),
    ).rejects.toMatchObject({ status: 404, code: 'RESTAURANT_NOT_FOUND' })

    vi.mocked(repository.findRestaurant).mockResolvedValueOnce({
      id: 'restaurant_1',
      deletedAt: now,
    })
    await expect(
      service.create(
        {
          restaurantId: 'restaurant_1',
          foodTypeId: 'food_type_1',
          tasteIds: ['taste_1'],
          name: { th: 'เมนู', en: 'Menu' },
          price: 50,
        },
        audit,
      ),
    ).rejects.toMatchObject({ status: 409, code: 'RESTAURANT_DELETED' })
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('rejects unknown FoodType or Taste references', async () => {
    vi.mocked(repository.foodTypeExists).mockResolvedValueOnce(false)

    await expect(
      service.create(
        {
          restaurantId: 'restaurant_1',
          foodTypeId: 'missing',
          tasteIds: ['taste_1'],
          name: { th: 'เมนู', en: 'Menu' },
          price: 50,
        },
        audit,
      ),
    ).rejects.toMatchObject({ status: 404, code: 'FOOD_TYPE_NOT_FOUND' })

    vi.mocked(repository.findTasteIds).mockResolvedValueOnce([])
    await expect(
      service.create(
        {
          restaurantId: 'restaurant_1',
          foodTypeId: 'food_type_1',
          tasteIds: ['missing'],
          name: { th: 'เมนู', en: 'Menu' },
          price: 50,
        },
        audit,
      ),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' })
  })

  it('creates duplicate names when relations are valid', async () => {
    vi.mocked(repository.create).mockResolvedValue(menuItem)

    const result = await service.create(
      {
        restaurantId: 'restaurant_1',
        foodTypeId: 'food_type_1',
        tasteIds: ['taste_1'],
        name: { th: menuItem.nameTh, en: menuItem.nameEn },
        price: menuItem.price,
      },
      audit,
    )

    expect(result.id).toBe(menuItem.id)
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ nameTh: menuItem.nameTh }),
      ['taste_1'],
      audit,
    )
  })

  it('replaces taste assignment and clears imageKey for external images', async () => {
    const updated = {
      ...menuItem,
      imageUrl: 'https://images.example.com/menu.jpg',
      tastes: [
        {
          menuItemId: 'menu_1',
          tasteId: 'taste_2',
          taste: { ...menuItem.tastes[0]!.taste, id: 'taste_2' },
        },
      ],
    }
    vi.mocked(repository.update).mockResolvedValue(updated)

    await service.update(
      menuItem.id,
      {
        tasteIds: ['taste_2'],
        imageUrl: 'https://images.example.com/menu.jpg',
      },
      audit,
    )

    expect(repository.update).toHaveBeenCalledWith(
      menuItem.id,
      {
        imageKey: null,
        imageUrl: 'https://images.example.com/menu.jpg',
      },
      ['taste_2'],
      audit,
    )
  })

  it('skips an unchanged update and does not write audit noise', async () => {
    const result = await service.update(
      menuItem.id,
      {
        name: { th: menuItem.nameTh, en: menuItem.nameEn },
        tasteIds: ['taste_1'],
      },
      audit,
    )

    expect(result.id).toBe(menuItem.id)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('blocks restore when the owning Restaurant is deleted', async () => {
    vi.mocked(repository.restore).mockResolvedValue({
      kind: 'restaurant-deleted',
    })

    await expect(service.restore(menuItem.id, audit)).rejects.toMatchObject({
      status: 409,
      code: 'RESTAURANT_DELETED',
    })
  })

  it('returns single and bulk idempotent mutation results', async () => {
    vi.mocked(repository.softDelete).mockResolvedValue({
      menuItem,
      changed: false,
    })
    vi.mocked(repository.restore).mockResolvedValue({
      kind: 'ok',
      menuItem,
      changed: false,
    })
    vi.mocked(repository.bulkDelete).mockResolvedValue({
      kind: 'ok',
      updatedCount: 0,
    })
    vi.mocked(repository.bulkRestore).mockResolvedValue({
      kind: 'ok',
      updatedCount: 2,
    })

    await expect(service.delete(menuItem.id, audit)).resolves.toBeUndefined()
    await expect(service.restore(menuItem.id, audit)).resolves.toMatchObject({
      id: menuItem.id,
    })
    await expect(service.bulkDelete(['menu_1'], audit)).resolves.toEqual({
      updatedCount: 0,
    })
    await expect(
      service.bulkRestore(['menu_1', 'menu_2'], audit),
    ).resolves.toEqual({ updatedCount: 2 })
  })

  it('maps unknown bulk IDs and deleted Restaurants to stable errors', async () => {
    vi.mocked(repository.bulkDelete).mockResolvedValueOnce({ kind: 'unknown' })
    await expect(service.bulkDelete(['missing'], audit)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    })

    vi.mocked(repository.bulkRestore).mockResolvedValueOnce({
      kind: 'restaurant-deleted',
    })
    await expect(service.bulkRestore(['menu_1'], audit)).rejects.toMatchObject({
      status: 409,
      code: 'RESTAURANT_DELETED',
    })
  })
})
