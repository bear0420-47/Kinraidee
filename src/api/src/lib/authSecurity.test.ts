import { UserRole } from '@prisma/client'
import { decodeJwt, SignJWT } from 'jose'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { AUTH_TOKEN_LIFETIME_SECONDS } from '@/config/auth'

const testEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/kinraidee',
  JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
  ARGON2_MEMORY_COST: '19456',
  ARGON2_TIME_COST: '2',
  ARGON2_PARALLELISM: '1',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
}

let security: typeof import('./authSecurity')

beforeAll(async () => {
  for (const [name, value] of Object.entries(testEnv)) vi.stubEnv(name, value)
  security = await import('./authSecurity')
})

describe('auth security', () => {
  it('hashes and verifies passwords with Argon2id', async () => {
    const hash = await security.hashPassword('password8')

    expect(hash).toMatch(/^\$argon2id\$/)
    await expect(security.verifyPassword(hash, 'password8')).resolves.toBe(true)
    await expect(security.verifyPassword(hash, 'incorrect')).resolves.toBe(
      false,
    )
  })

  it('signs the required JWT claims with a 7-day lifetime', async () => {
    const token = await security.signAuthToken({
      id: 'user_1',
      role: UserRole.ADMIN,
    })
    const claims = decodeJwt(token)

    expect(claims.sub).toBe('user_1')
    expect(claims.role).toBe(UserRole.ADMIN)
    expect(claims.iat).toEqual(expect.any(Number))
    expect(claims.exp! - claims.iat!).toBe(AUTH_TOKEN_LIFETIME_SECONDS)
    await expect(security.verifyAuthToken(token)).resolves.toMatchObject({
      sub: 'user_1',
      role: UserRole.ADMIN,
    })
  })

  it('rejects expired tokens and algorithms outside the allowlist', async () => {
    const secret = new TextEncoder().encode(testEnv.JWT_SECRET)
    const expired = await new SignJWT({ role: UserRole.USER })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user_1')
      .setIssuedAt(1)
      .setExpirationTime(2)
      .sign(secret)
    const wrongAlgorithm = await new SignJWT({ role: UserRole.USER })
      .setProtectedHeader({ alg: 'HS384' })
      .setSubject('user_1')
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret)

    await expect(security.verifyAuthToken(expired)).rejects.toThrow()
    await expect(security.verifyAuthToken(wrongAlgorithm)).rejects.toThrow()
  })
})
