import { z } from 'zod'

import type { components } from '@/api/openapiTypes'

// The recommendation API's own request and response shapes.
export type RecommendationRequest =
  components['schemas']['RecommendationRequest']
export type RecommendationConditions = RecommendationRequest['conditions']
type RecommendationResult =
  components['schemas']['RecommendationEnvelope']['data']
export type RecommendationItem = RecommendationResult['items'][number]
export type Suggestion = NonNullable<RecommendationResult['suggestion']>
export type Budget = RecommendationConditions['budget']

export const budgetValues = [
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
// `cards` shows the shortlist; it is reached only through a successful shuffle.
export type MealStep = FlowStep | 'cards'

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
const localization = z.object({ th: z.string(), en: z.string() })
const namedRecord = z.object({ id: z.string().min(1), name: localization })
const iconRecord = namedRecord.extend({ icon: z.string().nullable() })

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
    conditions: z
      .object({
        budget: z.enum(budgetValues),
        tasteId: masterDataId,
        foodTypeId: masterDataId,
        zoneId: masterDataId,
      })
      .partial()
      .strict(),
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

export const suggestionFieldLabels: Record<
  Suggestion['changes'][number]['field'],
  string
> = {
  budget: 'งบประมาณ',
  taste: 'รสชาติ',
  foodType: 'ประเภทอาหาร',
  zone: 'พื้นที่',
}

// One sentence naming every suggested change, e.g. "ถ้าเปลี่ยนพื้นที่จาก “คชพล” เป็น
// “ตลาดฟ้าไทย” และรสชาติจาก “เผ็ด” เป็น “กลมกล่อม” จะพบ 4 เมนู".
export function suggestionMessage({ changes, resultCount }: Suggestion) {
  const parts = changes.map(
    ({ field, from, to }) =>
      `${suggestionFieldLabels[field]}จาก “${from.label.th}” เป็น “${to.label.th}”`,
  )
  return `ถ้าเปลี่ยน${parts.join(' และ')} จะพบ ${resultCount} เมนู`
}

// Structured rationale as Thai copy. A false flag means the user chose "any", never that a
// mandatory filter failed, so it reads as openness rather than a miss.
export function rationaleLines({
  matchedTaste,
  matchedFoodType,
  matchedZone,
}: RecommendationItem['rationale']) {
  return [
    'อยู่ในงบที่เลือก',
    matchedTaste ? 'ตรงกับรสชาติที่เลือก' : 'เปิดรับรสชาติได้หลากหลาย',
    matchedFoodType ? 'ตรงกับประเภทอาหารที่เลือก' : 'เปิดรับอาหารได้ทุกประเภท',
    matchedZone ? 'อยู่ในโซนที่เลือก' : 'เปิดรับได้ทุกโซน',
  ]
}
