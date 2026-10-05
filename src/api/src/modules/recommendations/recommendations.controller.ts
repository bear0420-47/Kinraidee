import type { RequestHandler } from 'express'

import { ok } from '@/shared/httpResponse'
import { parseRecommendationRequest } from './recommendations.dto'
import {
  recommendationsService,
  type RecommendationsService,
} from './recommendations.service'

export type RecommendationsController = {
  recommend: RequestHandler
}

export function createRecommendationsController(
  service: RecommendationsService = recommendationsService,
): RecommendationsController {
  const recommend: RequestHandler = async (request, response) =>
    ok(
      response,
      await service.recommend(parseRecommendationRequest(request.body)),
    )

  return { recommend }
}

export const recommendationsController = createRecommendationsController()
