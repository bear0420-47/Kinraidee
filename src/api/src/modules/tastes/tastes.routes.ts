import { Router, type Router as ExpressRouter } from 'express'

import { requireAdmin } from '@/middleware/requireAdmin'
import { requireAuth } from '@/middleware/requireAuth'
import { tastesController, type TastesController } from './tastes.controller'

export function createTastesRoutes(
  controller: TastesController = tastesController,
): ExpressRouter {
  const router = Router()
  const adminOnly = [requireAuth, requireAdmin]

  router.get('/', controller.list)
  router.post('/', adminOnly, controller.create)
  router.patch('/:id', adminOnly, controller.update)
  router.delete('/:id', adminOnly, controller.remove)

  return router
}

export const tastesRoutes: ExpressRouter = createTastesRoutes()
