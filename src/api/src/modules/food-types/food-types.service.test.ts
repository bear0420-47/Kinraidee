import { Prisma, type FoodType } from '@prisma/client'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { stubTestEnv } from '@/test/routeTestApp'
import type { FoodTypesRepository } from './food-types.repository'

let createFoodTypesService: typeof import('./food-types.service').createFoodTypesService

beforeAll(async () => {
  stubTestEnv()
  ;({ createFoodTypesService } = await import('./food-types.service'))
})

const audit = { actorId: 'admin_1', requestId: 'req_test' }

const foodType: FoodType = {
  id: 'food_type_1',
  nameTh: 'ข้าว',
  nameEn: 'Rice',
  icon: 'rice',
  sortOrder: 0,
  createdAt: new Date('2026-09-28T00:00:00.000Z'),
  updatedAt: new Date('2026-09-28T00:00:00.000Z'),
}

function prismaError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('Prisma error', {
    code,
    clientVersion: 'test',
    ...(meta ? { meta } : {}),
  })
}

describe('food types service', () => {
  const repository = {
    list: vi.fn(),
    findById: vi.fn(),
    countMenuItems: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
  const service = () =>
    createFoodTypesService(repository as unknown as FoodTypesRepository)

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('lists food types in repository order without timestamps', async () => {
    repository.list.mockResolvedValue([
      foodType,
      { ...foodType, id: 'food_type_2' },
    ])

    const items = await service().list()

    expect(items.map((item) => item.id)).toEqual(['food_type_1', 'food_type_2'])
    expect(items[0]).not.toHaveProperty('createdAt')
  })

  it('creates a food type with the audit context', async () => {
    repository.create.mockResolvedValue(foodType)

    const result = await service().create(
      { name: { th: 'ข้าว', en: 'Rice' }, icon: 'rice', sortOrder: 0 },
      audit,
    )

    expect(repository.create).toHaveBeenCalledWith(
      { nameTh: 'ข้าว', nameEn: 'Rice', icon: 'rice', sortOrder: 0 },
      audit,
    )
    expect(result.icon).toBe('rice')
  })

  it('maps a duplicate English name to 409 with the field', async () => {
    repository.create.mockRejectedValue(
      prismaError('P2002', { target: ['nameEn'] }),
    )

    await expect(
      service().create({ name: { th: 'ก', en: 'Rice' }, sortOrder: 0 }, audit),
    ).rejects.toMatchObject({
      status: 409,
      code: 'FOOD_TYPE_NAME_ALREADY_EXISTS',
      fields: { 'name.en': 'Already used by another food type.' },
    })
  })

  it('returns 404 when updating an unknown food type', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(
      service().update('missing', { sortOrder: 1 }, audit),
    ).rejects.toMatchObject({ status: 404, code: 'FOOD_TYPE_NOT_FOUND' })
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('skips the write when nothing changed', async () => {
    repository.findById.mockResolvedValue(foodType)

    await service().update('food_type_1', { icon: 'rice' }, audit)

    expect(repository.update).not.toHaveBeenCalled()
  })

  it('clears the icon when updated to null', async () => {
    repository.findById.mockResolvedValue(foodType)
    repository.update.mockResolvedValue({ ...foodType, icon: null })

    const result = await service().update('food_type_1', { icon: null }, audit)

    expect(repository.update).toHaveBeenCalledWith(
      'food_type_1',
      { icon: null },
      audit,
    )
    expect(result.icon).toBeNull()
  })

  it('blocks deleting a food type that menu items reference', async () => {
    repository.findById.mockResolvedValue(foodType)
    repository.countMenuItems.mockResolvedValue(1)

    await expect(service().delete('food_type_1', audit)).rejects.toMatchObject({
      status: 409,
      code: 'FOOD_TYPE_IN_USE',
      message:
        'Reassign every menu item using this food type before deleting it.',
    })
    expect(repository.delete).not.toHaveBeenCalled()
  })

  it('maps a menu item added after the check to FOOD_TYPE_IN_USE', async () => {
    repository.findById.mockResolvedValue(foodType)
    repository.countMenuItems.mockResolvedValue(0)
    repository.delete.mockRejectedValue(prismaError('P2003'))

    await expect(service().delete('food_type_1', audit)).rejects.toMatchObject({
      status: 409,
      code: 'FOOD_TYPE_IN_USE',
    })
  })

  it('deletes an unreferenced food type with the audit context', async () => {
    repository.findById.mockResolvedValue(foodType)
    repository.countMenuItems.mockResolvedValue(0)

    await service().delete('food_type_1', audit)

    expect(repository.delete).toHaveBeenCalledWith('food_type_1', audit)
  })

  it('returns 404 when deleting an unknown food type', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(service().delete('missing', audit)).rejects.toMatchObject({
      status: 404,
      code: 'FOOD_TYPE_NOT_FOUND',
    })
  })
})
