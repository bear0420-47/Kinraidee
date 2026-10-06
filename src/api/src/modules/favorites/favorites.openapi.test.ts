import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerFavoritesOpenApi: typeof import('./favorites.openapi').registerFavoritesOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerFavoritesOpenApi } = await import('./favorites.openapi'))
})

describe('Favorites OpenAPI', () => {
  it('documents four cookie-authenticated account endpoints', () => {
    const registry = new OpenAPIRegistry()
    registerFavoritesOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })
    const item = document.paths?.['/api/favorites/{menuItemId}']
    const operations = [
      document.paths?.['/api/favorites']?.get,
      item?.put,
      item?.delete,
      document.paths?.['/api/favorites/{menuItemId}/toggle']?.post,
    ]

    for (const operation of operations) {
      expect(operation?.security).toEqual([{ cookieAuth: [] }])
      expect(operation?.responses).toHaveProperty('401')
    }
    expect(item?.put?.responses).toHaveProperty('409')
    expect(item?.delete?.responses).not.toHaveProperty('409')
    expect(document.components?.schemas).toHaveProperty('FavoriteListEnvelope')
    expect(document.components?.schemas).toHaveProperty('FavoriteStateEnvelope')
  })
})
