import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@/shared/httpError'
import {
  authCookie,
  createRouteTestApp,
  stubTestEnv,
} from '@/test/routeTestApp'

const favoriteItem = {
  menuItemId: 'menu_1',
  createdAt: '2026-10-07T00:00:00.000Z',
  available: true,
  menuItem: {
    id: 'menu_1',
    name: { th: 'ข้าวกะเพรา', en: 'Basil Rice' },
    price: 65,
    imageUrl: null,
    restaurant: {
      id: 'restaurant_1',
      name: { th: 'ร้านอาหาร', en: 'Restaurant' },
    },
  },
}

const service = {
  list: vi.fn(),
  favorite: vi.fn(),
  unfavorite: vi.fn(),
  toggle: vi.fn(),
}

let app: Express
let userCookie: string
let adminCookie: string

beforeAll(async () => {
  stubTestEnv()
  const { createFavoritesController } = await import('./favorites.controller')
  const { createFavoritesRoutes } = await import('./favorites.routes')
  app = await createRouteTestApp(
    '/api/favorites',
    createFavoritesRoutes(createFavoritesController(service as never)),
  )
  userCookie = await authCookie('USER')
  adminCookie = await authCookie('ADMIN')
})

beforeEach(() => {
  vi.resetAllMocks()
})

const routes = [
  ['get', '/api/favorites'],
  ['put', '/api/favorites/menu_1'],
  ['delete', '/api/favorites/menu_1'],
  ['post', '/api/favorites/menu_1/toggle'],
] as const

function serviceWasCalled() {
  return Object.values(service).some((fn) => fn.mock.calls.length > 0)
}

describe('Favorite routes', () => {
  it.each(routes)(
    '%s %s rejects anonymous requests with 401',
    async (method, path) => {
      const response = await request(app)[method](path)

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('UNAUTHENTICATED')
      expect(serviceWasCalled()).toBe(false)
    },
  )

  it.each([
    ['USER', 'user_1'],
    ['ADMIN', 'admin_1'],
  ] as const)(
    'lets %s list, favorite, unfavorite, and toggle their own favorites',
    async (role, userId) => {
      const cookie = role === 'USER' ? userCookie : adminCookie
      service.list.mockResolvedValue([favoriteItem])
      service.favorite.mockResolvedValue({
        menuItemId: 'menu_1',
        favorited: true,
      })
      service.unfavorite.mockResolvedValue({
        menuItemId: 'menu_1',
        favorited: false,
      })
      service.toggle.mockResolvedValue({
        menuItemId: 'menu_1',
        favorited: true,
      })

      const list = await request(app)
        .get('/api/favorites')
        .set('Cookie', cookie)
      const put = await request(app)
        .put('/api/favorites/menu_1')
        .set('Cookie', cookie)
      const remove = await request(app)
        .delete('/api/favorites/menu_1')
        .set('Cookie', cookie)
      const toggle = await request(app)
        .post('/api/favorites/menu_1/toggle')
        .set('Cookie', cookie)

      expect(list.status).toBe(200)
      expect(list.body).toEqual({ data: { items: [favoriteItem] } })
      expect(put.body).toEqual({
        data: { menuItemId: 'menu_1', favorited: true },
      })
      expect(remove.body).toEqual({
        data: { menuItemId: 'menu_1', favorited: false },
      })
      expect(toggle.body).toEqual({
        data: { menuItemId: 'menu_1', favorited: true },
      })
      expect(service.list).toHaveBeenCalledWith(userId)
      expect(service.favorite).toHaveBeenCalledWith(userId, 'menu_1')
      expect(service.unfavorite).toHaveBeenCalledWith(userId, 'menu_1')
      expect(service.toggle).toHaveBeenCalledWith(userId, 'menu_1')
    },
  )

  it('never takes the user from the query or body', async () => {
    service.favorite.mockResolvedValue({
      menuItemId: 'menu_1',
      favorited: true,
    })

    await request(app)
      .put('/api/favorites/menu_1?userId=user_2')
      .set('Cookie', userCookie)
      .send({ userId: 'user_2' })

    expect(service.favorite).toHaveBeenCalledWith('user_1', 'menu_1')
  })

  it('rejects a blank MenuItem ID', async () => {
    const response = await request(app)
      .put('/api/favorites/%20')
      .set('Cookie', userCookie)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(serviceWasCalled()).toBe(false)
  })

  it.each([
    [404, 'MENU_ITEM_NOT_FOUND'],
    [409, 'MENU_ITEM_UNAVAILABLE'],
  ])('passes a %s %s from the service through', async (status, code) => {
    service.toggle.mockRejectedValue(
      new HttpError({ status, code, message: 'Rejected.' }),
    )

    const response = await request(app)
      .post('/api/favorites/menu_1/toggle')
      .set('Cookie', userCookie)

    expect(response.status).toBe(status)
    expect(response.body.error.code).toBe(code)
  })
})
