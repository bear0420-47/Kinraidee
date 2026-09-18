import './types.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import { corsAllowedOrigins } from '@/config/env'
import { logger } from '@/lib/logger'
import { errorHandler } from '@/middleware/errorHandler'
import { requestIdMiddleware } from '@/middleware/requestId'
import { routes } from '@/routes'
import { ok } from '@/shared/httpResponse'

export function createApp(): Express {
  const app = express()

  app.use(requestIdMiddleware)
  app.use(
    pinoHttp({
      logger,
      genReqId: (request) => request.requestId,
    }),
  )
  app.use(helmet())
  app.use(
    cors({
      origin: corsAllowedOrigins,
      credentials: true,
    }),
  )
  app.use(cookieParser())
  app.use(express.json({ limit: '100kb' }))

  app.get('/health', (_request, response) => ok(response, { ok: true }))
  app.use(routes)
  app.use(errorHandler)

  return app
}
