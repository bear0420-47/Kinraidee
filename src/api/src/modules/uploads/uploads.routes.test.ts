import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { UserRole } from '@prisma/client'
import cookieParser from 'cookie-parser'
import express, { type Express, type RequestHandler } from 'express'
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

const testEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/kinraidee',
  JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  LOCAL_UPLOADS_ENABLED: 'true',
  LOCAL_UPLOADS_DIRECTORY: '.local/uploads',
  LOCAL_UPLOAD_MAX_BYTES: '2097152',
}

const jpeg = Buffer.from(
  'ffd8ffe000104a46494600010100000100010000ffdb00040000ffd9',
  'hex',
)
const png = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000049454e44ae426082',
  'hex',
)

let rootDirectory: string
let signAuthToken: typeof import('@/lib/authSecurity').signAuthToken
let createUploadsController: typeof import('./uploads.controller').createUploadsController
let createUploadImageMiddleware: typeof import('./uploads.middleware').createUploadImageMiddleware
let createRequireLocalUploadsEnabled: typeof import('./uploads.middleware').createRequireLocalUploadsEnabled
let createUploadsApiRoutes: typeof import('./uploads.routes').createUploadsApiRoutes
let createUploadsStaticRoutes: typeof import('./uploads.routes').createUploadsStaticRoutes
let createUploadsService: typeof import('./uploads.service').createUploadsService
let errorHandler: typeof import('@/middleware/errorHandler').errorHandler
let logger: typeof import('@/lib/logger').logger
let requestIdMiddleware: typeof import('@/middleware/requestId').requestIdMiddleware

beforeAll(async () => {
  for (const [name, value] of Object.entries(testEnv)) vi.stubEnv(name, value)
  rootDirectory = await mkdtemp(path.join(os.tmpdir(), 'kinraidee-routes-'))
  ;({ signAuthToken } = await import('@/lib/authSecurity'))
  ;({ createUploadsController } = await import('./uploads.controller'))
  ;({ createUploadImageMiddleware, createRequireLocalUploadsEnabled } =
    await import('./uploads.middleware'))
  ;({ createUploadsApiRoutes, createUploadsStaticRoutes } =
    await import('./uploads.routes'))
  ;({ createUploadsService } = await import('./uploads.service'))
  ;({ errorHandler } = await import('@/middleware/errorHandler'))
  ;({ logger } = await import('@/lib/logger'))
  ;({ requestIdMiddleware } = await import('@/middleware/requestId'))
})

afterAll(async () => {
  await rm(rootDirectory, { recursive: true, force: true })
})

beforeEach(async () => {
  await rm(rootDirectory, { recursive: true, force: true })
})

function createTestApp({
  enabled = true,
  multipart,
}: {
  enabled?: boolean
  multipart?: RequestHandler
} = {}): Express {
  const app = express()
  const service = createUploadsService({ rootDirectory, maxBytes: 128 })
  const controller = createUploadsController(service)

  app.use(requestIdMiddleware)
  app.use((request, _response, next) => {
    request.log = logger
    next()
  })
  app.use(cookieParser())
  app.use(
    '/api/uploads',
    createUploadsApiRoutes({
      controller,
      enabled: createRequireLocalUploadsEnabled(enabled),
      multipart: multipart ?? createUploadImageMiddleware(128),
    }),
  )
  app.use('/uploads', createUploadsStaticRoutes(enabled, rootDirectory))
  app.use(errorHandler)
  return app
}

async function authCookie(role: UserRole) {
  const token = await signAuthToken({ id: `${role.toLowerCase()}_1`, role })
  return `kinraidee_auth=${token}`
}

describe('upload routes', () => {
  it('rejects anonymous and USER writes before upload or delete processing', async () => {
    const multipart = vi.fn((_request, _response, next) => next())
    const app = createTestApp({ multipart })
    const fileName = '123e4567-e89b-42d3-a456-426614174000.jpg'

    const anonymous = await request(app).post('/api/uploads/images')
    const user = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', await authCookie(UserRole.USER))
    const anonymousDelete = await request(app).delete(
      `/api/uploads/images/${fileName}`,
    )
    const userDelete = await request(app)
      .delete(`/api/uploads/images/${fileName}`)
      .set('Cookie', await authCookie(UserRole.USER))

    expect(anonymous.status).toBe(401)
    expect(user.status).toBe(403)
    expect(anonymousDelete.status).toBe(401)
    expect(userDelete.status).toBe(403)
    expect(multipart).not.toHaveBeenCalled()
  })

  it('lets ADMIN upload and serve a detected image without using its original name', async () => {
    const app = createTestApp()
    const response = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', await authCookie(UserRole.ADMIN))
      .attach('image', jpeg, {
        filename: 'identifiable-person.jpg',
        contentType: 'image/jpeg',
      })

    expect(response.status).toBe(201)
    expect(response.body.data.image.key).toMatch(/^[0-9a-f-]{36}\.jpg$/)
    expect(response.text).not.toContain('identifiable-person.jpg')
    const key = response.body.data.image.key as string
    await expect(readFile(path.join(rootDirectory, key))).resolves.toEqual(jpeg)

    const served = await request(app).get(`/uploads/${key}`)
    expect(served.status).toBe(200)
    expect(served.headers['content-type']).toMatch(/^image\/jpeg/)
    expect(served.headers['cross-origin-resource-policy']).toBe('cross-origin')
    expect(served.body).toEqual(jpeg)
  })

  it('accepts an image exactly at the configured byte limit', async () => {
    const imageAtLimit = Buffer.concat([jpeg, Buffer.alloc(128 - jpeg.length)])
    const response = await request(createTestApp())
      .post('/api/uploads/images')
      .set('Cookie', await authCookie(UserRole.ADMIN))
      .attach('image', imageAtLimit, {
        filename: 'boundary.jpg',
        contentType: 'image/jpeg',
      })

    expect(response.status).toBe(201)
    await expect(
      readFile(path.join(rootDirectory, response.body.data.image.key)),
    ).resolves.toEqual(imageAtLimit)
  })

  it('rejects missing, multiple, oversized, unsupported, and spoofed files', async () => {
    const app = createTestApp()
    const cookie = await authCookie(UserRole.ADMIN)

    const missing = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', cookie)
    const multiple = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', cookie)
      .attach('image', jpeg, { filename: 'one.jpg', contentType: 'image/jpeg' })
      .attach('image', jpeg, { filename: 'two.jpg', contentType: 'image/jpeg' })
    const oversized = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', cookie)
      .attach('image', Buffer.alloc(129), {
        filename: 'large.jpg',
        contentType: 'image/jpeg',
      })
    const unsupported = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', cookie)
      .attach('image', Buffer.from('<svg></svg>'), {
        filename: 'image.svg',
        contentType: 'image/svg+xml',
      })
    const spoofed = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', cookie)
      .attach('image', png, {
        filename: 'spoofed.jpg',
        contentType: 'image/jpeg',
      })
    const empty = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', cookie)
      .attach('image', Buffer.alloc(0), {
        filename: 'empty.jpg',
        contentType: 'image/jpeg',
      })

    expect(missing.status).toBe(400)
    expect(missing.body.error.code).toBe('UPLOAD_REQUIRED')
    expect(multiple.status).toBe(400)
    expect(multiple.body.error.code).toBe('INVALID_UPLOAD')
    expect(oversized.status).toBe(413)
    expect(oversized.body.error.code).toBe('UPLOAD_TOO_LARGE')
    expect(unsupported.status).toBe(415)
    expect(unsupported.body.error.code).toBe('UPLOAD_UNSUPPORTED_TYPE')
    expect(spoofed.status).toBe(400)
    expect(spoofed.body.error.code).toBe('UPLOAD_MIME_MISMATCH')
    expect(empty.status).toBe(400)
    expect(empty.body.error.code).toBe('INVALID_UPLOAD')
  })

  it('lets ADMIN delete generated files and rejects unsafe or unknown names', async () => {
    const app = createTestApp()
    const cookie = await authCookie(UserRole.ADMIN)
    const uploaded = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', cookie)
      .attach('image', jpeg, {
        filename: 'food.jpg',
        contentType: 'image/jpeg',
      })
    const key = uploaded.body.data.image.key as string

    const deleted = await request(app)
      .delete(`/api/uploads/images/${key}`)
      .set('Cookie', cookie)
    expect(deleted.status).toBe(204)
    await expect(access(path.join(rootDirectory, key))).rejects.toMatchObject({
      code: 'ENOENT',
    })

    const unknown = await request(app)
      .delete('/api/uploads/images/123e4567-e89b-42d3-a456-426614174000.jpg')
      .set('Cookie', cookie)
    const unsafe = await request(app)
      .delete('/api/uploads/images/not-generated.jpg')
      .set('Cookie', cookie)
    const encodedTraversal = await request(app)
      .delete('/api/uploads/images/..%2Fsecret.jpg')
      .set('Cookie', cookie)

    expect(unknown.status).toBe(404)
    expect(unknown.body.error.code).toBe('UPLOAD_NOT_FOUND')
    expect(unsafe.status).toBe(400)
    expect(unsafe.body.error.code).toBe('VALIDATION_ERROR')
    expect(encodedTraversal.status).toBe(400)
    expect(encodedTraversal.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 503 before multipart work and never serves files when disabled', async () => {
    const multipart = vi.fn((_request, _response, next) => next())
    const app = createTestApp({ enabled: false, multipart })
    const cookie = await authCookie(UserRole.ADMIN)

    const upload = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', cookie)
    const staticResponse = await request(app).get(
      '/uploads/123e4567-e89b-42d3-a456-426614174000.jpg',
    )

    expect(upload.status).toBe(503)
    expect(upload.body.error.code).toBe('UPLOAD_STORAGE_UNAVAILABLE')
    expect(multipart).not.toHaveBeenCalled()
    expect(staticResponse.status).toBe(404)
  })

  it('does not serve files whose names were not generated by the API', async () => {
    await mkdir(rootDirectory, { recursive: true })
    await writeFile(path.join(rootDirectory, 'manual.jpg'), jpeg)
    const response = await request(createTestApp()).get('/uploads/manual.jpg')

    expect(response.status).toBe(404)
  })
})
