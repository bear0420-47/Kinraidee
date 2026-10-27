import { z } from 'zod'

import type { components } from '@/api/openapiTypes'

// The recommendation API's own request and response shapes.
export type RecommendationRequest =
  components['schemas']['RecommendationRequest']
export type RecommendationConditions = RecommendationRequest['conditions']
type RecommendationResult =
  components['schemas']['RecommendationEnvelope']['data']
export type RecommendationItem = RecommendationResult['items'][number]
export type Adjustment = NonNullable<RecommendationResult['adjustment']>
export type Budget = RecommendationConditions['budget']

export const budgetValues = [
  'UNDER_50',
  'BETWEEN_50_100',
  'BETWEEN_101_200',
  'OVER_200',
] as const satisfies readonly Budget[]

export const budgetLabels: Record<Budget, string> = {
  UNDER_50: 'ต่ำกว่า ฿50',
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
// `cards` shows the shortlist; it is reached only through a successful shuffle.
export type MealStep = FlowStep | 'cards'

export const conditionFields = {
  budget: 'budget',
  taste: 'tasteId',
  foodType: 'foodTypeId',
  zone: 'zoneId',
} as const satisfies Record<ConditionStep, keyof RecommendationConditions>

export const missingChoiceMessages: Record<ConditionStep, string> = {
  budget: 'เลือกงบมื้อนี้ก่อนนะ',
  taste: 'เลือกรสที่อยากกินก่อนนะ',
  foodType: 'เลือกแนวอาหารก่อนนะ',
  zone: 'เลือกโซนก่อนนะ',
}

const masterDataId = z.string().min(1).nullable()
const conditionsSchema = z
  .object({
    budget: z.enum(budgetValues),
    tasteId: masterDataId,
    foodTypeId: masterDataId,
    zoneId: masterDataId,
  })
  .strict()
const localization = z.object({ th: z.string(), en: z.string() })
const namedRecord = z.object({ id: z.string().min(1), name: localization })
const iconRecord = namedRecord.extend({ icon: z.string().nullable() })
const adjustmentSchema = z.object({
  changes: z
    .array(
      z.object({
        field: z.enum(['zone', 'budget', 'taste', 'foodType']),
        from: z.object({
          type: z.enum(['BUDGET_RANGE', 'TASTE', 'FOOD_TYPE', 'ZONE']),
          id: z.string(),
          label: localization,
        }),
        to: z.object({
          type: z.enum(['BUDGET_RANGE', 'TASTE', 'FOOD_TYPE', 'ZONE']),
          id: z.string(),
          label: localization,
        }),
      }),
    )
    .min(1)
    .max(4),
  conditions: conditionsSchema,
  resultCount: z.number().int().positive(),
}) satisfies z.ZodType<Adjustment>

// A returned item exactly as the cards display it; checked again when read from storage.
const recommendationItemSchema = z.object({
  id: z.string().min(1),
  name: localization,
  description: localization.nullable(),
  price: z.number().int().positive(),
  imageUrl: z.string().nullable(),
  restaurant: namedRecord,
  zone: namedRecord,
  foodType: iconRecord,
  tastes: z.array(iconRecord),
  rationale: z.object({
    matchedBudget: z.literal(true),
    matchedTaste: z.boolean(),
    matchedFoodType: z.boolean(),
    matchedZone: z.boolean(),
  }),
  selection: z.object({
    source: z.enum(['AI', 'DETERMINISTIC']),
    reasonTh: z.string().max(120).nullable(),
  }),
}) satisfies z.ZodType<RecommendationItem>

const cardSlotSchema = z
  .object({
    kind: z.literal('card'),
    item: recommendationItemSchema,
    revealed: z.boolean(),
  })
  .strict()

// A card slot, or a slot whose replacement request found no more options.
const slotSchema = z.discriminatedUnion('kind', [
  cardSlotSchema,
  z.object({ kind: z.literal('exhausted') }).strict(),
])

export const MAX_CARDS = 3

// The displayed shortlist, reveal state, rejected IDs, the one-step undo record, and the card
// being confirmed (only its ID, so a login round trip or reload reopens its dialog).
const shortlistSchema = z
  .object({
    slots: z.array(slotSchema).min(1).max(MAX_CARDS),
    rejectedMenuItemIds: z.array(z.string().min(1)).max(500),
    adjustment: adjustmentSchema.optional(),
    undo: z
      .object({
        slotIndex: z
          .number()
          .int()
          .min(0)
          .max(MAX_CARDS - 1),
        previous: cardSlotSchema,
        rejectedId: z.string().min(1),
      })
      .strict()
      .nullable(),
    chosenMenuItemId: z.string().min(1).optional(),
    // The chosen card was confirmed with `เอาเมนูนี้แหละ`; its history is already recorded.
    confirmed: z.literal(true).optional(),
  })
  .strict()

// The only recommendation state kept in sessionStorage; anything else fails to parse.
export const storedFlowSchema = z
  .object({
    step: z.enum([...flowSteps, 'cards']),
    conditions: conditionsSchema.partial(),
    shortlist: shortlistSchema.optional(),
  })
  .strict()

export type StoredFlow = z.infer<typeof storedFlowSchema>
export type Shortlist = z.infer<typeof shortlistSchema>
export type Slot = Shortlist['slots'][number]
export type CardSlot = Extract<Slot, { kind: 'card' }>

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

export function initialRequest(
  conditions: RecommendationConditions,
): RecommendationRequest {
  return {
    conditions,
    rejectedMenuItemIds: [],
    displayedMenuItemIds: [],
    count: MAX_CARDS,
  }
}

// One replacement for the card in `slotIndex`: it is rejected, and the other cards still on
// screen are excluded so the replacement never duplicates them.
export function replacementRequest(
  conditions: RecommendationConditions,
  shortlist: Shortlist,
  slotIndex: number,
): RecommendationRequest {
  const rejected = shortlist.slots[slotIndex]
  if (rejected?.kind !== 'card') {
    throw new Error('Only a displayed card can be replaced.')
  }
  return {
    conditions,
    rejectedMenuItemIds: [...shortlist.rejectedMenuItemIds, rejected.item.id],
    displayedMenuItemIds: shortlist.slots.flatMap((slot, index) =>
      slot.kind === 'card' && index !== slotIndex ? [slot.item.id] : [],
    ),
    count: 1,
  }
}

export const adjustmentFieldLabels: Record<
  Adjustment['changes'][number]['field'],
  string
> = {
  budget: 'งบ',
  taste: 'รสชาติ',
  foodType: 'ประเภทอาหาร',
  zone: 'พื้นที่',
}

// One sentence naming every condition the backend changed before returning the shortlist.
export function adjustmentMessage({ changes, resultCount }: Adjustment) {
  const parts = changes.map(
    ({ field, from, to }) =>
      `${adjustmentFieldLabels[field]}จาก “${from.label.th}” เป็น “${to.label.th}”`,
  )
  return `ยังไม่เจอเมนูที่ตรงครบทุกข้อ เลยปรับ${parts.join(' และ')} ให้แล้ว เจอ ${resultCount} เมนูแล้ว ลองดูการ์ดด้านล่างได้เลย`
}

// Compare actual menu data to the original answers, never the alternate request's rationale.
export function conditionDifferences(
  item: RecommendationItem,
  conditions: RecommendationConditions,
): string[] {
  const differences: string[] = []
  // UNDER_50 excludes 50; keep that exact boundary explicit in the explanation below.
  const bounds: Record<Budget, [number, number]> = {
    UNDER_50: [0, 50],
    BETWEEN_50_100: [50, 100],
    BETWEEN_101_200: [101, 200],
    OVER_200: [201, Infinity],
  }
  const [minimum, maximum] = bounds[conditions.budget]
  if (item.price > maximum) {
    differences.push('เกินงบ ' + (item.price - maximum) + ' บาท')
  } else if (item.price < minimum) {
    differences.push(
      'ราคาต่ำกว่าช่วงงบที่เลือก ' + (minimum - item.price) + ' บาท',
    )
  } else if (conditions.budget === 'UNDER_50' && item.price === 50) {
    differences.push('ราคา 50 บาท ไม่อยู่ในช่วงต่ำกว่า 50 บาท')
  }
  if (
    conditions.tasteId !== null &&
    !item.tastes.some(({ id }) => id === conditions.tasteId)
  ) {
    differences.push(
      'รสชาติต่างจากที่เลือก: ' +
        (item.tastes.map(({ name }) => name.th).join(', ') || 'ไม่ระบุรสชาติ'),
    )
  }
  if (
    conditions.foodTypeId !== null &&
    item.foodType.id !== conditions.foodTypeId
  ) {
    differences.push('ประเภทอาหารต่างจากที่เลือก: ' + item.foodType.name.th)
  }
  if (conditions.zoneId !== null && item.zone.id !== conditions.zoneId) {
    differences.push('อยู่คนละพื้นที่: ' + item.zone.name.th)
  }
  return differences
}

// Structured rationale as Thai copy. A false flag means the user chose "any", never that a
// mandatory filter failed, so it reads as openness rather than a miss.
export function rationaleLines(
  {
    matchedTaste,
    matchedFoodType,
    matchedZone,
  }: RecommendationItem['rationale'],
  compact = false,
) {
  return [
    'อยู่ในงบที่เลือก',
    ...(matchedTaste
      ? ['ตรงกับรสชาติที่เลือก']
      : compact
        ? []
        : ['รสไหนก็ได้']),
    ...(matchedFoodType
      ? ['ตรงกับประเภทอาหารที่เลือก']
      : compact
        ? []
        : ['อาหารแนวไหนก็ได้']),
    ...(matchedZone ? ['อยู่ในโซนที่เลือก'] : compact ? [] : ['โซนไหนก็ได้']),
  ]
}
