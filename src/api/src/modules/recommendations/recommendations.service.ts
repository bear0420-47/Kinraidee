import { HttpError } from '@/shared/httpError'
import {
  toRecommendationItem,
  type RecommendationConditions,
  type RecommendationRequest,
} from './recommendations.dto'
import { selectDiverseCandidates } from './recommendations.helpers'
import {
  recommendationsRepository,
  type RecommendationsRepository,
} from './recommendations.repository'
import { findSuggestion } from './recommendations.suggestion'

function invalidMasterDataError(fields: Record<string, string>) {
  return new HttpError({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid request.',
    fields,
  })
}

export function createRecommendationsService(
  repository: RecommendationsRepository = recommendationsRepository,
  random: () => number = Math.random,
) {
  async function validateConditions(conditions: RecommendationConditions) {
    const [taste, foodType, zone] = await Promise.all([
      conditions.tasteId ? repository.findTaste(conditions.tasteId) : null,
      conditions.foodTypeId
        ? repository.findFoodType(conditions.foodTypeId)
        : null,
      conditions.zoneId ? repository.findZone(conditions.zoneId) : null,
    ])
    const fields: Record<string, string> = {}
    if (conditions.tasteId && !taste) {
      fields['conditions.tasteId'] = 'Unknown taste ID.'
    }
    if (conditions.foodTypeId && !foodType) {
      fields['conditions.foodTypeId'] = 'Unknown food type ID.'
    }
    if (conditions.zoneId && !zone) {
      fields['conditions.zoneId'] = 'Unknown zone ID.'
    }
    if (Object.keys(fields).length > 0) throw invalidMasterDataError(fields)

    return { taste, foodType, zone }
  }

  return {
    async recommend(input: RecommendationRequest) {
      const records = await validateConditions(input.conditions)
      const rejectedIds = new Set(input.rejectedMenuItemIds)
      const displayedIds = input.displayedMenuItemIds.filter(
        (id) => !rejectedIds.has(id),
      )
      const excludedIds = [...rejectedIds, ...displayedIds]
      const candidates = await repository.findCandidates(
        input.conditions,
        excludedIds,
      )

      if (candidates.length > 0) {
        return {
          items: selectDiverseCandidates(candidates, input.count, random).map(
            (candidate) => toRecommendationItem(candidate, input.conditions),
          ),
        }
      }

      // A one-card replacement leaves the slot empty instead of suggesting new filters.
      if (input.count === 1) return { items: [], suggestion: null }

      const pool = await repository.findSuggestionPool(excludedIds)
      return {
        items: [],
        suggestion: findSuggestion(pool, input.conditions, records),
      }
    },
  }
}

export const recommendationsService = createRecommendationsService()
export type RecommendationsService = ReturnType<
  typeof createRecommendationsService
>
