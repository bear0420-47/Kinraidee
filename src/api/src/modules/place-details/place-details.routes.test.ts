import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { createRouteTestApp, stubTestEnv } from '@/test/routeTestApp'

const service = { get: vi.fn() }
let app: Express

beforeAll(async () => {
  stubTestEnv()
  const { createPlaceDetailsController } =
    await import('./place-details.controller')
  const { createPlaceDetailsRoutes } = await import('./place-details.routes')
  app = await createRouteTestApp(
    '/api/restaurants',
    createPlaceDetailsRoutes(createPlaceDetailsController(service)),
  )
})

beforeEach(() => vi.resetAllMocks())

describe('place details route', () => {
  it('is public and returns transient details', async () => {
    service.get.mockResolvedValue({
      rating: 4.5,
      userRatingCount: 10,
      openNow: true,
      weekdayDescriptions: [],
      googleMapsUri: null,
      reviews: [],
    })

    const response = await request(app).get(
      '/api/restaurants/restaurant_1/place-details',
    )

    expect(response.status).toBe(200)
    expect(response.body.data.details.rating).toBe(4.5)
    expect(service.get).toHaveBeenCalledWith('restaurant_1')
  })

  it('returns null when a mapping or provider result is unavailable', async () => {
    service.get.mockResolvedValue(null)

    const response = await request(app).get(
      '/api/restaurants/restaurant_1/place-details',
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ data: { details: null } })
  })

  it('rejects a blank path before calling the service', async () => {
    const response = await request(app).get(
      '/api/restaurants/%20/place-details',
    )

    expect(response.status).toBe(400)
    expect(service.get).not.toHaveBeenCalled()
  })
})
