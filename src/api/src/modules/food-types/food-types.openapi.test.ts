import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerFoodTypesOpenApi: typeof import('./food-types.openapi').registerFoodTypesOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerFoodTypesOpenApi } = await import('./food-types.openapi'))
})

describe('food types OpenAPI', () => {
  it('registers every food type route with admin security on mutations', () => {
    const registry = new OpenAPIRegistry()
    registerFoodTypesOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })

    const collection = document.paths?.['/api/food-types']
    const item = document.paths?.['/api/food-types/{id}']
    expect(collection?.get?.security).toBeUndefined()
    expect(collection?.post?.security).toEqual([{ cookieAuth: [] }])
    expect(item?.patch?.security).toEqual([{ cookieAuth: [] }])
    expect(item?.delete?.security).toEqual([{ cookieAuth: [] }])
    expect(document.components?.schemas).toHaveProperty('CreateFoodTypeRequest')
  })
})
