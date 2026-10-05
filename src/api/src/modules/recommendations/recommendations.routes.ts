import { Router, type Router as ExpressRouter } from 'express'

import {
  recommendationsController,
  type RecommendationsController,
} from './recommendations.controller'

export function createRecommendationsRoutes(
  controller: RecommendationsController = recommendationsController,
): ExpressRouter {
  const router = Router()
  router.post('/', controller.recommend)
  return router
}

export const recommendationsRoutes = createRecommendationsRoutes()
