import { AuditAction, AuditEntityType } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const tx = {
    $queryRaw: vi.fn(),
    menuItem: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
      updateManyAndReturn: vi.fn(),
    },
    auditLog: { create: vi.fn() },
  }
  return {
    tx,
    prisma: {
      $transaction: vi.fn(
        async (work: ((client: typeof tx) => unknown) | unknown[]) =>
          Array.isArray(work) ? Promise.all(work) : work(tx),
      ),
      menuItem: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
      restaurant: { findUnique: vi.fn() },
      foodType: { count: vi.fn() },
      taste: { findMany: vi.fn() },
    },
  }
})

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }))

import { menuItemsRepository } from './menu-items.repository'

const audit = { actorId: 'admin_1', requestId: 'req_test' }
const now = new Date('2026-09-30T00:00:00.000Z')
const restaurant = {
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
  createdAt: now,
  updatedAt: now,
}
const foodType = {
  id: 'food_type_1',
  nameTh: 'ข้าว',
  nameEn: 'Rice',
  icon: 'rice',
  sortOrder: 0,
  createdAt: now,
  updatedAt: now,
}
const taste = {
  id: 'taste_1',
  nameTh: 'เผ็ด',
  nameEn: 'Spicy',
  icon: 'flame',
  sortOrder: 0,
  createdAt: now,
  updatedAt: now,
}
const menuItem = {
  id: 'menu_1',
  restaurantId: restaurant.id,
  foodTypeId: foodType.id,
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
  restaurant,
  foodType,
  tastes: [{ menuItemId: 'menu_1', tasteId: taste.id, taste }],
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.tx.$queryRaw.mockResolvedValue([{ id: restaurant.id, deletedAt: null }])
})

describe('MenuItems repository', () => {
  it('lists active items under active Restaurants with all filters', async () => {
    mocks.prisma.menuItem.findMany.mockResolvedValue([menuItem])
    mocks.prisma.menuItem.count.mockResolvedValue(21)

    const result = await menuItemsRepository.list({
      includeDeleted: false,
      restaurantId: 'restaurant_1',
      foodTypeId: 'food_type_1',
      tasteId: 'taste_1',
      search: 'กะเพรา',
      page: 2,
      pageSize: 20,
    })

    expect(mocks.prisma.menuItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          restaurant: { deletedAt: null },
          restaurantId: 'restaurant_1',
          foodTypeId: 'food_type_1',
          tastes: { some: { tasteId: 'taste_1' } },
          OR: [
            { nameTh: { contains: 'กะเพรา', mode: 'insensitive' } },
            { nameEn: { contains: 'กะเพรา', mode: 'insensitive' } },
          ],
        },
        orderBy: [{ nameTh: 'asc' }, { id: 'asc' }],
        skip: 20,
        take: 20,
      }),
    )
    expect(result).toEqual({ items: [menuItem], total: 21 })
  })

  it('includes deleted items and deleted Restaurants when requested', async () => {
    mocks.prisma.menuItem.findMany.mockResolvedValue([menuItem])
    mocks.prisma.menuItem.count.mockResolvedValue(1)

    await menuItemsRepository.list({
      includeDeleted: true,
      page: 1,
      pageSize: 20,
    })

    expect(mocks.prisma.menuItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    )
  })

  it('creates MenuItem, tastes, and audit in one transaction', async () => {
    mocks.tx.menuItem.create.mockResolvedValue(menuItem)

    await menuItemsRepository.create(
      {
        restaurantId: restaurant.id,
        foodTypeId: foodType.id,
        nameTh: menuItem.nameTh,
        nameEn: menuItem.nameEn,
        descriptionTh: null,
        descriptionEn: null,
        price: 65,
        imageKey: null,
        imageUrl: null,
      },
      ['taste_1', 'taste_2'],
      audit,
    )

    expect(mocks.tx.menuItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tastes: {
            create: [{ tasteId: 'taste_1' }, { tasteId: 'taste_2' }],
          },
        }),
      }),
    )
    expect(mocks.tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ...audit,
        action: AuditAction.CREATE,
        entityType: AuditEntityType.MENU_ITEM,
        entityId: menuItem.id,
      }),
    })
    expect(
      mocks.tx.auditLog.create.mock.calls[0]?.[0].data.after,
    ).not.toHaveProperty('restaurant.phone')
  })

  it('locks and rejects an inactive Restaurant inside the create transaction', async () => {
    mocks.tx.$queryRaw.mockResolvedValueOnce([
      { id: restaurant.id, deletedAt: now },
    ])

    await expect(
      menuItemsRepository.create(
        {
          restaurantId: restaurant.id,
          foodTypeId: foodType.id,
          nameTh: menuItem.nameTh,
          nameEn: menuItem.nameEn,
          descriptionTh: null,
          descriptionEn: null,
          price: 65,
          imageKey: null,
          imageUrl: null,
        },
        ['taste_1'],
        audit,
      ),
    ).resolves.toEqual({ kind: 'deleted' })
    expect(mocks.tx.menuItem.create).not.toHaveBeenCalled()
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()
  })

  it('replaces the full taste assignment during update', async () => {
    mocks.tx.menuItem.findUniqueOrThrow.mockResolvedValue(menuItem)
    mocks.tx.menuItem.update.mockResolvedValue(menuItem)

    await menuItemsRepository.update(
      menuItem.id,
      { price: 70 },
      ['taste_2'],
      audit,
    )

    expect(mocks.tx.menuItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          price: 70,
          tastes: {
            deleteMany: {},
            create: [{ tasteId: 'taste_2' }],
          },
        },
      }),
    )
    expect(mocks.tx.auditLog.create).toHaveBeenCalledTimes(1)
  })

  it('rejects updates under a deleted Restaurant inside the transaction', async () => {
    mocks.tx.menuItem.findUniqueOrThrow.mockResolvedValue(menuItem)
    mocks.tx.$queryRaw.mockResolvedValueOnce([
      { id: restaurant.id, deletedAt: now },
    ])

    await expect(
      menuItemsRepository.update(menuItem.id, { price: 70 }, undefined, audit),
    ).resolves.toEqual({ kind: 'deleted' })
    expect(mocks.tx.menuItem.update).not.toHaveBeenCalled()
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()
  })

  it('soft-deletes once and does not remove tastes', async () => {
    const deleted = { ...menuItem, deletedAt: new Date() }
    mocks.tx.menuItem.findUniqueOrThrow
      .mockResolvedValueOnce(menuItem)
      .mockResolvedValueOnce(deleted)
    mocks.tx.menuItem.updateManyAndReturn.mockResolvedValue([
      { id: menuItem.id },
    ])

    const result = await menuItemsRepository.softDelete(menuItem.id, audit)

    expect(result.changed).toBe(true)
    expect(mocks.tx.menuItem.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: menuItem.id, deletedAt: null } }),
    )
    expect(mocks.tx.auditLog.create).toHaveBeenCalledTimes(1)
  })

  it('does not audit repeated or race-losing delete requests', async () => {
    mocks.tx.menuItem.findUniqueOrThrow.mockResolvedValueOnce({
      ...menuItem,
      deletedAt: now,
    })
    expect(
      (await menuItemsRepository.softDelete(menuItem.id, audit)).changed,
    ).toBe(false)
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()

    vi.clearAllMocks()
    mocks.tx.menuItem.findUniqueOrThrow
      .mockResolvedValueOnce(menuItem)
      .mockResolvedValueOnce({ ...menuItem, deletedAt: now })
    mocks.tx.menuItem.updateManyAndReturn.mockResolvedValue([])
    expect(
      (await menuItemsRepository.softDelete(menuItem.id, audit)).changed,
    ).toBe(false)
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()
  })

  it('restores only under an active Restaurant and audits once', async () => {
    const deleted = { ...menuItem, deletedAt: now }
    mocks.tx.menuItem.findUniqueOrThrow
      .mockResolvedValueOnce(deleted)
      .mockResolvedValueOnce(menuItem)
    mocks.tx.menuItem.updateManyAndReturn.mockResolvedValue([
      { id: menuItem.id },
    ])

    const result = await menuItemsRepository.restore(menuItem.id, audit)

    expect(result).toMatchObject({ kind: 'ok', changed: true })
    expect(mocks.tx.menuItem.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: menuItem.id,
          deletedAt: { not: null },
          restaurant: { deletedAt: null },
        },
      }),
    )
    expect(mocks.tx.auditLog.create).toHaveBeenCalledTimes(1)
  })

  it('blocks restore when the Restaurant is deleted without auditing', async () => {
    mocks.tx.menuItem.findUniqueOrThrow.mockResolvedValue({
      ...menuItem,
      deletedAt: now,
      restaurant: { ...restaurant, deletedAt: now },
    })

    await expect(
      menuItemsRepository.restore(menuItem.id, audit),
    ).resolves.toEqual({ kind: 'restaurant-deleted' })
    expect(mocks.tx.menuItem.updateManyAndReturn).not.toHaveBeenCalled()
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()
  })

  it('rejects an unknown bulk ID before changing records', async () => {
    mocks.tx.menuItem.findMany.mockResolvedValue([{ id: 'menu_1' }])

    await expect(
      menuItemsRepository.bulkDelete(['menu_1', 'missing'], audit),
    ).resolves.toEqual({ kind: 'unknown' })
    expect(mocks.tx.menuItem.updateManyAndReturn).not.toHaveBeenCalled()
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()
  })

  it('bulk-deletes changed IDs with one minimized audit row', async () => {
    mocks.tx.menuItem.findMany.mockResolvedValue([
      { id: 'menu_1' },
      { id: 'menu_2' },
    ])
    mocks.tx.menuItem.updateManyAndReturn.mockResolvedValue([
      { id: 'menu_2' },
      { id: 'menu_1' },
    ])

    const result = await menuItemsRepository.bulkDelete(
      ['menu_1', 'menu_2'],
      audit,
    )

    expect(result).toEqual({ kind: 'ok', updatedCount: 2 })
    expect(mocks.tx.auditLog.create).toHaveBeenCalledTimes(1)
    expect(mocks.tx.auditLog.create.mock.calls[0]?.[0].data).toMatchObject({
      action: AuditAction.DELETE,
      entityType: AuditEntityType.MENU_ITEM,
      entityId: 'bulk',
      before: { ids: ['menu_1', 'menu_2'], activeCount: 2 },
      after: { ids: ['menu_1', 'menu_2'], deletedCount: 2 },
    })
  })

  it('bulk restore rejects any item under a deleted Restaurant', async () => {
    mocks.tx.menuItem.findMany.mockResolvedValue([
      { id: 'menu_1', restaurant: { deletedAt: null } },
      { id: 'menu_2', restaurant: { deletedAt: now } },
    ])

    await expect(
      menuItemsRepository.bulkRestore(['menu_1', 'menu_2'], audit),
    ).resolves.toEqual({ kind: 'restaurant-deleted' })
    expect(mocks.tx.menuItem.updateManyAndReturn).not.toHaveBeenCalled()
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()
  })

  it('does not audit an idempotent bulk mutation', async () => {
    mocks.tx.menuItem.findMany.mockResolvedValue([{ id: 'menu_1' }])
    mocks.tx.menuItem.updateManyAndReturn.mockResolvedValue([])

    await expect(
      menuItemsRepository.bulkDelete(['menu_1'], audit),
    ).resolves.toEqual({ kind: 'ok', updatedCount: 0 })
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()
  })
})
