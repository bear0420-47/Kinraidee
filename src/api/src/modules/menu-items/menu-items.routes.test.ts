import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  authCookie,
  createRouteTestApp,
  stubTestEnv,
} from '@/test/routeTestApp'

const menuItem = {
  id: 'menu_1',
  restaurantId: 'restaurant_1',
  foodTypeId: 'food_type_1',
  restaurant: {
    id: 'restaurant_1',
    name: { th: 'ร้านอาหาร', en: 'Restaurant' },
    deletedAt: null,
  },
  foodType: {
    id: 'food_type_1',
    name: { th: 'ข้าว', en: 'Rice' },
    icon: 'rice',
  },
  tastes: [
    {
      id: 'taste_1',
      name: { th: 'เผ็ด', en: 'Spicy' },
      icon: 'flame',
    },
  ],
  name: { th: 'ข้าวกะเพรา', en: 'Basil Rice' },
  description: null,
  price: 65,
  imageKey: null,
  imageUrl: null,
  deletedAt: null,
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-09-30T00:00:00.000Z',
}
const validBody = {
  restaurantId: 'restaurant_1',
  foodTypeId: 'food_type_1',
  tasteIds: ['taste_1'],
  name: { th: 'ข้าวกะเพรา', en: 'Basil Rice' },
  price: 65,
}

const service = {
  list: vi.fn(),
  detail: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  restore: vi.fn(),
  bulkDelete: vi.fn(),
  bulkRestore: vi.fn(),
}

let app: Express
let adminCookie: string
let userCookie: string

beforeAll(async () => {
  stubTestEnv()
  const { createMenuItemsController } = await import('./menu-items.controller')
  const { createMenuItemsRoutes } = await import('./menu-items.routes')
  app = await createRouteTestApp(
    '/api/menu-items',
    createMenuItemsRoutes(createMenuItemsController(service as never)),
  )
  adminCookie = await authCookie('ADMIN')
  userCookie = await authCookie('USER')
})

beforeEach(() => {
  vi.resetAllMocks()
})

const protectedRoutes = [
  ['get', '/api/menu-items'],
  ['get', '/api/menu-items/menu_1'],
  ['post', '/api/menu-items'],
  ['patch', '/api/menu-items/menu_1'],
  ['delete', '/api/menu-items/menu_1'],
  ['post', '/api/menu-items/menu_1/restore'],
  ['post', '/api/menu-items/bulk-delete'],
  ['post', '/api/menu-items/bulk-restore'],
] as const

function serviceWasCalled() {
  return Object.values(service).some((fn) => fn.mock.calls.length > 0)
}

describe('MenuItem routes', () => {
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

  it('lets ADMIN list with every filter and pagination metadata', async () => {
    service.list.mockResolvedValue({
      items: [menuItem],
      meta: { page: 2, pageSize: 100, total: 101 },
    })

    const response = await request(app)
      .get(
        '/api/menu-items?includeDeleted=true&restaurantId=restaurant_1&foodTypeId=food_type_1&tasteId=taste_1&search=Basil&page=2&pageSize=100',
      )
      .set('Cookie', adminCookie)

    expect(response.status).toBe(200)
    expect(response.body.meta).toEqual({ page: 2, pageSize: 100, total: 101 })
    expect(service.list).toHaveBeenCalledWith({
      includeDeleted: true,
      restaurantId: 'restaurant_1',
      foodTypeId: 'food_type_1',
      tasteId: 'taste_1',
      search: 'Basil',
      page: 2,
      pageSize: 100,
    })
  })

  it('lets ADMIN read, create, update, delete, and restore', async () => {
    service.detail.mockResolvedValue(menuItem)
    service.create.mockResolvedValue(menuItem)
    service.update.mockResolvedValue({ ...menuItem, price: 70 })
    service.restore.mockResolvedValue(menuItem)

    const detail = await request(app)
      .get('/api/menu-items/menu_1')
      .set('Cookie', adminCookie)
    const created = await request(app)
      .post('/api/menu-items')
      .set('Cookie', adminCookie)
      .send(validBody)
    const updated = await request(app)
      .patch('/api/menu-items/menu_1')
      .set('Cookie', adminCookie)
      .send({ price: 70 })
    const deleted = await request(app)
      .delete('/api/menu-items/menu_1')
      .set('Cookie', adminCookie)
    const restored = await request(app)
      .post('/api/menu-items/menu_1/restore')
      .set('Cookie', adminCookie)

    expect(detail.status).toBe(200)
    expect(created.status).toBe(201)
    expect(updated.status).toBe(200)
    expect(deleted.status).toBe(204)
    expect(restored.status).toBe(200)
    expect(service.create).toHaveBeenCalledWith(
      validBody,
      expect.objectContaining({ actorId: 'admin_1' }),
    )
  })

  it('lets ADMIN bulk delete and restore explicit deduplicated IDs', async () => {
    service.bulkDelete.mockResolvedValue({ updatedCount: 2 })
    service.bulkRestore.mockResolvedValue({ updatedCount: 1 })

    const deleted = await request(app)
      .post('/api/menu-items/bulk-delete')
      .set('Cookie', adminCookie)
      .send({ ids: ['menu_1', 'menu_1', 'menu_2'] })
    const restored = await request(app)
      .post('/api/menu-items/bulk-restore')
      .set('Cookie', adminCookie)
      .send({ ids: ['menu_1'] })

    expect(deleted.status).toBe(200)
    expect(deleted.body.data).toEqual({ updatedCount: 2 })
    expect(restored.status).toBe(200)
    expect(service.bulkDelete).toHaveBeenCalledWith(
      ['menu_1', 'menu_2'],
      expect.objectContaining({ actorId: 'admin_1' }),
    )
  })

  it('rejects invalid boundary input before service calls', async () => {
    const invalidList = await request(app)
      .get('/api/menu-items?pageSize=101')
      .set('Cookie', adminCookie)
    const invalidCreate = await request(app)
      .post('/api/menu-items')
      .set('Cookie', adminCookie)
      .send({ ...validBody, price: 0 })
    const invalidBulk = await request(app)
      .post('/api/menu-items/bulk-delete')
      .set('Cookie', adminCookie)
      .send({ ids: [] })

    expect(invalidList.status).toBe(400)
    expect(invalidCreate.status).toBe(400)
    expect(invalidBulk.status).toBe(400)
    expect(serviceWasCalled()).toBe(false)
  })
})
