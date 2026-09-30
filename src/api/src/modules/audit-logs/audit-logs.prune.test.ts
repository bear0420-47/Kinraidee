import { describe, expect, it, vi } from 'vitest'

import { auditLogRetentionThreshold, pruneAuditLogs } from './audit-logs.prune'

describe('AuditLog pruning', () => {
  it('calculates an exact UTC threshold 180 days before now', () => {
    expect(
      auditLogRetentionThreshold(new Date('2026-09-30T12:34:56.789Z')),
    ).toEqual(new Date('2026-04-03T12:34:56.789Z'))
  })

  it('is idempotent and returns only the deleted count', async () => {
    const repository = {
      deleteOlderThan: vi
        .fn()
        .mockResolvedValueOnce({ count: 3 })
        .mockResolvedValueOnce({ count: 0 }),
    }
    const now = new Date('2026-09-30T00:00:00.000Z')

    await expect(pruneAuditLogs(now, repository)).resolves.toBe(3)
    await expect(pruneAuditLogs(now, repository)).resolves.toBe(0)
    expect(repository.deleteOlderThan).toHaveBeenNthCalledWith(
      1,
      new Date('2026-04-03T00:00:00.000Z'),
    )
  })
})
