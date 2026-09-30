import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerMenuItemsOpenApi: typeof import('./menu-items.openapi').registerMenuItemsOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerMenuItemsOpenApi } = await import('./menu-items.openapi'))
})

function generateDocument(registry: OpenAPIRegistry) {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.0' },
  })
}

describe('MenuItems OpenAPI', () => {
  it('registers every ADMIN MenuItem endpoint and cookie security', () => {
    const registry = new OpenAPIRegistry()
    registry.registerComponent('securitySchemes', 'cookieAuth', {
      type: 'apiKey',
      in: 'cookie',
      name: 'kinraidee_auth',
    })
    registerMenuItemsOpenApi(registry)
    const document = generateDocument(registry)

    expect(document.paths?.['/api/menu-items']?.get).toBeDefined()
    expect(document.paths?.['/api/menu-items']?.post).toBeDefined()
    expect(document.paths?.['/api/menu-items/{id}']?.get).toBeDefined()
    expect(document.paths?.['/api/menu-items/{id}']?.patch).toBeDefined()
    expect(document.paths?.['/api/menu-items/{id}']?.delete).toBeDefined()
    expect(document.paths?.['/api/menu-items/{id}/restore']?.post).toBeDefined()
    expect(document.paths?.['/api/menu-items/bulk-delete']?.post).toBeDefined()
    expect(document.paths?.['/api/menu-items/bulk-restore']?.post).toBeDefined()
    expect(document.paths?.['/api/menu-items']?.get?.security).toEqual([
      { cookieAuth: [] },
    ])
  })

  it('documents pagination, relation filters, and bulk limits', () => {
    const registry = new OpenAPIRegistry()
    registerMenuItemsOpenApi(registry)
    const document = generateDocument(registry)
    const parameters =
      document.paths?.['/api/menu-items']?.get?.parameters ?? []

    expect(parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'restaurantId', in: 'query' }),
        expect.objectContaining({ name: 'foodTypeId', in: 'query' }),
        expect.objectContaining({ name: 'tasteId', in: 'query' }),
        expect.objectContaining({ name: 'pageSize', in: 'query' }),
      ]),
    )
    expect(document.components?.schemas?.BulkMenuItemsRequest).toMatchObject({
      properties: {
        ids: expect.objectContaining({ maxItems: 50, minItems: 1 }),
      },
    })
  })
})
