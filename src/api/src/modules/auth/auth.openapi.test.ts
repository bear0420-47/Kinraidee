import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerAuthOpenApi: typeof import('./auth.openapi').registerAuthOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerAuthOpenApi } = await import('./auth.openapi'))
})

describe('auth OpenAPI', () => {
  it('registers every auth endpoint and cookie security scheme', () => {
    const registry = new OpenAPIRegistry()
    registerAuthOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })

    expect(Object.keys(document.paths ?? {})).toEqual(
      expect.arrayContaining([
        '/api/auth/register',
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/me',
      ]),
    )
    expect(document.components?.securitySchemes?.cookieAuth).toMatchObject({
      type: 'apiKey',
      in: 'cookie',
      name: 'kinraidee_auth',
    })
  })
})
