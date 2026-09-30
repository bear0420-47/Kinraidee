import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  authCookie,
  createRouteTestApp,
  stubTestEnv,
} from '@/test/routeTestApp'

const service = { list: vi.fn() }
let app: Express
let adminCookie: string
let userCookie: string

beforeAll(async () => {
  stubTestEnv()
  const { createAuditLogsController } = await import('./audit-logs.controller')
  const { createAuditLogsRoutes } = await import('./audit-logs.routes')
  app = await createRouteTestApp(
    '/api/audit-logs',
    createAuditLogsRoutes(createAuditLogsController(service)),
  )
  adminCookie = await authCookie('ADMIN')
  userCookie = await authCookie('USER')
})

beforeEach(() => vi.resetAllMocks())

describe('AuditLog routes', () => {
  it('rejects anonymous and USER requests without reading logs', async () => {
    expect((await request(app).get('/api/audit-logs')).status).toBe(401)
    expect(
      (await request(app).get('/api/audit-logs').set('Cookie', userCookie))
        .status,
    ).toBe(403)
    expect(service.list).not.toHaveBeenCalled()
  })

  it('lets ADMIN filter and returns pagination metadata', async () => {
    service.list.mockResolvedValue({
      items: [{ id: 'audit_1', actorId: 'admin_1' }],
      meta: { page: 2, pageSize: 100, total: 101 },
    })

    const response = await request(app)
      .get(
        '/api/audit-logs?page=2&pageSize=100&entityType=MENU_ITEM&action=UPDATE&actorId=admin_1&entityId=menu_1&requestId=req_1&createdFrom=2026-09-01T00%3A00%3A00.000Z&createdTo=2026-09-30T00%3A00%3A00.000Z',
      )
      .set('Cookie', adminCookie)

    expect(response.status).toBe(200)
    expect(response.body.meta).toEqual({ page: 2, pageSize: 100, total: 101 })
    expect(service.list).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'MENU_ITEM',
        action: 'UPDATE',
        actorId: 'admin_1',
      }),
    )
  })

  it('rejects invalid queries before reading logs', async () => {
    const response = await request(app)
      .get('/api/audit-logs?pageSize=101')
      .set('Cookie', adminCookie)

    expect(response.status).toBe(400)
    expect(service.list).not.toHaveBeenCalled()
  })
})
