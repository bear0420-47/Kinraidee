import { UserRole, type Prisma } from '@prisma/client'
import argon2 from 'argon2'
import { describe, expect, it, vi } from 'vitest'

import { formatSeedError, parseSeedEnv, seedInitialAdmin } from './seed'

const validEnv = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/kinraidee',
  ARGON2_MEMORY_COST: '19456',
  ARGON2_TIME_COST: '2',
  ARGON2_PARALLELISM: '1',
  SEED_ADMIN_EMAIL: ' Admin@Example.COM ',
  SEED_ADMIN_PASSWORD: ' password123 ',
} satisfies NodeJS.ProcessEnv

describe('initial administrator seed', () => {
  it('normalizes seed credentials using the approved policy', () => {
    const config = parseSeedEnv(validEnv)

    expect(config.SEED_ADMIN_EMAIL).toBe('admin@example.com')
    expect(config.SEED_ADMIN_PASSWORD).toBe('password123')
  })

  it.each([
    ['SEED_ADMIN_EMAIL', { ...validEnv, SEED_ADMIN_EMAIL: '' }],
    ['SEED_ADMIN_EMAIL', { ...validEnv, SEED_ADMIN_EMAIL: 'not-an-email' }],
    ['SEED_ADMIN_PASSWORD', { ...validEnv, SEED_ADMIN_PASSWORD: ' 1234567 ' }],
  ])('rejects invalid %s without exposing its value', (field, input) => {
    try {
      parseSeedEnv(input)
      throw new Error('Expected seed configuration to fail.')
    } catch (error) {
      const message = formatSeedError(error)

      expect(message).toContain(field)
      const rejectedValue = input[field]
      if (rejectedValue) expect(message).not.toContain(rejectedValue)
    }
  })

  it('upserts one ADMIN with an Argon2id hash and safe output', async () => {
    const upsertAdmin = vi
      .fn<(args: Prisma.UserUpsertArgs) => Promise<unknown>>()
      .mockResolvedValue({ id: 'admin-id' })
    const writeSummary = vi.fn()

    await seedInitialAdmin(upsertAdmin, validEnv, writeSummary)

    const args = upsertAdmin.mock.calls[0]?.[0]
    expect(args).toBeDefined()
    expect(args?.where).toEqual({ email: 'admin@example.com' })
    expect(args?.create.role).toBe(UserRole.ADMIN)
    expect(args?.update.role).toBe(UserRole.ADMIN)
    expect(args?.create.password).not.toBe('password123')
    await expect(
      argon2.verify(args?.create.password ?? '', 'password123'),
    ).resolves.toBe(true)
    expect(writeSummary).toHaveBeenCalledWith('Seeded 1 administrator account.')

    const output = writeSummary.mock.calls.flat().join(' ')
    expect(output).not.toContain('admin@example.com')
    expect(output).not.toContain('password123')
    expect(output).not.toContain(args?.create.password)
  })

  it('uses the normalized email as the stable idempotent upsert key', async () => {
    const records = new Map<string, Prisma.UserCreateInput>()
    const upsertAdmin = vi.fn(async (args: Prisma.UserUpsertArgs) => {
      const existing = records.get(args.where.email)
      const next = existing
        ? { ...existing, ...args.update }
        : (args.create as Prisma.UserCreateInput)

      records.set(args.where.email, next)
      return next
    })

    await seedInitialAdmin(upsertAdmin, validEnv, () => undefined)
    await seedInitialAdmin(upsertAdmin, validEnv, () => undefined)

    expect(records).toHaveLength(1)
    expect(records.get('admin@example.com')?.role).toBe(UserRole.ADMIN)
    expect(upsertAdmin).toHaveBeenCalledTimes(2)
  })
})
