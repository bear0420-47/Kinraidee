import { Router, type Router as ExpressRouter } from 'express'

import { requireAdmin } from '@/middleware/requireAdmin'
import { requireAuth } from '@/middleware/requireAuth'
import {
  restaurantsController,
  type RestaurantsController,
} from './restaurants.controller'

export function createRestaurantsRoutes(
  controller: RestaurantsController = restaurantsController,
): ExpressRouter {
  const router = Router()
  const adminOnly = [requireAuth, requireAdmin]

  router.get('/', adminOnly, controller.list)
  router.get('/:id', adminOnly, controller.detail)
  router.post('/', adminOnly, controller.create)
  router.patch('/:id', adminOnly, controller.update)
  router.delete('/:id', adminOnly, controller.remove)
  router.post('/:id/restore', adminOnly, controller.restore)

  return router
}

export const restaurantsRoutes = createRestaurantsRoutes()
