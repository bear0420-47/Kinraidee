import { describe, expect, it } from 'vitest'

import { parseAuditLogListQuery } from './audit-logs.dto'

describe('AuditLog DTOs', () => {
  it('applies pagination defaults and normalizes every filter', () => {
    expect(
      parseAuditLogListQuery({
        entityType: 'MENU_ITEM',
        action: 'UPDATE',
        actorId: ' admin_1 ',
        entityId: ' menu_1 ',
        requestId: ' req_1 ',
        createdFrom: '2026-03-01T00:00:00.000Z',
        createdTo: '2026-09-01T00:00:00.000Z',
      }),
    ).toEqual({
      page: 1,
      pageSize: 20,
      entityType: 'MENU_ITEM',
      action: 'UPDATE',
      actorId: 'admin_1',
      entityId: 'menu_1',
      requestId: 'req_1',
      createdFrom: '2026-03-01T00:00:00.000Z',
      createdTo: '2026-09-01T00:00:00.000Z',
    })
  })

  it.each([
    { page: '0' },
    { pageSize: '101' },
    { action: 'READ' },
    { entityType: 'USER' },
    { createdFrom: 'not-a-date' },
    {
      createdFrom: '2026-09-02T00:00:00.000Z',
      createdTo: '2026-09-01T00:00:00.000Z',
    },
    { unknown: 'field' },
  ])('rejects invalid query %#', (query) => {
    expect(() => parseAuditLogListQuery(query)).toThrowError(
      expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR' }),
    )
  })
})
