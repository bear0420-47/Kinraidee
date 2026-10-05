import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerRecommendationsOpenApi: typeof import('./recommendations.openapi').registerRecommendationsOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerRecommendationsOpenApi } =
    await import('./recommendations.openapi'))
})

describe('Recommendations OpenAPI', () => {
  it('registers the public stateless endpoint and request limits', () => {
    const registry = new OpenAPIRegistry()
    registerRecommendationsOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })
    const operation = document.paths?.['/api/recommendations']?.post

    expect(operation).toBeDefined()
    expect(operation?.security).toBeUndefined()
    expect(document.components?.schemas?.RecommendationRequest).toMatchObject({
      properties: {
        rejectedMenuItemIds: expect.objectContaining({ maxItems: 500 }),
        displayedMenuItemIds: expect.objectContaining({ maxItems: 500 }),
      },
    })
    expect(operation?.responses).toHaveProperty('200')
    expect(operation?.responses).toHaveProperty('400')
  })
})
