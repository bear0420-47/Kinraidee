import './types.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import { corsAllowedOrigins, env } from '@/config/env'
import { httpSerializers, logger } from '@/lib/logger'
import { errorHandler } from '@/middleware/errorHandler'
import { createRateLimit, loginEmailKey } from '@/middleware/rateLimit'
import { requestIdMiddleware } from '@/middleware/requestId'
import { createRequireTrustedOrigin } from '@/middleware/requireTrustedOrigin'
import { routes } from '@/routes'
import { HttpError } from '@/shared/httpError'
import { ok } from '@/shared/httpResponse'

const FIFTEEN_MINUTES = 15 * 60 * 1000
const ONE_MINUTE = 60 * 1000

export function createApp(): Express {
  const app = express()

  // Behind a reverse proxy, request.ip must come from X-Forwarded-For or every
  // client would share the proxy's address in the rate limits below.
  app.set(
    'trust proxy',
    env.TRUST_PROXY === true || env.TRUST_PROXY > 0 ? env.TRUST_PROXY : false,
  )

  app.use(requestIdMiddleware)
  app.use(
    pinoHttp({
      logger,
      genReqId: (request) => request.requestId,
      customProps: (request) => ({ requestId: request.requestId }),
      serializers: httpSerializers,
    }),
  )
  app.use(helmet())
  app.use(
    cors({
      origin: corsAllowedOrigins,
      credentials: true,
    }),
  )
  app.use(createRequireTrustedOrigin(corsAllowedOrigins))
  app.use(cookieParser())
  app.use(express.json({ limit: '100kb' }))

  // Brute-force and abuse limits. The per-IP auth limit is generous because campus
  // Wi-Fi puts many students behind one address; the per-account login limit is the
  // tight one. Recommendations and place details can call paid providers.
  app.post(
    ['/api/auth/login', '/api/auth/register'],
    createRateLimit({ name: 'auth-ip', windowMs: FIFTEEN_MINUTES, max: 100 }),
  )
  app.post(
    '/api/auth/login',
    createRateLimit({
      name: 'login-account',
      windowMs: FIFTEEN_MINUTES,
      max: 10,
      key: loginEmailKey,
    }),
  )
  app.post(
    '/api/recommendations',
    createRateLimit({
      name: 'recommendations',
      windowMs: ONE_MINUTE,
      max: 120,
    }),
  )
  app.get(
    '/api/restaurants/:restaurantId/place-details',
    createRateLimit({ name: 'place-details', windowMs: ONE_MINUTE, max: 120 }),
  )

  app.get('/health', (_request, response) => ok(response, { ok: true }))
  app.use(routes)
  app.use(() => {
    throw new HttpError({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Resource not found.',
    })
  })
  app.use(errorHandler)

  return app
}
