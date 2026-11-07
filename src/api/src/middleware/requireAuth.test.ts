import express, { type Express } from 'express'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { stubTestEnv } from '@/test/routeTestApp'

const findUnique = vi.fn()
vi.mock('@/lib/prisma', () => ({ prisma: { user: { findUnique } } }))

let app: Express
let signAuthToken: typeof import('@/lib/authSecurity').signAuthToken
let setSessionUserLookupForTests: typeof import('./requireAuth').setSessionUserLookupForTests

beforeAll(async () => {
  stubTestEnv()
  ;({ signAuthToken } = await import('@/lib/authSecurity'))
  const { requireAuth } = await import('./requireAuth')
  ;({ setSessionUserLookupForTests } = await import('./requireAuth'))
  // Use the real database lookup (with a mocked Prisma client).
  setSessionUserLookupForTests()
  const { requireAdmin } = await import('./requireAdmin')
  const { errorHandler } = await import('./errorHandler')
  const { logger } = await import('@/lib/logger')

  app = express()
  app.use((req, _res, next) => {
    req.requestId = 'req_test_000001'
    req.log = logger
    next()
  })
  app.use(cookieParser())
  app.get('/me', requireAuth, (req, res) => {
    res.json(req.user)
  })
  app.get('/admin', requireAuth, requireAdmin, (_req, res) => {
    res.status(204).end()
  })
  app.use(errorHandler)
})

afterAll(() => {
  setSessionUserLookupForTests()
})

beforeEach(() => {
  findUnique.mockReset()
})

async function cookieFor(role: 'USER' | 'ADMIN', id = 'user_1') {
  return `__session=${await signAuthToken({ id, role })}`
}

describe('requireAuth', () => {
  it('uses the role stored in the database, not the role in the token', async () => {
    findUnique.mockResolvedValue({ id: 'user_1', role: 'USER' })

    const me = await request(app)
      .get('/me')
      .set('Cookie', await cookieFor('ADMIN'))
    expect(me.status).toBe(200)
    expect(me.body).toEqual({ id: 'user_1', role: 'USER' })
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      select: { id: true, role: true },
    })

    // An admin demoted after signing in loses admin access at once.
    const admin = await request(app)
      .get('/admin')
      .set('Cookie', await cookieFor('ADMIN'))
    expect(admin.status).toBe(403)
  })

  it('rejects a valid token whose account no longer exists', async () => {
    findUnique.mockResolvedValue(null)

    const response = await request(app)
      .get('/me')
      .set('Cookie', await cookieFor('USER'))

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
  })

  it.each([
    ['no cookie', null],
    ['a forged token', '__session=eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0.'],
  ])('rejects %s without querying the database', async (_case, cookie) => {
    const builder = request(app).get('/me')
    if (cookie) builder.set('Cookie', cookie)

    expect((await builder).status).toBe(401)
    expect(findUnique).not.toHaveBeenCalled()
  })
})
