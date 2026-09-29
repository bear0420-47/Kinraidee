import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerZonesOpenApi: typeof import('./zones.openapi').registerZonesOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerZonesOpenApi } = await import('./zones.openapi'))
})

describe('zones OpenAPI', () => {
  it('registers every zone route with admin security on mutations', () => {
    const registry = new OpenAPIRegistry()
    registerZonesOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })

    const collection = document.paths?.['/api/zones']
    const item = document.paths?.['/api/zones/{id}']
    expect(collection?.get?.security).toBeUndefined()
    expect(collection?.post?.security).toEqual([{ cookieAuth: [] }])
    expect(item?.patch?.security).toEqual([{ cookieAuth: [] }])
    expect(item?.delete?.security).toEqual([{ cookieAuth: [] }])
    expect(Object.keys(item?.delete?.responses ?? {})).toEqual(
      expect.arrayContaining(['204', '401', '403', '404', '409']),
    )
    expect(document.components?.schemas).toHaveProperty('Localization')
    expect(document.components?.schemas).toHaveProperty('ErrorEnvelope')
  })
})
