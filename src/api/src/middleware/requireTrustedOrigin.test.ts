import express, { type Express } from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'

import { stubTestEnv } from '@/test/routeTestApp'

let app: Express

beforeAll(async () => {
  stubTestEnv()
  const { createRequireTrustedOrigin } = await import('./requireTrustedOrigin')
  const { errorHandler } = await import('./errorHandler')
  const { logger } = await import('@/lib/logger')

  app = express()
  app.use((req, _res, next) => {
    req.requestId = 'req_test_000001'
    req.log = logger
    next()
  })
  app.use(createRequireTrustedOrigin(['https://app.example']))
  app.all('/target', (_req, res) => {
    res.status(204).end()
  })
  app.use(errorHandler)
})

describe('requireTrustedOrigin', () => {
  it.each(['post', 'put', 'patch', 'delete'] as const)(
    'refuses a %s from an origin outside the allowlist',
    async (method) => {
      const agent = request(app)
      const response = await agent[method]('/target').set(
        'origin',
        'https://evil.example',
      )

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('ORIGIN_NOT_ALLOWED')
    },
  )

  it('refuses the opaque "null" origin used by sandboxed pages', async () => {
    const response = await request(app).post('/target').set('origin', 'null')
    expect(response.status).toBe(403)
  })

  it('refuses a write the browser marks cross-site even without Origin', async () => {
    const response = await request(app)
      .post('/target')
      .set('sec-fetch-site', 'cross-site')
    expect(response.status).toBe(403)
  })

  it('allows writes from an allowed origin', async () => {
    const response = await request(app)
      .post('/target')
      .set('origin', 'https://app.example')
    expect(response.status).toBe(204)
  })

  it('allows writes with no Origin from non-browser clients', async () => {
    expect((await request(app).post('/target')).status).toBe(204)
    expect(
      (await request(app).post('/target').set('sec-fetch-site', 'same-origin'))
        .status,
    ).toBe(204)
  })

  it('never blocks safe reads, whatever their origin', async () => {
    const response = await request(app)
      .get('/target')
      .set('origin', 'https://evil.example')
    expect(response.status).toBe(204)
  })
})
