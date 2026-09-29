import { Prisma } from '@prisma/client'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { stubTestEnv } from '@/test/routeTestApp'
import type { RestaurantWithZone } from './restaurants.dto'
import type { RestaurantsRepository } from './restaurants.repository'

let createRestaurantsService: typeof import('./restaurants.service').createRestaurantsService

beforeAll(async () => {
  stubTestEnv()
  ;({ createRestaurantsService } = await import('./restaurants.service'))
})

const audit = { actorId: 'admin_1', requestId: 'req_test' }
const query = { includeDeleted: false, page: 1, pageSize: 20 }

const restaurant: RestaurantWithZone = {
  id: 'restaurant_1',
  zoneId: 'zone_1',
  nameTh: 'ร้านครัวไทย',
  nameEn: 'Thai Kitchen',
  descriptionTh: null,
  descriptionEn: null,
  phone: null,
  imageKey: null,
  imageUrl: null,
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

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('Prisma error', {
    code,
    clientVersion: 'test',
  })
}

describe('restaurants service', () => {
  const repository = {
    list: vi.fn(),
    findById: vi.fn(),
    zoneExists: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
  }
  const service = () =>
    createRestaurantsService(repository as unknown as RestaurantsRepository)

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('maps list results with pagination metadata', async () => {
    repository.list.mockResolvedValue({ items: [restaurant], total: 21 })

    const result = await service().list(query)

    expect(repository.list).toHaveBeenCalledWith(query)
    expect(result.items[0]?.zone.name.en).toBe('Front Gate')
    expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 21 })
  })

  it('returns active or deleted detail and 404 for an unknown Restaurant', async () => {
    repository.findById.mockResolvedValueOnce({
      ...restaurant,
      deletedAt: new Date('2026-09-29T01:00:00.000Z'),
    })
    await expect(service().detail('restaurant_1')).resolves.toMatchObject({
      id: 'restaurant_1',
      deletedAt: '2026-09-29T01:00:00.000Z',
    })

    repository.findById.mockResolvedValueOnce(null)
    await expect(service().detail('missing')).rejects.toMatchObject({
      status: 404,
      code: 'RESTAURANT_NOT_FOUND',
    })
  })

  it('validates Zone existence and creates duplicate-named Restaurants', async () => {
    repository.zoneExists.mockResolvedValue(true)
    repository.create.mockResolvedValue(restaurant)
    const input = {
      zoneId: 'zone_1',
      name: { th: 'ร้านครัวไทย', en: 'Thai Kitchen' },
    }

    await service().create(input, audit)
    await service().create(input, audit)

    expect(repository.create).toHaveBeenCalledTimes(2)
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nameTh: 'ร้านครัวไทย',
        nameEn: 'Thai Kitchen',
        imageKey: null,
      }),
      audit,
    )
  })

  it('rejects an unknown Zone before creating', async () => {
    repository.zoneExists.mockResolvedValue(false)

    await expect(
      service().create(
        { zoneId: 'missing', name: { th: 'ร้าน', en: 'Restaurant' } },
        audit,
      ),
    ).rejects.toMatchObject({ status: 404, code: 'ZONE_NOT_FOUND' })
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('maps a Zone deleted after validation to ZONE_NOT_FOUND', async () => {
    repository.zoneExists.mockResolvedValue(true)
    repository.create.mockRejectedValue(prismaError('P2003'))

    await expect(
      service().create(
        { zoneId: 'zone_1', name: { th: 'ร้าน', en: 'Restaurant' } },
        audit,
      ),
    ).rejects.toMatchObject({ status: 404, code: 'ZONE_NOT_FOUND' })
  })

  it('validates a changed Zone and skips unchanged updates', async () => {
    repository.findById.mockResolvedValue(restaurant)
    repository.zoneExists.mockResolvedValue(false)

    await expect(
      service().update('restaurant_1', { zoneId: 'missing' }, audit),
    ).rejects.toMatchObject({ status: 404, code: 'ZONE_NOT_FOUND' })

    await service().update(
      'restaurant_1',
      { name: { th: restaurant.nameTh, en: restaurant.nameEn } },
      audit,
    )
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('clears imageKey when assigning a manual external image URL', async () => {
    repository.findById.mockResolvedValue({
      ...restaurant,
      imageKey: '123e4567-e89b-42d3-a456-426614174000.jpg',
      imageUrl: '/uploads/123e4567-e89b-42d3-a456-426614174000.jpg',
    })
    repository.update.mockResolvedValue({
      ...restaurant,
      imageUrl: 'https://example.com/new.jpg',
    })

    await service().update(
      'restaurant_1',
      { imageUrl: 'https://example.com/new.jpg' },
      audit,
    )

    expect(repository.update).toHaveBeenCalledWith(
      'restaurant_1',
      { imageKey: null, imageUrl: 'https://example.com/new.jpg' },
      audit,
    )
  })

  it('soft-deletes active Restaurants and skips repeated delete', async () => {
    repository.findById
      .mockResolvedValueOnce(restaurant)
      .mockResolvedValueOnce({
        ...restaurant,
        deletedAt: new Date('2026-09-29T01:00:00.000Z'),
      })
    repository.softDelete.mockResolvedValue({
      restaurant: { ...restaurant, deletedAt: new Date() },
      affectedMenuItemCount: 2,
      changed: true,
    })

    await service().delete('restaurant_1', audit)
    await service().delete('restaurant_1', audit)

    expect(repository.softDelete).toHaveBeenCalledTimes(1)
    expect(repository.softDelete).toHaveBeenCalledWith('restaurant_1', audit)
  })

  it('restores only deleted Restaurants and skips repeated restore', async () => {
    repository.findById
      .mockResolvedValueOnce({
        ...restaurant,
        deletedAt: new Date('2026-09-29T01:00:00.000Z'),
      })
      .mockResolvedValueOnce(restaurant)
    repository.restore.mockResolvedValue({ restaurant, changed: true })

    await service().restore('restaurant_1', audit)
    await service().restore('restaurant_1', audit)

    expect(repository.restore).toHaveBeenCalledTimes(1)
  })
})
