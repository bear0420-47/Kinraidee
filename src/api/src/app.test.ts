import express from 'express'
import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it, vi } from 'vitest'

const testEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/kinraidee',
  JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
  CORS_ALLOWED_ORIGINS: 'https://allowed.example,https://other.example',
}

let createApp: typeof import('./app').createApp
let errorHandler: typeof import('./middleware/errorHandler').errorHandler
let logger: typeof import('./lib/logger').logger
let requestIdMiddleware: typeof import('./middleware/requestId').requestIdMiddleware
let HttpError: typeof import('./shared/httpError').HttpError
let created: typeof import('./shared/httpResponse').created
let noContent: typeof import('./shared/httpResponse').noContent
let ok: typeof import('./shared/httpResponse').ok

beforeAll(async () => {
  for (const [name, value] of Object.entries(testEnv)) {
    vi.stubEnv(name, value)
  }

  ;({ createApp } = await import('./app'))
  ;({ errorHandler } = await import('./middleware/errorHandler'))
  ;({ logger } = await import('./lib/logger'))
  ;({ requestIdMiddleware } = await import('./middleware/requestId'))
  ;({ HttpError } = await import('./shared/httpError'))
  ;({ created, noContent, ok } = await import('./shared/httpResponse'))
})

describe('API foundation', () => {
  it('returns the health success envelope and a generated request ID', async () => {
    const response = await request(createApp()).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ data: { ok: true } })
    expect(response.headers['x-request-id']).toMatch(/^req_[0-9a-f-]{36}$/)
  })

  it('reuses a valid incoming request ID', async () => {
    const response = await request(createApp())
      .get('/health')
      .set('x-request-id', 'client_12345678')

    expect(response.headers['x-request-id']).toBe('client_12345678')
  })

  it.each([8, 80])(
    'accepts request ID boundary value with length %i',
    async (length) => {
      const requestId = 'a'.repeat(length)
      const response = await request(createApp())
        .get('/health')
        .set('x-request-id', requestId)

      expect(response.headers['x-request-id']).toBe(requestId)
    },
  )

  it.each(['short', 'contains spaces', 'a'.repeat(81)])(
    'replaces invalid incoming request ID %s',
    async (requestId) => {
      const response = await request(createApp())
        .get('/health')
        .set('x-request-id', requestId)

      expect(response.headers['x-request-id']).toMatch(/^req_[0-9a-f-]{36}$/)
    },
  )

  it('returns CORS credentials headers only for configured origins', async () => {
    const allowed = await request(createApp())
      .get('/health')
      .set('origin', 'https://allowed.example')
    const denied = await request(createApp())
      .get('/health')
      .set('origin', 'https://denied.example')

    expect(allowed.headers['access-control-allow-origin']).toBe(
      'https://allowed.example',
    )
    expect(allowed.headers['access-control-allow-credentials']).toBe('true')
    expect(denied.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('HTTP response and error envelopes', () => {
  let app: Express

  beforeAll(async () => {
    app = express()
    app.use(requestIdMiddleware)
    app.use((request, _response, next) => {
      request.log = logger
      next()
    })
    app.get('/ok', (_request, response) =>
      ok(response, [{ id: 'item_1' }], { total: 1 }),
    )
    app.post('/created', (_request, response) =>
      created(response, { id: 'item_1' }),
    )
    app.delete('/no-content', (_request, response) => noContent(response))
    app.get('/expected-error', () => {
      throw new HttpError({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Invalid request.',
        fields: { budget: 'Budget is required.' },
      })
    })
    app.get('/unknown-error', () => {
      throw new Error('private internal detail')
    })
    app.use(errorHandler)
  })

  it('supports success metadata, creation, and empty responses', async () => {
    const okResponse = await request(app).get('/ok')
    const createdResponse = await request(app).post('/created')
    const emptyResponse = await request(app).delete('/no-content')

    expect(okResponse.body).toEqual({
      data: [{ id: 'item_1' }],
      meta: { total: 1 },
    })
    expect(createdResponse.status).toBe(201)
    expect(createdResponse.body).toEqual({
      data: { id: 'item_1' },
    })
    expect(emptyResponse.status).toBe(204)
    expect(emptyResponse.text).toBe('')
    expect(okResponse.headers['x-request-id']).toMatch(/^req_[0-9a-f-]{36}$/)
    expect(createdResponse.headers['x-request-id']).toMatch(
      /^req_[0-9a-f-]{36}$/,
    )
    expect(emptyResponse.headers['x-request-id']).toMatch(/^req_[0-9a-f-]{36}$/)
  })

  it('returns stable expected error details with request ID', async () => {
    const response = await request(app)
      .get('/expected-error')
      .set('x-request-id', 'client_12345678')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request.',
        requestId: 'client_12345678',
        fields: { budget: 'Budget is required.' },
      },
    })
  })

  it('does not expose unknown error details or stack traces', async () => {
    const response = await request(app).get('/unknown-error')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error.',
        requestId: response.headers['x-request-id'],
      },
    })
    expect(response.text).not.toContain('private internal detail')
    expect(response.text).not.toContain('stack')
  })
})

describe('OWASP hardening', () => {
  it('answers unknown routes with the JSON error envelope', async () => {
    const response = await request(createApp()).get('/api/does-not-exist')

    expect(response.status).toBe(404)
    expect(response.body.error).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Resource not found.',
    })
  })

  it('answers malformed JSON with 400 instead of 500', async () => {
    const response = await request(createApp())
      .post('/api/auth/login')
      .set('content-type', 'application/json')
      .send('{"email": ')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_REQUEST_BODY',
        message: 'Request body could not be read.',
        requestId: response.headers['x-request-id'],
      },
    })
    expect(response.text).not.toContain('Unexpected')
  })

  it('answers a body over the 100 kB limit with 413', async () => {
    const response = await request(createApp())
      .post('/api/auth/login')
      .set('content-type', 'application/json')
      .send(
        JSON.stringify({
          email: 'a@example.com',
          password: 'x'.repeat(110_000),
        }),
      )

    expect(response.status).toBe(413)
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE')
  })

  it('refuses writes from origins outside the CORS allowlist', async () => {
    const response = await request(createApp())
      .post('/api/auth/logout')
      .set('origin', 'https://denied.example')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('ORIGIN_NOT_ALLOWED')
  })

  it('allows writes from an allowed origin', async () => {
    const response = await request(createApp())
      .post('/api/auth/logout')
      .set('origin', 'https://allowed.example')

    expect(response.status).toBe(204)
  })

  it('limits login attempts per account', async () => {
    const app = createApp()
    // A too-short password fails validation before any database work, so each
    // attempt is cheap here but still counted by the limiter.
    const attempt = (email: string) =>
      request(app).post('/api/auth/login').send({ email, password: 'short' })

    for (let index = 0; index < 10; index += 1) {
      expect((await attempt('victim@example.com')).status).toBe(400)
    }

    const blocked = await attempt('VICTIM@example.com')
    expect(blocked.status).toBe(429)
    expect(blocked.body.error.code).toBe('RATE_LIMITED')
    expect(blocked.headers['retry-after']).toBeDefined()

    // Another account from the same address is still allowed.
    expect((await attempt('someone@example.com')).status).toBe(400)
  })

  it('rejects passwords longer than 128 characters before hashing', async () => {
    const response = await request(createApp())
      .post('/api/auth/register')
      .send({ email: 'long@example.com', password: 'x'.repeat(129) })

    expect(response.status).toBe(400)
    expect(response.body.error.fields.password).toBe(
      'Password must contain at most 128 characters.',
    )
  })
})
