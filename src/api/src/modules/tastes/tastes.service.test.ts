import { Prisma, type Taste } from '@prisma/client'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { stubTestEnv } from '@/test/routeTestApp'
import type { TastesRepository } from './tastes.repository'

let createTastesService: typeof import('./tastes.service').createTastesService

beforeAll(async () => {
  stubTestEnv()
  ;({ createTastesService } = await import('./tastes.service'))
})

const audit = { actorId: 'admin_1', requestId: 'req_test' }

const taste: Taste = {
  id: 'taste_1',
  nameTh: 'เผ็ด',
  nameEn: 'Spicy',
  icon: 'flame',
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

describe('tastes service', () => {
  const repository = {
    list: vi.fn(),
    findById: vi.fn(),
    countMenuItemLinks: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
  const service = () =>
    createTastesService(repository as unknown as TastesRepository)

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('lists tastes in repository order without timestamps', async () => {
    repository.list.mockResolvedValue([taste, { ...taste, id: 'taste_2' }])

    const items = await service().list()

    expect(items.map((item) => item.id)).toEqual(['taste_1', 'taste_2'])
    expect(items[0]).not.toHaveProperty('createdAt')
  })

  it('creates a taste with the audit context', async () => {
    repository.create.mockResolvedValue(taste)

    const result = await service().create(
      { name: { th: 'เผ็ด', en: 'Spicy' }, icon: 'flame', sortOrder: 0 },
      audit,
    )

    expect(repository.create).toHaveBeenCalledWith(
      { nameTh: 'เผ็ด', nameEn: 'Spicy', icon: 'flame', sortOrder: 0 },
      audit,
    )
    expect(result.icon).toBe('flame')
  })

  it('maps a duplicate English name to 409 with the field', async () => {
    repository.create.mockRejectedValue(
      prismaError('P2002', { target: ['nameEn'] }),
    )

    await expect(
      service().create({ name: { th: 'ก', en: 'Spicy' }, sortOrder: 0 }, audit),
    ).rejects.toMatchObject({
      status: 409,
      code: 'TASTE_NAME_ALREADY_EXISTS',
      fields: { 'name.en': 'Already used by another taste.' },
    })
  })

  it('returns 404 when updating an unknown taste', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(
      service().update('missing', { sortOrder: 1 }, audit),
    ).rejects.toMatchObject({ status: 404, code: 'TASTE_NOT_FOUND' })
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('skips the write when nothing changed', async () => {
    repository.findById.mockResolvedValue(taste)

    await service().update('taste_1', { icon: 'flame' }, audit)

    expect(repository.update).not.toHaveBeenCalled()
  })

  it('clears the icon when updated to null', async () => {
    repository.findById.mockResolvedValue(taste)
    repository.update.mockResolvedValue({ ...taste, icon: null })

    const result = await service().update('taste_1', { icon: null }, audit)

    expect(repository.update).toHaveBeenCalledWith(
      'taste_1',
      { icon: null },
      audit,
    )
    expect(result.icon).toBeNull()
  })

  it('blocks deleting a taste that menu items use', async () => {
    repository.findById.mockResolvedValue(taste)
    repository.countMenuItemLinks.mockResolvedValue(1)

    await expect(service().delete('taste_1', audit)).rejects.toMatchObject({
      status: 409,
      code: 'TASTE_IN_USE',
      message:
        'Remove or change this taste on every menu item before deleting it.',
    })
    expect(repository.delete).not.toHaveBeenCalled()
  })

  it('maps a taste link added after the check to TASTE_IN_USE', async () => {
    repository.findById.mockResolvedValue(taste)
    repository.countMenuItemLinks.mockResolvedValue(0)
    repository.delete.mockRejectedValue(prismaError('P2003'))

    await expect(service().delete('taste_1', audit)).rejects.toMatchObject({
      status: 409,
      code: 'TASTE_IN_USE',
    })
  })

  it('deletes an unreferenced taste with the audit context', async () => {
    repository.findById.mockResolvedValue(taste)
    repository.countMenuItemLinks.mockResolvedValue(0)

    await service().delete('taste_1', audit)

    expect(repository.delete).toHaveBeenCalledWith('taste_1', audit)
  })

  it('returns 404 when deleting an unknown taste', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(service().delete('missing', audit)).rejects.toMatchObject({
      status: 404,
      code: 'TASTE_NOT_FOUND',
    })
  })
})
