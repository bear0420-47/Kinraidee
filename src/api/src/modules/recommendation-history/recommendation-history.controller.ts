import type { Request, RequestHandler } from 'express'

import { created, noContent, ok } from '@/shared/httpResponse'
import {
  parseHistoryListQuery,
  parseRecordHistory,
} from './recommendation-history.dto'
import {
  recommendationHistoryService,
  type RecommendationHistoryService,
} from './recommendation-history.service'

export type RecommendationHistoryController = {
  list: RequestHandler
  record: RequestHandler
  clear: RequestHandler
}

// Every history route sits behind `requireAuth`, and the user always comes from the token.
function currentUserId(request: Request) {
  return request.user!.id
}

export function createRecommendationHistoryController(
  service: RecommendationHistoryService = recommendationHistoryService,
): RecommendationHistoryController {
  const list: RequestHandler = async (request, response) => {
    const result = await service.list(
      currentUserId(request),
      parseHistoryListQuery(request.query),
    )
    return ok(response, { items: result.items }, result.meta)
  }

  const record: RequestHandler = async (request, response) =>
    created(response, {
      history: await service.record(
        currentUserId(request),
        parseRecordHistory(request.body),
      ),
    })

  const clear: RequestHandler = async (request, response) => {
    await service.clear(currentUserId(request))
    return noContent(response)
  }

  return { list, record, clear }
}

export const recommendationHistoryController =
  createRecommendationHistoryController()
