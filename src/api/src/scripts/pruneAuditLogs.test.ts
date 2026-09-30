import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  disconnect: vi.fn(),
  info: vi.fn(),
  prune: vi.fn().mockResolvedValue(7),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { $disconnect: mocks.disconnect },
}))
vi.mock('@/lib/logger', () => ({
  logger: { info: mocks.info },
}))
vi.mock('@/modules/audit-logs/audit-logs.prune', () => ({
  pruneAuditLogs: mocks.prune,
}))

describe('AuditLog prune command', () => {
  beforeEach(() => vi.clearAllMocks())

  it('logs only the deleted count and always disconnects Prisma', async () => {
    await import('./pruneAuditLogs')

    expect(mocks.info).toHaveBeenCalledWith(
      { deletedCount: 7 },
      'Audit log prune completed',
    )
    expect(mocks.disconnect).toHaveBeenCalledOnce()
  })
})
