import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@/shared/httpError'
import {
  authCookie,
  createRouteTestApp,
  stubTestEnv,
} from '@/test/routeTestApp'

const record = {
  id: 'history_1',
  menuItemId: 'menu_1',
  selectedAt: '2026-10-07T00:00:00.000Z',
}

const service = {
  list: vi.fn(),
  record: vi.fn(),
  clear: vi.fn(),
}

let app: Express
let userCookie: string
let adminCookie: string

beforeAll(async () => {
  stubTestEnv()
  const { createRecommendationHistoryController } =
    await import('./recommendation-history.controller')
  const { createRecommendationHistoryRoutes } =
    await import('./recommendation-history.routes')
  app = await createRouteTestApp(
    '/api/recommendation-history',
    createRecommendationHistoryRoutes(
      createRecommendationHistoryController(service as never),
    ),
  )
  userCookie = await authCookie('USER')
  adminCookie = await authCookie('ADMIN')
})

beforeEach(() => {
  vi.resetAllMocks()
})

function serviceWasCalled() {
  return Object.values(service).some((fn) => fn.mock.calls.length > 0)
}

describe('Recommendation history routes', () => {
  it.each(['get', 'post', 'delete'] as const)(
    '%s rejects anonymous requests with 401',
    async (method) => {
      const agent = request(app)
      const response = await agent[method]('/api/recommendation-history').send({
        menuItemId: 'menu_1',
      })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('UNAUTHENTICATED')
      expect(serviceWasCalled()).toBe(false)
    },
  )

  it.each([
    ['USER', 'user_1'],
    ['ADMIN', 'admin_1'],
  ] as const)(
    'lets %s record, list, and clear their own history',
    async (role, userId) => {
      const cookie = role === 'USER' ? userCookie : adminCookie
      service.record.mockResolvedValue(record)
      service.list.mockResolvedValue({
        items: [],
        meta: { page: 2, pageSize: 10, total: 11 },
      })

      const recorded = await request(app)
        .post('/api/recommendation-history')
        .set('Cookie', cookie)
        .send({ menuItemId: 'menu_1' })
      const listed = await request(app)
        .get('/api/recommendation-history?page=2&pageSize=10')
        .set('Cookie', cookie)
      const cleared = await request(app)
        .delete('/api/recommendation-history')
        .set('Cookie', cookie)

      expect(recorded.status).toBe(201)
      expect(recorded.body).toEqual({ data: { history: record } })
      expect(listed.body).toEqual({
        data: { items: [] },
        meta: { page: 2, pageSize: 10, total: 11 },
      })
      expect(cleared.status).toBe(204)
      expect(service.record).toHaveBeenCalledWith(userId, 'menu_1')
      expect(service.list).toHaveBeenCalledWith(userId, {
        page: 2,
        pageSize: 10,
      })
      expect(service.clear).toHaveBeenCalledWith(userId)
    },
  )

  it.each([
    ['a client-supplied user', { menuItemId: 'menu_1', userId: 'user_2' }],
    ['session conditions', { menuItemId: 'menu_1', conditions: {} }],
    ['no MenuItem', {}],
  ])('rejects %s with 400 before recording', async (_, body) => {
    const response = await request(app)
      .post('/api/recommendation-history')
      .set('Cookie', userCookie)
      .send(body)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(service.record).not.toHaveBeenCalled()
  })

  it('rejects a page size over 100', async () => {
    const response = await request(app)
      .get('/api/recommendation-history?pageSize=101')
      .set('Cookie', userCookie)

    expect(response.status).toBe(400)
    expect(service.list).not.toHaveBeenCalled()
  })

  it('passes a 409 for an unavailable MenuItem through', async () => {
    service.record.mockRejectedValue(
      new HttpError({
        status: 409,
        code: 'MENU_ITEM_UNAVAILABLE',
        message: 'Unavailable.',
      }),
    )

    const response = await request(app)
      .post('/api/recommendation-history')
      .set('Cookie', userCookie)
      .send({ menuItemId: 'menu_1' })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('MENU_ITEM_UNAVAILABLE')
  })
})
