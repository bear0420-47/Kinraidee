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
import type { AiShortlistSelector } from './ai-shortlist-selector'
import { geminiShortlistAdapter } from './gemini-shortlist.adapter'

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
  aiSelector: AiShortlistSelector = geminiShortlistAdapter,
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

      async function selectItems(
        eligible: typeof candidates,
        conditions: RecommendationConditions,
      ) {
        if (input.count === 3 && eligible.length > 3) {
          const pool = selectDiverseCandidates(eligible, 6, random)
          const selected = await aiSelector
            .select({
              conditions,
              candidates: pool,
              count: input.count,
            })
            .catch(() => null)
          if (selected) {
            const byId = new Map(
              pool.map((candidate) => [candidate.id, candidate]),
            )
            const ids = selected.map(({ menuItemId }) => menuItemId)
            const selectedCandidates = ids.map((id) => byId.get(id))
            const uniqueIds = new Set(ids)
            const uniqueRestaurants = new Set(
              selectedCandidates.map((candidate) => candidate?.restaurantId),
            )
            const poolRestaurants = new Set(
              pool.map((candidate) => candidate.restaurantId),
            )
            const validDiversity =
              poolRestaurants.size < selected.length ||
              uniqueRestaurants.size === selected.length
            if (
              selected.length <= input.count &&
              uniqueIds.size === selected.length &&
              selectedCandidates.every(Boolean) &&
              validDiversity
            ) {
              return selected.map((selection) =>
                toRecommendationItem(
                  byId.get(selection.menuItemId)!,
                  conditions,
                  { source: 'AI', reasonTh: selection.reasonTh },
                ),
              )
            }
          }
        }

        return selectDiverseCandidates(eligible, input.count, random).map(
          (candidate) => toRecommendationItem(candidate, conditions),
        )
      }

      if (candidates.length > 0) {
        return { items: await selectItems(candidates, input.conditions) }
      }

      // A one-card replacement never weakens the effective shortlist conditions.
      if (input.count === 1) return { items: [], adjustment: null }

      const pool = await repository.findSuggestionPool(excludedIds)
      const adjustment = findSuggestion(pool, input.conditions, records)
      if (!adjustment) return { items: [], adjustment: null }

      const adjustedCandidates = await repository.findCandidates(
        adjustment.conditions,
        excludedIds,
      )
      // Catalog changes between the pool and candidate queries degrade to a true no-match.
      if (adjustedCandidates.length === 0) {
        return { items: [], adjustment: null }
      }

      return {
        items: await selectItems(adjustedCandidates, adjustment.conditions),
        adjustment,
      }
    },
  }
}

export const recommendationsService = createRecommendationsService()
export type RecommendationsService = ReturnType<
  typeof createRecommendationsService
>
