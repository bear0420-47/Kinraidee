import { Router, type Router as ExpressRouter } from 'express'

import { requireAuth } from '@/middleware/requireAuth'
import {
  recommendationHistoryController,
  type RecommendationHistoryController,
} from './recommendation-history.controller'

// The signed-in user's selected-menu history, for any role; there is no public history API.
export function createRecommendationHistoryRoutes(
  controller: RecommendationHistoryController = recommendationHistoryController,
): ExpressRouter {
  const router = Router()

  router.get('/', requireAuth, controller.list)
  router.post('/', requireAuth, controller.record)
  router.delete('/', requireAuth, controller.clear)

  return router
}

export const recommendationHistoryRoutes = createRecommendationHistoryRoutes()
