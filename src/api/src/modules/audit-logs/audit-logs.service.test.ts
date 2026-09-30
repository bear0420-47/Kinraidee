import { AuditAction, AuditEntityType, Prisma } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import type { AuditLogsRepository } from './audit-logs.repository'
import {
  createAuditLogsService,
  redactAuditSnapshot,
} from './audit-logs.service'

const query = { page: 2, pageSize: 20 }

describe('AuditLogs service', () => {
  it('maps records, metadata, and recursively removes unsafe keys', async () => {
    const repository = {
      list: vi.fn().mockResolvedValue({
        total: 21,
        items: [
          {
            id: 'audit_1',
            actorId: 'admin_1',
            action: AuditAction.UPDATE,
            entityType: AuditEntityType.MENU_ITEM,
            entityId: 'menu_1',
            before: {
              name: 'old',
              passwordHash: 'unsafe',
              nested: {
                authorization: 'unsafe',
                userAgent: 'unsafe',
                ipAddress: 'unsafe',
                safe: true,
              },
              values: [{ refresh_token: 'unsafe', id: 'safe' }],
            },
            after: null,
            requestId: 'req_1',
            createdAt: new Date('2026-09-30T00:00:00.000Z'),
          },
        ],
      }),
      deleteOlderThan: vi.fn(),
    }

    const result = await createAuditLogsService(
      repository as unknown as AuditLogsRepository,
    ).list(query)

    expect(result.meta).toEqual({ page: 2, pageSize: 20, total: 21 })
    expect(result.items[0]).toMatchObject({
      actorId: 'admin_1',
      createdAt: '2026-09-30T00:00:00.000Z',
      before: {
        name: 'old',
        passwordHash: '[REDACTED]',
        nested: {
          authorization: '[REDACTED]',
          userAgent: '[REDACTED]',
          ipAddress: '[REDACTED]',
          safe: true,
        },
        values: [{ refresh_token: '[REDACTED]', id: 'safe' }],
      },
    })
  })

  it('preserves JSON primitives while redacting unsafe object fields', () => {
    expect(redactAuditSnapshot(null)).toBeNull()
    expect(redactAuditSnapshot('safe')).toBe('safe')
    expect(
      redactAuditSnapshot({ cookie: 'bad', count: 1 } as Prisma.JsonObject),
    ).toEqual({ cookie: '[REDACTED]', count: 1 })
  })
})
