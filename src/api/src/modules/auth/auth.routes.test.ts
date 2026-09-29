import cookieParser from 'cookie-parser'
import express, { type Express, type RequestHandler } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const testEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/kinraidee',
  JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
}

let createAuthController: typeof import('./auth.controller').createAuthController
let createAuthRoutes: typeof import('./auth.routes').createAuthRoutes
let signAuthToken: typeof import('./auth.helpers').signAuthToken
let unauthenticatedError: typeof import('./auth.helpers').unauthenticatedError
let errorHandler: typeof import('@/middleware/errorHandler').errorHandler
let logger: typeof import('@/lib/logger').logger
let requestIdMiddleware: typeof import('@/middleware/requestId').requestIdMiddleware
let requireAuth: typeof import('@/middleware/requireAuth').requireAuth

beforeAll(async () => {
  for (const [name, value] of Object.entries(testEnv)) vi.stubEnv(name, value)
  ;({ createAuthController } = await import('./auth.controller'))
  ;({ createAuthRoutes } = await import('./auth.routes'))
  ;({ signAuthToken, unauthenticatedError } = await import('./auth.helpers'))
  ;({ errorHandler } = await import('@/middleware/errorHandler'))
  ;({ logger } = await import('@/lib/logger'))
  ;({ requestIdMiddleware } = await import('@/middleware/requestId'))
  ;({ requireAuth } = await import('@/middleware/requireAuth'))
})

const safeUser = {
  id: 'user_1',
  email: 'user@example.com',
  role: 'USER' as const,
}

describe('auth routes', () => {
  const service = {
    register: vi.fn(),
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createTestApp(
    authMiddleware: RequestHandler = requireAuth,
  ): Express {
    const app = express()
    app.use(requestIdMiddleware)
    app.use((req, _res, next) => {
      req.log = logger
      next()
    })
    app.use(cookieParser())
    app.use(express.json())
    app.use(
      '/api/auth',
      createAuthRoutes(createAuthController(service as never), authMiddleware),
    )
    app.use(errorHandler)
    return app
  }

  it('registers with normalized credentials and sets the auth cookie', async () => {
    service.register.mockResolvedValue({
      user: safeUser,
      token: 'signed-token',
    })

    const response = await request(createTestApp())
      .post('/api/auth/register')
      .send({ email: ' User@Example.COM ', password: ' password8 ' })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ data: { user: safeUser } })
    expect(response.text).not.toContain('password')
    expect(service.register).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password8',
    })
    expect(response.headers['set-cookie']?.[0]).toContain(
      'kinraidee_auth=signed-token',
    )
    expect(response.headers['set-cookie']?.[0]).toContain('HttpOnly')
    expect(response.headers['set-cookie']?.[0]).toContain('SameSite=Lax')
    expect(response.headers['set-cookie']?.[0]).toContain('Max-Age=604800')
  })

  it('rejects request-body role escalation before calling the service', async () => {
    const response = await request(createTestApp())
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        password: 'password8',
        role: 'ADMIN',
      })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(service.register).not.toHaveBeenCalled()
  })

  it('returns the same generic login error without exposing credentials', async () => {
    service.login.mockRejectedValue(unauthenticatedError())

    const response = await request(createTestApp())
      .post('/api/auth/login')
      .send({ email: 'missing@example.com', password: 'password8' })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
    expect(response.text).not.toContain('missing@example.com')
    expect(response.text).not.toContain('password8')
  })

  it('clears the cookie idempotently', async () => {
    const response = await request(createTestApp()).post('/api/auth/logout')

    expect(response.status).toBe(204)
    expect(response.headers['set-cookie']?.[0]).toContain('kinraidee_auth=;')
    expect(response.headers['set-cookie']?.[0]).toContain('HttpOnly')
    expect(response.headers['set-cookie']?.[0]).toContain('SameSite=Lax')
  })

  it('returns the current user for a valid cookie', async () => {
    const token = await signAuthToken({ id: safeUser.id, role: safeUser.role })
    service.getCurrentUser.mockResolvedValue(safeUser)

    const response = await request(createTestApp())
      .get('/api/auth/me')
      .set('Cookie', `kinraidee_auth=${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ data: { user: safeUser } })
    expect(service.getCurrentUser).toHaveBeenCalledWith(safeUser.id)
  })

  it.each([
    ['missing cookie', undefined],
    ['invalid cookie', 'kinraidee_auth=not-a-jwt'],
  ])('returns 401 for %s', async (_case, cookie) => {
    const requestBuilder = request(createTestApp()).get('/api/auth/me')
    if (cookie) requestBuilder.set('Cookie', cookie)
    const response = await requestBuilder

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
    expect(service.getCurrentUser).not.toHaveBeenCalled()
  })
})
