import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerRestaurantsOpenApi: typeof import('./restaurants.openapi').registerRestaurantsOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerRestaurantsOpenApi } = await import('./restaurants.openapi'))
})

describe('Restaurant OpenAPI', () => {
  it('documents all six ADMIN-only Restaurant endpoints', () => {
    const registry = new OpenAPIRegistry()
    registerRestaurantsOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })

    expect(document.paths?.['/api/restaurants']?.get?.security).toEqual([
      { cookieAuth: [] },
    ])
    expect(document.paths?.['/api/restaurants']?.post).toBeDefined()
    expect(document.paths?.['/api/restaurants/{id}']?.get).toBeDefined()
    expect(document.paths?.['/api/restaurants/{id}']?.patch).toBeDefined()
    expect(document.paths?.['/api/restaurants/{id}']?.delete).toBeDefined()
    expect(
      document.paths?.['/api/restaurants/{id}/restore']?.post,
    ).toBeDefined()
  })
})
