import { HttpError } from '@/shared/httpError'
import { toLocalization, type Localization } from '@/shared/localization'
import {
  toRecommendationItem,
  type BudgetRange,
  type RecommendationConditions,
  type RecommendationRelaxation,
  type RecommendationRequest,
} from './recommendations.dto'
import {
  nextBudgetRange,
  selectDiverseCandidates,
} from './recommendations.helpers'
import {
  recommendationsRepository,
  type RecommendationsRepository,
} from './recommendations.repository'

type MasterRecord = { id: string; nameTh: string; nameEn: string }

const budgetLabels: Record<BudgetRange, Localization> = {
  UNDER_50: { th: 'ไม่เกิน ฿50', en: 'Under ฿50' },
  BETWEEN_50_100: { th: '฿50–100', en: '฿50–100' },
  BETWEEN_101_200: { th: '฿101–200', en: '฿101–200' },
  OVER_200: { th: 'มากกว่า ฿200', en: 'Over ฿200' },
}

const anyLabels = {
  taste: { th: 'อะไรก็ได้', en: 'Any taste' },
  foodType: { th: 'อะไรก็ได้', en: 'Any food type' },
  zone: { th: 'ที่ไหนก็ได้', en: 'Any zone' },
} satisfies Record<string, Localization>

function invalidMasterDataError(fields: Record<string, string>) {
  return new HttpError({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid request.',
    fields,
  })
}

function recordLabel(record: MasterRecord): Localization {
  return toLocalization(record.nameTh, record.nameEn)
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

  async function findRelaxation(
    conditions: RecommendationConditions,
    excludedIds: string[],
    records: {
      taste: MasterRecord | null
      foodType: MasterRecord | null
      zone: MasterRecord | null
    },
  ): Promise<RecommendationRelaxation | null> {
    if (conditions.zoneId && records.zone) {
      const resultCount = await repository.countCandidates(
        { ...conditions, zoneId: null },
        excludedIds,
      )
      if (resultCount > 0) {
        return {
          field: 'zone',
          from: {
            type: 'ZONE',
            id: records.zone.id,
            label: recordLabel(records.zone),
          },
          to: { type: 'ANY_ZONE', id: null, label: anyLabels.zone },
          resultCount,
        }
      }
    }

    const nextBudget = nextBudgetRange(conditions.budget)
    if (nextBudget) {
      const resultCount = await repository.countCandidates(
        { ...conditions, budget: nextBudget },
        excludedIds,
      )
      if (resultCount > 0) {
        return {
          field: 'budget',
          from: {
            type: 'BUDGET_RANGE',
            id: conditions.budget,
            label: budgetLabels[conditions.budget],
          },
          to: {
            type: 'BUDGET_RANGE',
            id: nextBudget,
            label: budgetLabels[nextBudget],
          },
          resultCount,
        }
      }
    }

    if (conditions.tasteId && records.taste) {
      const resultCount = await repository.countCandidates(
        { ...conditions, tasteId: null },
        excludedIds,
      )
      if (resultCount > 0) {
        return {
          field: 'taste',
          from: {
            type: 'TASTE',
            id: records.taste.id,
            label: recordLabel(records.taste),
          },
          to: { type: 'ANY_TASTE', id: null, label: anyLabels.taste },
          resultCount,
        }
      }
    }

    if (conditions.foodTypeId && records.foodType) {
      const resultCount = await repository.countCandidates(
        { ...conditions, foodTypeId: null },
        excludedIds,
      )
      if (resultCount > 0) {
        return {
          field: 'foodType',
          from: {
            type: 'FOOD_TYPE',
            id: records.foodType.id,
            label: recordLabel(records.foodType),
          },
          to: {
            type: 'ANY_FOOD_TYPE',
            id: null,
            label: anyLabels.foodType,
          },
          resultCount,
        }
      }
    }

    return null
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

      if (input.count === 1) return { items: [], relaxation: null }

      return {
        items: [],
        relaxation: await findRelaxation(
          input.conditions,
          excludedIds,
          records,
        ),
      }
    },
  }
}

export const recommendationsService = createRecommendationsService()
export type RecommendationsService = ReturnType<
  typeof createRecommendationsService
>
