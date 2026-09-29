import { Router, type Router as ExpressRouter } from 'express'

import { requireAdmin } from '@/middleware/requireAdmin'
import { requireAuth } from '@/middleware/requireAuth'
import {
  foodTypesController,
  type FoodTypesController,
} from './food-types.controller'

export function createFoodTypesRoutes(
  controller: FoodTypesController = foodTypesController,
): ExpressRouter {
  const router = Router()
  const adminOnly = [requireAuth, requireAdmin]

  router.get('/', controller.list)
  router.post('/', adminOnly, controller.create)
  router.patch('/:id', adminOnly, controller.update)
  router.delete('/:id', adminOnly, controller.remove)

  return router
}

export const foodTypesRoutes: ExpressRouter = createFoodTypesRoutes()
