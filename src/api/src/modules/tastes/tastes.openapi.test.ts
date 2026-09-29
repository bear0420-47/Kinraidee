import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerTastesOpenApi: typeof import('./tastes.openapi').registerTastesOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerTastesOpenApi } = await import('./tastes.openapi'))
})

describe('tastes OpenAPI', () => {
  it('registers every taste route with admin security on mutations', () => {
    const registry = new OpenAPIRegistry()
    registerTastesOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })

    const collection = document.paths?.['/api/tastes']
    const item = document.paths?.['/api/tastes/{id}']
    expect(collection?.get?.security).toBeUndefined()
    expect(collection?.post?.security).toEqual([{ cookieAuth: [] }])
    expect(item?.patch?.security).toEqual([{ cookieAuth: [] }])
    expect(item?.delete?.security).toEqual([{ cookieAuth: [] }])
    expect(document.components?.schemas).toHaveProperty('CreateTasteRequest')
  })
})
