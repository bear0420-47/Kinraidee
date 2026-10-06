import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { createRouteTestApp, stubTestEnv } from '@/test/routeTestApp'

const service = { recommend: vi.fn() }
let app: Express

const validBody = {
  conditions: {
    budget: 'BETWEEN_50_100',
    tasteId: null,
    foodTypeId: null,
    zoneId: null,
  },
  rejectedMenuItemIds: [],
  displayedMenuItemIds: [],
  count: 3,
}

beforeAll(async () => {
  stubTestEnv()
  const { createRecommendationsController } =
    await import('./recommendations.controller')
  const { createRecommendationsRoutes } =
    await import('./recommendations.routes')
  app = await createRouteTestApp(
    '/api/recommendations',
    createRecommendationsRoutes(createRecommendationsController(service)),
  )
})

beforeEach(() => {
  vi.resetAllMocks()
})

describe('recommendation route', () => {
  it('is public and returns the service result in the success envelope', async () => {
    service.recommend.mockResolvedValue({ items: [], suggestion: null })

    const response = await request(app)
      .post('/api/recommendations')
      .send(validBody)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      data: { items: [], suggestion: null },
    })
    expect(service.recommend).toHaveBeenCalledWith(validBody)
  })

  it('normalizes IDs before calling the service', async () => {
    service.recommend.mockResolvedValue({ items: [] })

    await request(app)
      .post('/api/recommendations')
      .send({
        ...validBody,
        rejectedMenuItemIds: [' menu_1 ', 'menu_1'],
      })

    expect(service.recommend).toHaveBeenCalledWith({
      ...validBody,
      rejectedMenuItemIds: ['menu_1'],
    })
  })

  it('returns VALIDATION_ERROR before the service for invalid input', async () => {
    const response = await request(app)
      .post('/api/recommendations')
      .send({ ...validBody, count: 2 })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(service.recommend).not.toHaveBeenCalled()
  })
})
