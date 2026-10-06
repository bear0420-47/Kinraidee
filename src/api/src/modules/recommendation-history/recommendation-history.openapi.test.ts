import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerRecommendationHistoryOpenApi: typeof import('./recommendation-history.openapi').registerRecommendationHistoryOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerRecommendationHistoryOpenApi } =
    await import('./recommendation-history.openapi'))
})

describe('Recommendation history OpenAPI', () => {
  it('documents three cookie-authenticated account endpoints', () => {
    const registry = new OpenAPIRegistry()
    registerRecommendationHistoryOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })
    const path = document.paths?.['/api/recommendation-history']

    for (const operation of [path?.get, path?.post, path?.delete]) {
      expect(operation?.security).toEqual([{ cookieAuth: [] }])
      expect(operation?.responses).toHaveProperty('401')
    }
    expect(path?.post?.responses).toHaveProperty('201')
    expect(path?.post?.responses).toHaveProperty('409')
    expect(path?.delete?.responses).toHaveProperty('204')
    expect(document.components?.schemas?.RecordHistoryRequest).toMatchObject({
      required: ['menuItemId'],
      additionalProperties: false,
    })
  })
})
