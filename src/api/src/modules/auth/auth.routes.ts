import {
  Router,
  type RequestHandler,
  type Router as ExpressRouter,
} from 'express'

import { requireAuth } from '@/middleware/requireAuth'
import { authController, type AuthController } from './auth.controller'

export function createAuthRoutes(
  controller: AuthController = authController,
  authMiddleware: RequestHandler = requireAuth,
): ExpressRouter {
  const router = Router()

  router.post('/register', controller.register)
  router.post('/login', controller.login)
  router.post('/logout', controller.logout)
  router.get('/me', authMiddleware, controller.me)

  return router
}

export const authRoutes: ExpressRouter = createAuthRoutes()
