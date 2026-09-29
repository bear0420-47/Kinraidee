import { AuditAction, AuditEntityType } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const tx = {
    restaurant: {
      create: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    menuItem: { updateMany: vi.fn() },
    auditLog: { create: vi.fn() },
  }
  return {
    tx,
    prisma: {
      $transaction: vi.fn(
        async (work: ((client: typeof tx) => unknown) | unknown[]) =>
          Array.isArray(work) ? Promise.all(work) : work(tx),
      ),
      restaurant: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
      zone: { count: vi.fn() },
    },
  }
})

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }))

import { restaurantsRepository } from './restaurants.repository'

const audit = { actorId: 'admin_1', requestId: 'req_test' }
const zone = {
  id: 'zone_1',
  nameTh: 'หน้ามอ',
  nameEn: 'Front Gate',
  descriptionTh: null,
  descriptionEn: null,
  sortOrder: 0,
  createdAt: new Date('2026-09-29T00:00:00.000Z'),
  updatedAt: new Date('2026-09-29T00:00:00.000Z'),
}
const restaurant = {
  id: 'restaurant_1',
  zoneId: zone.id,
  nameTh: 'ร้านครัวไทย',
  nameEn: 'Thai Kitchen',
  descriptionTh: null,
  descriptionEn: null,
  phone: '053-123-456',
  imageKey: null,
  imageUrl: null,
  deletedAt: null,
  createdAt: new Date('2026-09-29T00:00:00.000Z'),
  updatedAt: new Date('2026-09-29T00:00:00.000Z'),
  zone,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('restaurants repository transactions', () => {
  it('lists with active/search/Zone filters, stable ordering, and pagination', async () => {
    mocks.prisma.restaurant.findMany.mockResolvedValue([restaurant])
    mocks.prisma.restaurant.count.mockResolvedValue(21)

    const result = await restaurantsRepository.list({
      includeDeleted: false,
      zoneId: 'zone_1',
      search: 'ครัว',
      page: 2,
      pageSize: 20,
    })

    expect(mocks.prisma.restaurant.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        zoneId: 'zone_1',
        OR: [
          { nameTh: { contains: 'ครัว', mode: 'insensitive' } },
          { nameEn: { contains: 'ครัว', mode: 'insensitive' } },
        ],
      },
      include: { zone: true },
      orderBy: [{ nameTh: 'asc' }, { id: 'asc' }],
      skip: 20,
      take: 20,
    })
    expect(result).toEqual({ items: [restaurant], total: 21 })
  })

  it('includes active and deleted Restaurants when requested', async () => {
    mocks.prisma.restaurant.findMany.mockResolvedValue([restaurant])
    mocks.prisma.restaurant.count.mockResolvedValue(1)

    await restaurantsRepository.list({
      includeDeleted: true,
      page: 1,
      pageSize: 20,
    })

    expect(mocks.prisma.restaurant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    )
  })

  it('creates Restaurant and sanitized audit row in one transaction', async () => {
    mocks.tx.restaurant.create.mockResolvedValue(restaurant)

    await restaurantsRepository.create(
      {
        zoneId: zone.id,
        nameTh: restaurant.nameTh,
        nameEn: restaurant.nameEn,
        descriptionTh: null,
        descriptionEn: null,
        phone: restaurant.phone,
        imageKey: null,
        imageUrl: null,
      },
      audit,
    )

    expect(mocks.prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(mocks.tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ...audit,
        action: AuditAction.CREATE,
        entityType: AuditEntityType.RESTAURANT,
        entityId: restaurant.id,
        before: expect.anything(),
      }),
    })
    const auditData = mocks.tx.auditLog.create.mock.calls[0]?.[0].data
    expect(auditData.after).not.toHaveProperty('phone')
  })

  it('does not write an audit row when create fails', async () => {
    mocks.tx.restaurant.create.mockRejectedValue(new Error('write failed'))

    await expect(
      restaurantsRepository.create(
        {
          zoneId: zone.id,
          nameTh: restaurant.nameTh,
          nameEn: restaurant.nameEn,
          descriptionTh: null,
          descriptionEn: null,
          phone: null,
          imageKey: null,
          imageUrl: null,
        },
        audit,
      ),
    ).rejects.toThrow('write failed')
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()
  })

  it('updates with sanitized before and after audit snapshots', async () => {
    const updated = { ...restaurant, nameEn: 'New Kitchen' }
    mocks.tx.restaurant.findUniqueOrThrow.mockResolvedValue(restaurant)
    mocks.tx.restaurant.update.mockResolvedValue(updated)

    await restaurantsRepository.update(
      restaurant.id,
      { nameEn: 'New Kitchen' },
      audit,
    )

    const auditData = mocks.tx.auditLog.create.mock.calls[0]?.[0].data
    expect(auditData.before).toMatchObject({
      name: { en: 'Thai Kitchen' },
    })
    expect(auditData.after).toMatchObject({ name: { en: 'New Kitchen' } })
    expect(auditData.before).not.toHaveProperty('phone')
    expect(auditData.after).not.toHaveProperty('phone')
  })

  it('soft-deletes Restaurant and active child MenuItems with one audit summary', async () => {
    const deleted = { ...restaurant, deletedAt: new Date() }
    mocks.tx.restaurant.findUniqueOrThrow.mockResolvedValue(restaurant)
    mocks.tx.restaurant.update.mockResolvedValue(deleted)
    mocks.tx.menuItem.updateMany.mockResolvedValue({ count: 2 })

    const result = await restaurantsRepository.softDelete(restaurant.id, audit)

    const deletedAt =
      mocks.tx.restaurant.update.mock.calls[0]?.[0].data.deletedAt
    expect(mocks.tx.menuItem.updateMany).toHaveBeenCalledWith({
      where: { restaurantId: restaurant.id, deletedAt: null },
      data: { deletedAt },
    })
    expect(mocks.tx.auditLog.create).toHaveBeenCalledTimes(1)
    expect(
      mocks.tx.auditLog.create.mock.calls[0]?.[0].data.after,
    ).toMatchObject({ affectedMenuItemCount: 2 })
    expect(result).toMatchObject({ affectedMenuItemCount: 2, changed: true })
  })

  it('does not change timestamps or audit an already deleted Restaurant', async () => {
    mocks.tx.restaurant.findUniqueOrThrow.mockResolvedValue({
      ...restaurant,
      deletedAt: new Date(),
    })

    const result = await restaurantsRepository.softDelete(restaurant.id, audit)

    expect(result.changed).toBe(false)
    expect(mocks.tx.restaurant.update).not.toHaveBeenCalled()
    expect(mocks.tx.menuItem.updateMany).not.toHaveBeenCalled()
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()
  })

  it('restores only Restaurant and writes one UPDATE audit row', async () => {
    mocks.tx.restaurant.findUniqueOrThrow.mockResolvedValue({
      ...restaurant,
      deletedAt: new Date('2026-09-29T01:00:00.000Z'),
    })
    mocks.tx.restaurant.update.mockResolvedValue(restaurant)

    await restaurantsRepository.restore(restaurant.id, audit)

    expect(mocks.tx.restaurant.update).toHaveBeenCalledWith({
      where: { id: restaurant.id },
      data: { deletedAt: null },
      include: { zone: true },
    })
    expect(mocks.tx.menuItem.updateMany).not.toHaveBeenCalled()
    expect(mocks.tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.RESTAURANT,
      }),
    })
  })

  it('does not update MenuItems or audit an already active restore', async () => {
    mocks.tx.restaurant.findUniqueOrThrow.mockResolvedValue(restaurant)

    const result = await restaurantsRepository.restore(restaurant.id, audit)

    expect(result.changed).toBe(false)
    expect(mocks.tx.restaurant.update).not.toHaveBeenCalled()
    expect(mocks.tx.menuItem.updateMany).not.toHaveBeenCalled()
    expect(mocks.tx.auditLog.create).not.toHaveBeenCalled()
  })
})
