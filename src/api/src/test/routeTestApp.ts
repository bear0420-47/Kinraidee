import type { UserRole } from '@prisma/client'
import cookieParser from 'cookie-parser'
import express, { type Express, type Router } from 'express'
import { vi } from 'vitest'

export const testEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/kinraidee',
  JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
}

// Config modules parse env on import, so stub first and import app code afterwards.
export function stubTestEnv() {
  for (const [name, value] of Object.entries(testEnv)) vi.stubEnv(name, value)
}

export async function createRouteTestApp(
  path: string,
  router: Router,
): Promise<Express> {
  const { errorHandler } = await import('@/middleware/errorHandler')
  const { logger } = await import('@/lib/logger')
  const { requestIdMiddleware } = await import('@/middleware/requestId')

  const app = express()
  app.use(requestIdMiddleware)
  app.use((request, _response, next) => {
    request.log = logger
    next()
  })
  app.use(cookieParser())
  app.use(express.json())
  app.use(path, router)
  app.use(errorHandler)
  return app
}

export async function authCookie(
  role: UserRole,
  id = `${role.toLowerCase()}_1`,
) {
  const { signAuthToken } = await import('@/lib/authSecurity')
  return `kinraidee_auth=${await signAuthToken({ id, role })}`
}
