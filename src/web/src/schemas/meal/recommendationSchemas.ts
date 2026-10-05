import { z } from 'zod'

import type { components } from '@/api/openapiTypes'

// The recommendation API's own condition shape, so #54 can send it unchanged.
export type RecommendationConditions =
  components['schemas']['RecommendationRequest']['conditions']
export type Budget = RecommendationConditions['budget']

const budgetValues = [
  'UNDER_50',
  'BETWEEN_50_100',
  'BETWEEN_101_200',
  'OVER_200',
] as const satisfies readonly Budget[]

export const budgetLabels: Record<Budget, string> = {
  UNDER_50: 'ไม่เกิน ฿50',
  BETWEEN_50_100: '฿50–100',
  BETWEEN_101_200: '฿101–200',
  OVER_200: 'มากกว่า ฿200',
}

export const budgetOptions = budgetValues.map((value) => ({
  value,
  label: budgetLabels[value],
}))

// UI-only choices that map to `null`; they are not master-data records.
export const ANY_LABEL = 'อะไรก็ได้'
export const ANY_ZONE_LABEL = 'ที่ไหนก็ได้'

export const conditionSteps = ['budget', 'taste', 'foodType', 'zone'] as const
export const flowSteps = [...conditionSteps, 'summary'] as const
export type ConditionStep = (typeof conditionSteps)[number]
export type FlowStep = (typeof flowSteps)[number]

export const conditionFields = {
  budget: 'budget',
  taste: 'tasteId',
  foodType: 'foodTypeId',
  zone: 'zoneId',
} as const satisfies Record<ConditionStep, keyof RecommendationConditions>

export const missingChoiceMessages: Record<ConditionStep, string> = {
  budget: 'กรุณาเลือกงบประมาณ',
  taste: 'กรุณาเลือกรสชาติ',
  foodType: 'กรุณาเลือกประเภทอาหาร',
  zone: 'กรุณาเลือกพื้นที่',
}

const masterDataId = z.string().min(1).nullable()

// The only recommendation state kept in sessionStorage; anything else fails to parse.
export const storedFlowSchema = z
  .object({
    step: z.enum(flowSteps),
    conditions: z
      .object({
        budget: z.enum(budgetValues),
        tasteId: masterDataId,
        foodTypeId: masterDataId,
        zoneId: masterDataId,
      })
      .partial()
      .strict(),
  })
  .strict()

export type StoredFlow = z.infer<typeof storedFlowSchema>

// An unanswered field is absent; an answered "any" choice is `null`.
export type ConditionDraft = StoredFlow['conditions']

export const emptyFlow: StoredFlow = { step: 'budget', conditions: {} }

export const RECOMMENDATION_STORAGE_KEY = 'kinraidee:recommendation'

export function isAnswered(draft: ConditionDraft, step: ConditionStep) {
  return draft[conditionFields[step]] !== undefined
}

export function isCompleteConditions(
  draft: ConditionDraft,
): draft is RecommendationConditions {
  return conditionSteps.every((step) => isAnswered(draft, step))
}

type KnownIds = {
  tasteIds: string[]
  foodTypeIds: string[]
  zoneIds: string[]
}

// A stored ID whose record no longer exists (for example, deleted by an admin) is unanswered.
export function withKnownIds(
  draft: ConditionDraft,
  { tasteIds, foodTypeIds, zoneIds }: KnownIds,
): ConditionDraft {
  const known = { ...draft }
  const keep = (id: string | null | undefined, ids: string[]) =>
    id === undefined || id === null || ids.includes(id)
  if (!keep(known.tasteId, tasteIds)) delete known.tasteId
  if (!keep(known.foodTypeId, foodTypeIds)) delete known.foodTypeId
  if (!keep(known.zoneId, zoneIds)) delete known.zoneId
  return known
}

// The first unanswered step, or the summary once every condition is answered.
export function firstOpenStep(draft: ConditionDraft): FlowStep {
  return conditionSteps.find((step) => !isAnswered(draft, step)) ?? 'summary'
}
