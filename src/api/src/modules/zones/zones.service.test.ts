import { Prisma, type Zone } from '@prisma/client'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { stubTestEnv } from '@/test/routeTestApp'
import type { ZonesRepository } from './zones.repository'

let createZonesService: typeof import('./zones.service').createZonesService

beforeAll(async () => {
  stubTestEnv()
  ;({ createZonesService } = await import('./zones.service'))
})

const audit = { actorId: 'admin_1', requestId: 'req_test' }

const zone: Zone = {
  id: 'zone_1',
  nameTh: 'หน้ามอ',
  nameEn: 'Front Gate',
  descriptionTh: 'บริเวณหน้ามหาวิทยาลัย',
  descriptionEn: 'University front gate area',
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

describe('zones service', () => {
  const repository = {
    list: vi.fn(),
    findById: vi.fn(),
    countRestaurants: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
  const service = () =>
    createZonesService(repository as unknown as ZonesRepository)

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('lists zones in repository order without timestamps', async () => {
    const second = { ...zone, id: 'zone_2', sortOrder: 1 }
    repository.list.mockResolvedValue([zone, second])

    const items = await service().list()

    expect(items.map((item) => item.id)).toEqual(['zone_1', 'zone_2'])
    expect(items[0]).not.toHaveProperty('createdAt')
    expect(items[0]).not.toHaveProperty('updatedAt')
  })

  it('creates a zone with the audit context and returns the admin shape', async () => {
    repository.create.mockResolvedValue(zone)

    const result = await service().create(
      { name: { th: 'หน้ามอ', en: 'Front Gate' }, sortOrder: 0 },
      audit,
    )

    expect(repository.create).toHaveBeenCalledWith(
      {
        nameTh: 'หน้ามอ',
        nameEn: 'Front Gate',
        descriptionTh: null,
        descriptionEn: null,
        sortOrder: 0,
      },
      audit,
    )
    expect(result.createdAt).toBe('2026-09-28T00:00:00.000Z')
  })

  it.each([
    [['nameTh'], { 'name.th': 'Already used by another zone.' }],
    [['nameEn'], { 'name.en': 'Already used by another zone.' }],
    [undefined, { name: 'Already used by another zone.' }],
  ])('maps duplicate %j names to 409', async (target, fields) => {
    repository.create.mockRejectedValue(
      prismaError('P2002', target ? { target } : undefined),
    )

    await expect(
      service().create({ name: { th: 'ก', en: 'A' }, sortOrder: 0 }, audit),
    ).rejects.toMatchObject({
      status: 409,
      code: 'ZONE_NAME_ALREADY_EXISTS',
      fields,
    })
  })

  it('returns 404 when updating an unknown zone', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(
      service().update('missing', { sortOrder: 1 }, audit),
    ).rejects.toMatchObject({ status: 404, code: 'ZONE_NOT_FOUND' })
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('returns the current zone without writing when nothing changed', async () => {
    repository.findById.mockResolvedValue(zone)

    const result = await service().update(
      'zone_1',
      { name: { th: 'หน้ามอ', en: 'Front Gate' }, sortOrder: 0 },
      audit,
    )

    expect(result.id).toBe('zone_1')
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('updates changed fields with the audit context', async () => {
    repository.findById.mockResolvedValue(zone)
    repository.update.mockResolvedValue({ ...zone, sortOrder: 5 })

    const result = await service().update('zone_1', { sortOrder: 5 }, audit)

    expect(repository.update).toHaveBeenCalledWith(
      'zone_1',
      { sortOrder: 5 },
      audit,
    )
    expect(result.sortOrder).toBe(5)
  })

  it('maps a zone deleted during update to 404', async () => {
    repository.findById.mockResolvedValue(zone)
    repository.update.mockRejectedValue(prismaError('P2025'))

    await expect(
      service().update('zone_1', { sortOrder: 5 }, audit),
    ).rejects.toMatchObject({ status: 404, code: 'ZONE_NOT_FOUND' })
  })

  it('blocks deleting a zone that restaurants reference', async () => {
    repository.findById.mockResolvedValue(zone)
    repository.countRestaurants.mockResolvedValue(2)

    await expect(service().delete('zone_1', audit)).rejects.toMatchObject({
      status: 409,
      code: 'ZONE_IN_USE',
      message: 'Reassign every restaurant in this zone before deleting it.',
    })
    expect(repository.delete).not.toHaveBeenCalled()
  })

  it('maps a restaurant added after the check to ZONE_IN_USE', async () => {
    repository.findById.mockResolvedValue(zone)
    repository.countRestaurants.mockResolvedValue(0)
    repository.delete.mockRejectedValue(prismaError('P2003'))

    await expect(service().delete('zone_1', audit)).rejects.toMatchObject({
      status: 409,
      code: 'ZONE_IN_USE',
    })
  })

  it('deletes an unreferenced zone with the audit context', async () => {
    repository.findById.mockResolvedValue(zone)
    repository.countRestaurants.mockResolvedValue(0)
    repository.delete.mockResolvedValue(undefined)

    await service().delete('zone_1', audit)

    expect(repository.delete).toHaveBeenCalledWith('zone_1', audit)
  })

  it('returns 404 when deleting an unknown zone', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(service().delete('missing', audit)).rejects.toMatchObject({
      status: 404,
      code: 'ZONE_NOT_FOUND',
    })
    expect(repository.countRestaurants).not.toHaveBeenCalled()
  })

  it('rethrows unexpected database errors unchanged', async () => {
    const unexpected = new Error('connection lost')
    repository.create.mockRejectedValue(unexpected)

    await expect(
      service().create({ name: { th: 'ก', en: 'A' }, sortOrder: 0 }, audit),
    ).rejects.toBe(unexpected)
  })
})
