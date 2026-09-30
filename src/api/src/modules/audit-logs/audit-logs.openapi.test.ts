import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { beforeAll, describe, expect, it } from 'vitest'

let registerAuditLogsOpenApi: typeof import('./audit-logs.openapi').registerAuditLogsOpenApi

beforeAll(async () => {
  await import('@/openapi/setup')
  ;({ registerAuditLogsOpenApi } = await import('./audit-logs.openapi'))
})

describe('AuditLog OpenAPI', () => {
  it('documents the ADMIN-only paginated list endpoint', () => {
    const registry = new OpenAPIRegistry()
    registerAuditLogsOpenApi(registry)
    const document = new OpenApiGeneratorV3(
      registry.definitions,
    ).generateDocument({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    })

    const endpoint = document.paths?.['/api/audit-logs']?.get
    expect(endpoint?.security).toEqual([{ cookieAuth: [] }])
    expect(endpoint?.responses).toHaveProperty('403')
  })
})
