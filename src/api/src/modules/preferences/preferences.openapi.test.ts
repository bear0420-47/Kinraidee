import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerPreferencesOpenApi: typeof import('./preferences.openapi').registerPreferencesOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerPreferencesOpenApi } = await import('./preferences.openapi'))
})

describe('Preferences OpenAPI', () => {
  it('documents three cookie-authenticated account endpoints', () => {
    const registry = new OpenAPIRegistry()
    registerPreferencesOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })
    const path = document.paths?.['/api/preferences']

    for (const operation of [path?.get, path?.put, path?.delete]) {
      expect(operation?.security).toEqual([{ cookieAuth: [] }])
      expect(operation?.responses).toHaveProperty('401')
    }
    expect(path?.put?.responses).toHaveProperty('400')
    expect(path?.delete?.responses).toHaveProperty('204')
    expect(document.components?.schemas?.Preference).toMatchObject({
      required: ['budget', 'zoneId', 'foodTypeId', 'tasteId'],
      additionalProperties: false,
    })
  })
})
