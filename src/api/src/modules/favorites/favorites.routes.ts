import { Router, type Router as ExpressRouter } from 'express'

import { requireAuth } from '@/middleware/requireAuth'
import {
  favoritesController,
  type FavoritesController,
} from './favorites.controller'

// Account favorites for any signed-in role; there is no public favorites API.
export function createFavoritesRoutes(
  controller: FavoritesController = favoritesController,
): ExpressRouter {
  const router = Router()

  router.get('/', requireAuth, controller.list)
  router.put('/:menuItemId', requireAuth, controller.favorite)
  router.delete('/:menuItemId', requireAuth, controller.unfavorite)
  router.post('/:menuItemId/toggle', requireAuth, controller.toggle)

  return router
}

export const favoritesRoutes = createFavoritesRoutes()
