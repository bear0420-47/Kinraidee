import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  authCookie,
  createRouteTestApp,
  stubTestEnv,
} from '@/test/routeTestApp'

const publicTaste = {
  id: 'taste_1',
  name: { th: 'เผ็ด', en: 'Spicy' },
  icon: 'flame',
  sortOrder: 0,
}
const adminTaste = {
  ...publicTaste,
  createdAt: '2026-09-28T00:00:00.000Z',
  updatedAt: '2026-09-28T00:00:00.000Z',
}
const validBody = {
  name: { th: 'เผ็ด', en: 'Spicy' },
  icon: 'flame',
  sortOrder: 0,
}

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
  const { createTastesController } = await import('./tastes.controller')
  const { createTastesRoutes } = await import('./tastes.routes')
  app = await createRouteTestApp(
    '/api/tastes',
    createTastesRoutes(createTastesController(service as never)),
  )
  adminCookie = await authCookie('ADMIN')
  userCookie = await authCookie('USER')
})

beforeEach(() => {
  vi.resetAllMocks()
})

const mutations = [
  ['post', '/api/tastes'],
  ['patch', '/api/tastes/taste_1'],
  ['delete', '/api/tastes/taste_1'],
] as const

function serviceWasCalled() {
  return Object.values(service).some((fn) => fn.mock.calls.length > 0)
}

describe('taste routes', () => {
  it('lists tastes publicly', async () => {
    service.list.mockResolvedValue([publicTaste])

    const response = await request(app).get('/api/tastes')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ data: { items: [publicTaste] } })
  })

  it.each(mutations)(
    '%s %s rejects anonymous requests with 401',
    async (method, path) => {
      const response = await request(app)[method](path).send(validBody)

      expect(response.status).toBe(401)
      expect(serviceWasCalled()).toBe(false)
    },
  )

  it.each(mutations)('%s %s rejects USER with 403', async (method, path) => {
    const pending = request(app)[method](path)
    const response = await pending.set('Cookie', userCookie).send(validBody)

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(serviceWasCalled()).toBe(false)
  })

  it('lets ADMIN create a taste with an empty icon stored as null', async () => {
    service.create.mockResolvedValue({ ...adminTaste, icon: null })

    const response = await request(app)
      .post('/api/tastes')
      .set('Cookie', adminCookie)
      .send({ ...validBody, icon: '' })

    expect(response.status).toBe(201)
    expect(response.body.data.taste.icon).toBeNull()
    expect(service.create).toHaveBeenCalledWith(
      { ...validBody, icon: null },
      expect.objectContaining({ actorId: 'admin_1' }),
    )
  })

  it('rejects an SVG icon with a field error', async () => {
    const response = await request(app)
      .post('/api/tastes')
      .set('Cookie', adminCookie)
      .send({ ...validBody, icon: '<svg></svg>' })

    expect(response.status).toBe(400)
    expect(response.body.error.fields).toHaveProperty('icon')
    expect(service.create).not.toHaveBeenCalled()
  })

  it('lets ADMIN update and delete a taste', async () => {
    service.update.mockResolvedValue({ ...adminTaste, sortOrder: 2 })

    const updated = await request(app)
      .patch('/api/tastes/taste_1')
      .set('Cookie', adminCookie)
      .send({ sortOrder: 2 })
    const deleted = await request(app)
      .delete('/api/tastes/taste_1')
      .set('Cookie', adminCookie)

    expect(updated.status).toBe(200)
    expect(updated.body.data.taste.sortOrder).toBe(2)
    expect(deleted.status).toBe(204)
    expect(service.delete).toHaveBeenCalledWith(
      'taste_1',
      expect.objectContaining({ actorId: 'admin_1' }),
    )
  })
})
