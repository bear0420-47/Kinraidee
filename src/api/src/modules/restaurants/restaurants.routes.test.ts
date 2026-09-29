import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  authCookie,
  createRouteTestApp,
  stubTestEnv,
} from '@/test/routeTestApp'

const restaurant = {
  id: 'restaurant_1',
  zone: { id: 'zone_1', name: { th: 'หน้ามอ', en: 'Front Gate' } },
  name: { th: 'ร้านครัวไทย', en: 'Thai Kitchen' },
  description: null,
  phone: '053-123-456',
  imageUrl: null,
  deletedAt: null,
  createdAt: '2026-09-29T00:00:00.000Z',
  updatedAt: '2026-09-29T00:00:00.000Z',
}
const validBody = {
  zoneId: 'zone_1',
  name: { th: 'ร้านครัวไทย', en: 'Thai Kitchen' },
  phone: ' 053-123-456 ',
}

const service = {
  list: vi.fn(),
  detail: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  restore: vi.fn(),
}

let app: Express
let adminCookie: string
let userCookie: string

beforeAll(async () => {
  stubTestEnv()
  const { createRestaurantsController } =
    await import('./restaurants.controller')
  const { createRestaurantsRoutes } = await import('./restaurants.routes')
  app = await createRouteTestApp(
    '/api/restaurants',
    createRestaurantsRoutes(createRestaurantsController(service as never)),
  )
  adminCookie = await authCookie('ADMIN')
  userCookie = await authCookie('USER')
})

beforeEach(() => {
  vi.resetAllMocks()
})

const protectedRoutes = [
  ['get', '/api/restaurants'],
  ['get', '/api/restaurants/restaurant_1'],
  ['post', '/api/restaurants'],
  ['patch', '/api/restaurants/restaurant_1'],
  ['delete', '/api/restaurants/restaurant_1'],
  ['post', '/api/restaurants/restaurant_1/restore'],
] as const

function serviceWasCalled() {
  return Object.values(service).some((fn) => fn.mock.calls.length > 0)
}

describe('Restaurant routes', () => {
  it.each(protectedRoutes)(
    '%s %s rejects anonymous requests with 401',
    async (method, path) => {
      const response = await request(app)[method](path).send(validBody)

      expect(response.status).toBe(401)
      expect(serviceWasCalled()).toBe(false)
    },
  )

  it.each(protectedRoutes)(
    '%s %s rejects USER with 403',
    async (method, path) => {
      const pending = request(app)[method](path)
      const response = await pending.set('Cookie', userCookie).send(validBody)

      expect(response.status).toBe(403)
      expect(serviceWasCalled()).toBe(false)
    },
  )

  it('lets ADMIN list with filters and pagination metadata', async () => {
    service.list.mockResolvedValue({
      items: [restaurant],
      meta: { page: 2, pageSize: 100, total: 101 },
    })

    const response = await request(app)
      .get(
        '/api/restaurants?includeDeleted=true&zoneId=zone_1&search=Kitchen&page=2&pageSize=100',
      )
      .set('Cookie', adminCookie)

    expect(response.status).toBe(200)
    expect(response.body.meta).toEqual({ page: 2, pageSize: 100, total: 101 })
    expect(service.list).toHaveBeenCalledWith({
      includeDeleted: true,
      zoneId: 'zone_1',
      search: 'Kitchen',
      page: 2,
      pageSize: 100,
    })
  })

  it('lets ADMIN read active or deleted Restaurant detail', async () => {
    service.detail.mockResolvedValue({
      ...restaurant,
      deletedAt: '2026-09-29T01:00:00.000Z',
    })

    const response = await request(app)
      .get('/api/restaurants/restaurant_1')
      .set('Cookie', adminCookie)

    expect(response.status).toBe(200)
    expect(response.body.data.restaurant.deletedAt).toBe(
      '2026-09-29T01:00:00.000Z',
    )
  })

  it('lets ADMIN create with normalized contact data', async () => {
    service.create.mockResolvedValue(restaurant)

    const response = await request(app)
      .post('/api/restaurants')
      .set('Cookie', adminCookie)
      .send(validBody)

    expect(response.status).toBe(201)
    expect(service.create).toHaveBeenCalledWith(
      { ...validBody, phone: '053-123-456' },
      expect.objectContaining({ actorId: 'admin_1' }),
    )
  })

  it('lets ADMIN update, delete, and restore', async () => {
    service.update.mockResolvedValue({
      ...restaurant,
      name: { th: 'ครัวใหม่', en: 'New Kitchen' },
    })
    service.restore.mockResolvedValue(restaurant)

    const updated = await request(app)
      .patch('/api/restaurants/restaurant_1')
      .set('Cookie', adminCookie)
      .send({ name: { th: 'ครัวใหม่', en: 'New Kitchen' } })
    const deleted = await request(app)
      .delete('/api/restaurants/restaurant_1')
      .set('Cookie', adminCookie)
    const restored = await request(app)
      .post('/api/restaurants/restaurant_1/restore')
      .set('Cookie', adminCookie)

    expect(updated.status).toBe(200)
    expect(deleted.status).toBe(204)
    expect(restored.status).toBe(200)
    expect(service.delete).toHaveBeenCalledWith(
      'restaurant_1',
      expect.objectContaining({ actorId: 'admin_1' }),
    )
  })

  it('rejects invalid list and create input before service calls', async () => {
    const invalidList = await request(app)
      .get('/api/restaurants?pageSize=101')
      .set('Cookie', adminCookie)
    const invalidCreate = await request(app)
      .post('/api/restaurants')
      .set('Cookie', adminCookie)
      .send({ ...validBody, imageUrl: 'not-a-url' })

    expect(invalidList.status).toBe(400)
    expect(invalidList.body.error.fields).toHaveProperty('pageSize')
    expect(invalidCreate.status).toBe(400)
    expect(invalidCreate.body.error.fields).toHaveProperty('imageUrl')
    expect(serviceWasCalled()).toBe(false)
  })
})
