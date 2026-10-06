import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  authCookie,
  createRouteTestApp,
  stubTestEnv,
} from '@/test/routeTestApp'

const preference = {
  budget: 'BETWEEN_50_100',
  zoneId: 'zone_1',
  foodTypeId: null,
  tasteId: 'taste_1',
}

const service = {
  get: vi.fn(),
  replace: vi.fn(),
  clear: vi.fn(),
}

let app: Express
let userCookie: string
let adminCookie: string

beforeAll(async () => {
  stubTestEnv()
  const { createPreferencesController } =
    await import('./preferences.controller')
  const { createPreferencesRoutes } = await import('./preferences.routes')
  app = await createRouteTestApp(
    '/api/preferences',
    createPreferencesRoutes(createPreferencesController(service as never)),
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

describe('Preference routes', () => {
  it.each(['get', 'put', 'delete'] as const)(
    '%s rejects anonymous requests with 401',
    async (method) => {
      const agent = request(app)
      const response = await agent[method]('/api/preferences').send(preference)

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('UNAUTHENTICATED')
      expect(serviceWasCalled()).toBe(false)
    },
  )

  it.each([
    ['USER', 'user_1'],
    ['ADMIN', 'admin_1'],
  ] as const)(
    'lets %s read, save, and clear their own preference',
    async (role, userId) => {
      const cookie = role === 'USER' ? userCookie : adminCookie
      service.get.mockResolvedValue(null)
      service.replace.mockResolvedValue(preference)

      const missing = await request(app)
        .get('/api/preferences')
        .set('Cookie', cookie)
      const saved = await request(app)
        .put('/api/preferences')
        .set('Cookie', cookie)
        .send(preference)
      const cleared = await request(app)
        .delete('/api/preferences')
        .set('Cookie', cookie)

      expect(missing.body).toEqual({ data: { preference: null } })
      expect(saved.status).toBe(200)
      expect(saved.body).toEqual({ data: { preference } })
      expect(cleared.status).toBe(204)
      expect(service.get).toHaveBeenCalledWith(userId)
      expect(service.replace).toHaveBeenCalledWith(userId, preference)
      expect(service.clear).toHaveBeenCalledWith(userId)
    },
  )

  it.each([
    [
      'an all-null body',
      { budget: null, zoneId: null, foodTypeId: null, tasteId: null },
    ],
    ['a partial body', { budget: 'UNDER_50' }],
    ['an unknown budget', { ...preference, budget: 'FREE' }],
    ['a client-supplied user', { ...preference, userId: 'user_2' }],
    ['an allergy field', { ...preference, allergies: ['peanut'] }],
  ])('rejects %s with 400 before saving', async (_, body) => {
    const response = await request(app)
      .put('/api/preferences')
      .set('Cookie', userCookie)
      .send(body)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(service.replace).not.toHaveBeenCalled()
  })

  it('never takes the user from the query', async () => {
    service.get.mockResolvedValue(null)

    await request(app)
      .get('/api/preferences?userId=user_2')
      .set('Cookie', userCookie)

    expect(service.get).toHaveBeenCalledWith('user_1')
  })
})
