import { UserRole, type User } from '@prisma/client'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { HttpError } from '@/shared/httpError'
import type { AuthRepository } from './auth.repository'

const testEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/kinraidee',
  JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
}

let createAuthService: typeof import('./auth.service').createAuthService
let DuplicateEmailError: typeof import('./auth.repository').DuplicateEmailError

beforeAll(async () => {
  for (const [name, value] of Object.entries(testEnv)) vi.stubEnv(name, value)
  ;({ createAuthService } = await import('./auth.service'))
  ;({ DuplicateEmailError } = await import('./auth.repository'))
})

const user: User = {
  id: 'user_1',
  email: 'user@example.com',
  password: 'stored-hash',
  role: UserRole.USER,
  createdAt: new Date('2026-09-29T00:00:00.000Z'),
  updatedAt: new Date('2026-09-29T00:00:00.000Z'),
}

describe('auth service', () => {
  const repository = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    createUser: vi.fn(),
  } as unknown as AuthRepository
  const hashPassword = vi.fn()
  const verifyPassword = vi.fn()
  const signAuthToken = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createService() {
    return createAuthService({
      repository,
      hashPassword,
      verifyPassword,
      signAuthToken,
    })
  }

  it('registers a USER and never returns the password hash', async () => {
    vi.mocked(repository.findByEmail).mockResolvedValue(null)
    hashPassword.mockResolvedValue('argon-hash')
    vi.mocked(repository.createUser).mockResolvedValue(user)
    signAuthToken.mockResolvedValue('signed-token')

    await expect(
      createService().register({
        email: 'user@example.com',
        password: 'password8',
      }),
    ).resolves.toEqual({
      user: {
        id: 'user_1',
        email: 'user@example.com',
        role: UserRole.USER,
      },
      token: 'signed-token',
    })
    expect(repository.createUser).toHaveBeenCalledWith(
      'user@example.com',
      'argon-hash',
    )
  })

  it('returns 409 for an existing email and a unique-constraint race', async () => {
    vi.mocked(repository.findByEmail).mockResolvedValueOnce(user)

    await expect(
      createService().register({
        email: 'user@example.com',
        password: 'password8',
      }),
    ).rejects.toMatchObject({ status: 409, code: 'EMAIL_ALREADY_REGISTERED' })

    vi.mocked(repository.findByEmail).mockResolvedValueOnce(null)
    hashPassword.mockResolvedValueOnce('argon-hash')
    vi.mocked(repository.createUser).mockRejectedValueOnce(
      new DuplicateEmailError(),
    )

    await expect(
      createService().register({
        email: 'user@example.com',
        password: 'password8',
      }),
    ).rejects.toMatchObject({ status: 409, code: 'EMAIL_ALREADY_REGISTERED' })
  })

  it('logs in with valid credentials', async () => {
    vi.mocked(repository.findByEmail).mockResolvedValue(user)
    verifyPassword.mockResolvedValue(true)
    signAuthToken.mockResolvedValue('signed-token')

    await expect(
      createService().login({
        email: 'user@example.com',
        password: 'password8',
      }),
    ).resolves.toMatchObject({
      user: { id: user.id, email: user.email, role: user.role },
      token: 'signed-token',
    })
  })

  it.each([
    ['unknown email', null, false],
    ['wrong password', user, false],
  ])('uses the same error for %s', async (_case, foundUser, matches) => {
    vi.mocked(repository.findByEmail).mockResolvedValue(foundUser)
    verifyPassword.mockResolvedValue(matches)

    let error: HttpError | undefined
    try {
      await createService().login({
        email: 'user@example.com',
        password: 'password8',
      })
    } catch (caught) {
      error = caught as HttpError
    }

    expect(error).toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
      message: 'Authentication required.',
    })
    expect(verifyPassword).toHaveBeenCalledOnce()
  })

  it('loads the current user and rejects a deleted account', async () => {
    vi.mocked(repository.findById).mockResolvedValueOnce(user)
    await expect(createService().getCurrentUser(user.id)).resolves.toEqual({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    vi.mocked(repository.findById).mockResolvedValueOnce(null)
    await expect(createService().getCurrentUser(user.id)).rejects.toMatchObject(
      {
        status: 401,
        code: 'UNAUTHENTICATED',
      },
    )
  })
})
