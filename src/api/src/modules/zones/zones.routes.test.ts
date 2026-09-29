import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@/shared/httpError'
import {
  authCookie,
  createRouteTestApp,
  stubTestEnv,
} from '@/test/routeTestApp'

const publicZone = {
  id: 'zone_1',
  name: { th: 'หน้ามอ', en: 'Front Gate' },
  description: null,
  sortOrder: 0,
}
const adminZone = {
  ...publicZone,
  createdAt: '2026-09-28T00:00:00.000Z',
  updatedAt: '2026-09-28T00:00:00.000Z',
}
const validBody = { name: { th: 'หน้ามอ', en: 'Front Gate' }, sortOrder: 0 }

const service = {
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

let app: Express
let adminCookie: string
let userCookie: string

beforeAll(async () => {
  stubTestEnv()
  const { createZonesController } = await import('./zones.controller')
  const { createZonesRoutes } = await import('./zones.routes')
  app = await createRouteTestApp(
    '/api/zones',
    createZonesRoutes(createZonesController(service as never)),
  )
  adminCookie = await authCookie('ADMIN')
  userCookie = await authCookie('USER')
})

beforeEach(() => {
  vi.resetAllMocks()
})

const mutations = [
  ['POST', '/api/zones'],
  ['PATCH', '/api/zones/zone_1'],
  ['DELETE', '/api/zones/zone_1'],
] as const

function send(method: 'POST' | 'PATCH' | 'DELETE', path: string) {
  const builder =
    method === 'POST'
      ? request(app).post(path)
      : method === 'PATCH'
        ? request(app).patch(path)
        : request(app).delete(path)
  return builder
}

describe('zone routes', () => {
  it('lists zones publicly without timestamps', async () => {
    service.list.mockResolvedValue([publicZone])

    const response = await request(app).get('/api/zones')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ data: { items: [publicZone] } })
  })

  it.each(mutations)(
    '%s %s rejects anonymous requests with 401',
    async (method, path) => {
      const response = await send(method, path).send(validBody)

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('UNAUTHENTICATED')
      expect(Object.values(service).some((fn) => fn.mock.calls.length)).toBe(
        false,
      )
    },
  )

  it.each(mutations)('%s %s rejects USER with 403', async (method, path) => {
    const response = await send(method, path)
      .set('Cookie', userCookie)
      .send(validBody)

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(Object.values(service).some((fn) => fn.mock.calls.length)).toBe(
      false,
    )
  })

  it('lets ADMIN create a zone and passes the audit context', async () => {
    service.create.mockResolvedValue(adminZone)

    const response = await request(app)
      .post('/api/zones')
      .set('Cookie', adminCookie)
      .send({ ...validBody, name: { th: ' หน้ามอ ', en: 'Front Gate' } })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ data: { zone: adminZone } })
    expect(service.create).toHaveBeenCalledWith(validBody, {
      actorId: 'admin_1',
      requestId: expect.stringMatching(/^req_/),
    })
  })

  it('returns field-level validation errors before calling the service', async () => {
    const response = await request(app)
      .post('/api/zones')
      .set('Cookie', adminCookie)
      .send({ name: { th: 'หน้ามอ', en: '' }, sortOrder: 0 })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      fields: { 'name.en': 'Must not be empty.' },
    })
    expect(service.create).not.toHaveBeenCalled()
  })

  it('lets ADMIN update a zone by id', async () => {
    service.update.mockResolvedValue({ ...adminZone, sortOrder: 3 })

    const response = await request(app)
      .patch('/api/zones/zone_1')
      .set('Cookie', adminCookie)
      .send({ sortOrder: 3 })

    expect(response.status).toBe(200)
    expect(response.body.data.zone.sortOrder).toBe(3)
    expect(service.update).toHaveBeenCalledWith(
      'zone_1',
      { sortOrder: 3 },
      expect.objectContaining({ actorId: 'admin_1' }),
    )
  })

  it('rejects an empty update body', async () => {
    const response = await request(app)
      .patch('/api/zones/zone_1')
      .set('Cookie', adminCookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.error.fields).toEqual({
      body: 'At least one field is required.',
    })
  })

  it('lets ADMIN delete a zone', async () => {
    service.delete.mockResolvedValue(undefined)

    const response = await request(app)
      .delete('/api/zones/zone_1')
      .set('Cookie', adminCookie)

    expect(response.status).toBe(204)
    expect(response.text).toBe('')
    expect(service.delete).toHaveBeenCalledWith(
      'zone_1',
      expect.objectContaining({ actorId: 'admin_1' }),
    )
  })

  it.each([
    [404, 'ZONE_NOT_FOUND'],
    [409, 'ZONE_IN_USE'],
  ])(
    'returns service error %i %s in the error envelope',
    async (status, code) => {
      service.delete.mockRejectedValue(
        new HttpError({ status, code, message: 'Safe message.' }),
      )

      const response = await request(app)
        .delete('/api/zones/zone_1')
        .set('Cookie', adminCookie)

      expect(response.status).toBe(status)
      expect(response.body.error).toMatchObject({
        code,
        message: 'Safe message.',
        requestId: expect.stringMatching(/^req_/),
      })
    },
  )
})
