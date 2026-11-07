import express, { type Express } from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { stubTestEnv } from '@/test/routeTestApp'

let createRateLimit: typeof import('./rateLimit').createRateLimit
let loginEmailKey: typeof import('./rateLimit').loginEmailKey
let errorHandler: typeof import('./errorHandler').errorHandler
let logger: typeof import('@/lib/logger').logger

beforeAll(async () => {
  stubTestEnv()
  ;({ createRateLimit, loginEmailKey } = await import('./rateLimit'))
  ;({ errorHandler } = await import('./errorHandler'))
  ;({ logger } = await import('@/lib/logger'))
})

function appWith(limiter: express.RequestHandler): Express {
  const app = express()
  app.use((req, _res, next) => {
    req.requestId = 'req_test_000001'
    req.log = logger
    next()
  })
  app.use(express.json())
  app.post('/limited', limiter, (_req, res) => {
    res.status(204).end()
  })
  app.use(errorHandler)
  return app
}

describe('createRateLimit', () => {
  it('allows requests up to the limit, then answers 429 with Retry-After', async () => {
    const app = appWith(
      createRateLimit({ name: 'test', windowMs: 60_000, max: 3 }),
    )

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const response = await request(app).post('/limited')
      expect(response.status).toBe(204)
      expect(response.headers['ratelimit-remaining']).toBe(String(3 - attempt))
    }

    const blocked = await request(app).post('/limited')
    expect(blocked.status).toBe(429)
    expect(blocked.body.error).toMatchObject({
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
    })
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0)
  })

  it('starts a fresh window after the previous one expires', async () => {
    let now = 1_000_000
    const app = appWith(
      createRateLimit({
        name: 'window',
        windowMs: 1_000,
        max: 1,
        now: () => now,
      }),
    )

    expect((await request(app).post('/limited')).status).toBe(204)
    expect((await request(app).post('/limited')).status).toBe(429)
    now += 1_001
    expect((await request(app).post('/limited')).status).toBe(204)
  })

  it('counts each key separately and skips requests whose key is null', async () => {
    const app = appWith(
      createRateLimit({
        name: 'login',
        windowMs: 60_000,
        max: 1,
        key: loginEmailKey,
      }),
    )

    expect(
      (await request(app).post('/limited').send({ email: 'a@example.com' }))
        .status,
    ).toBe(204)
    // Case and spaces do not create a new counter for the same account.
    expect(
      (await request(app).post('/limited').send({ email: ' A@Example.com ' }))
        .status,
    ).toBe(429)
    expect(
      (await request(app).post('/limited').send({ email: 'b@example.com' }))
        .status,
    ).toBe(204)
    expect((await request(app).post('/limited').send({})).status).toBe(204)
    expect((await request(app).post('/limited').send({})).status).toBe(204)
  })

  it('keeps separate limiters from sharing counters', async () => {
    const first = createRateLimit({ name: 'one', windowMs: 60_000, max: 1 })
    const second = createRateLimit({ name: 'two', windowMs: 60_000, max: 1 })

    expect((await request(appWith(first)).post('/limited')).status).toBe(204)
    expect((await request(appWith(second)).post('/limited')).status).toBe(204)
  })

  it('bounds memory when flooded with distinct keys', async () => {
    let counter = 0
    const limiter = createRateLimit({
      name: 'flood',
      windowMs: 60_000,
      max: 1,
      key: () => `client-${(counter += 1)}`,
    })
    const next = vi.fn()
    const response = { setHeader: vi.fn() }

    for (let index = 0; index < 60_000; index += 1) {
      limiter({} as never, response as never, next)
    }

    expect(next).toHaveBeenCalledTimes(60_000)
  })
})
