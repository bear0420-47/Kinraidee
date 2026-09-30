import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(async (work: unknown[]) => Promise.all(work)),
    auditLog: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }))

import { auditLogsRepository } from './audit-logs.repository'

describe('AuditLogs repository', () => {
  it('applies filters, stable newest-first ordering, and pagination', async () => {
    await auditLogsRepository.list({
      page: 2,
      pageSize: 10,
      entityType: 'MENU_ITEM',
      action: 'UPDATE',
      actorId: 'admin_1',
      entityId: 'menu_1',
      requestId: 'req_1',
      createdFrom: '2026-09-01T00:00:00.000Z',
      createdTo: '2026-09-30T00:00:00.000Z',
    })

    expect(mocks.prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        entityType: 'MENU_ITEM',
        action: 'UPDATE',
        actorId: 'admin_1',
        entityId: 'menu_1',
        requestId: 'req_1',
        createdAt: {
          gte: new Date('2026-09-01T00:00:00.000Z'),
          lte: new Date('2026-09-30T00:00:00.000Z'),
        },
      },
      select: expect.not.objectContaining({ actor: expect.anything() }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 10,
      take: 10,
    })
    expect(mocks.prisma.auditLog.create).not.toHaveBeenCalled()
  })

  it('deletes only rows strictly older than the threshold', async () => {
    const threshold = new Date('2026-04-03T00:00:00.000Z')
    await auditLogsRepository.deleteOlderThan(threshold)

    expect(mocks.prisma.auditLog.deleteMany).toHaveBeenCalledWith({
      where: { createdAt: { lt: threshold } },
    })
  })
})
