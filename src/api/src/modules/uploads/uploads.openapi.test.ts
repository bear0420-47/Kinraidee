import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerUploadsOpenApi: typeof import('./uploads.openapi').registerUploadsOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerUploadsOpenApi } = await import('./uploads.openapi'))
})

describe('uploads OpenAPI', () => {
  it('documents protected multipart upload, delete, and local static GET', () => {
    const registry = new OpenAPIRegistry()
    registerUploadsOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })

    expect(document.paths?.['/api/uploads/images']?.post).toMatchObject({
      security: [{ cookieAuth: [] }],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: { image: { type: 'string', format: 'binary' } },
              required: ['image'],
            },
          },
        },
      },
    })
    expect(
      document.paths?.['/api/uploads/images/{fileName}']?.delete,
    ).toBeDefined()
    expect(document.paths?.['/uploads/{fileName}']?.get).toBeDefined()
  })
})
