import { Prisma } from '@prisma/client'
import { z } from 'zod'

import {
  localizationSchema,
  toLocalization,
  toOptionalLocalization,
} from '@/shared/localization'
import { parseWithSchema } from '@/shared/validation'

export const budgetRangeSchema = z.enum([
  'UNDER_50',
  'BETWEEN_50_100',
  'BETWEEN_101_200',
  'OVER_200',
])

const optionalConditionIdSchema = z.string().trim().min(1).nullable()
const exclusionIdsSchema = z
  .array(z.string().trim().min(1))
  .max(500)
  .transform((ids) => [...new Set(ids)])

export const recommendationConditionsSchema = z
  .object({
    budget: budgetRangeSchema,
    tasteId: optionalConditionIdSchema,
    foodTypeId: optionalConditionIdSchema,
    zoneId: optionalConditionIdSchema,
  })
  .strict()

export const recommendationRequestSchema = z
  .object({
    conditions: recommendationConditionsSchema,
    rejectedMenuItemIds: exclusionIdsSchema,
    displayedMenuItemIds: exclusionIdsSchema,
    count: z.union([z.literal(1), z.literal(3)]),
  })
  .strict()

const recommendationTasteSchema = z.object({
  id: z.string(),
  name: localizationSchema,
  icon: z.string().nullable(),
})

export const recommendationItemSchema = z.object({
  id: z.string(),
  name: localizationSchema,
  description: localizationSchema.nullable(),
  price: z.number().int().positive(),
  imageUrl: z.string().nullable(),
  restaurant: z.object({
    id: z.string(),
    name: localizationSchema,
  }),
  zone: z.object({
    id: z.string(),
    name: localizationSchema,
  }),
  foodType: z.object({
    id: z.string(),
    name: localizationSchema,
    icon: z.string().nullable(),
  }),
  tastes: z.array(recommendationTasteSchema),
  rationale: z.object({
    matchedBudget: z.literal(true),
    matchedTaste: z.boolean(),
    matchedFoodType: z.boolean(),
    matchedZone: z.boolean(),
  }),
})

// A filter value in a no-match suggestion. `BUDGET_RANGE` uses a BudgetRange value as its
// `id`; the others use their record ID.
export const suggestionValueSchema = z.object({
  type: z.enum(['BUDGET_RANGE', 'TASTE', 'FOOD_TYPE', 'ZONE']),
  id: z.string(),
  label: localizationSchema,
})

export const suggestionFieldSchema = z.enum([
  'zone',
  'budget',
  'taste',
  'foodType',
])

export const suggestionChangeSchema = z.object({
  field: suggestionFieldSchema,
  from: suggestionValueSchema,
  to: suggestionValueSchema,
})

// The fewest filter changes that leave at least one item. `conditions` has every change
// applied, so the client can send it back as-is; `resultCount` counts the items it matches
// with the same exclusions.
export const recommendationSuggestionSchema = z
  .object({
    changes: z.array(suggestionChangeSchema).min(1).max(4),
    conditions: recommendationConditionsSchema,
    resultCount: z.number().int().positive(),
  })
  .describe(
    'No-match suggestion. Null only when no active, non-excluded menu item exists, and for one-card replacements.',
  )

export const recommendationEnvelopeSchema = z.object({
  data: z.object({
    items: z.array(recommendationItemSchema).max(3),
    suggestion: recommendationSuggestionSchema.nullable().optional(),
  }),
})

export const recommendationCandidate =
  Prisma.validator<Prisma.MenuItemDefaultArgs>()({
    include: {
      restaurant: { include: { zone: true } },
      foodType: true,
      tastes: { include: { taste: true } },
    },
  })

export type BudgetRange = z.infer<typeof budgetRangeSchema>
export type RecommendationRequest = z.output<typeof recommendationRequestSchema>
export type RecommendationConditions = RecommendationRequest['conditions']
export type RecommendationCandidate = Prisma.MenuItemGetPayload<
  typeof recommendationCandidate
>
export type RecommendationItem = z.infer<typeof recommendationItemSchema>
export type RecommendationSuggestion = z.infer<
  typeof recommendationSuggestionSchema
>
export type SuggestionField = z.infer<typeof suggestionFieldSchema>

export function parseRecommendationRequest(input: unknown) {
  return parseWithSchema(recommendationRequestSchema, input)
}

export function toRecommendationItem(
  item: RecommendationCandidate,
  conditions: RecommendationConditions,
): RecommendationItem {
  const tastes = item.tastes
    .map(({ taste }) => taste)
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.nameTh.localeCompare(right.nameTh, 'th') ||
        left.id.localeCompare(right.id),
    )
    .map((taste) => ({
      id: taste.id,
      name: toLocalization(taste.nameTh, taste.nameEn),
      icon: taste.icon,
    }))

  return {
    id: item.id,
    name: toLocalization(item.nameTh, item.nameEn),
    description: toOptionalLocalization(item.descriptionTh, item.descriptionEn),
    price: item.price,
    imageUrl: item.imageUrl,
    restaurant: {
      id: item.restaurant.id,
      name: toLocalization(item.restaurant.nameTh, item.restaurant.nameEn),
    },
    zone: {
      id: item.restaurant.zone.id,
      name: toLocalization(
        item.restaurant.zone.nameTh,
        item.restaurant.zone.nameEn,
      ),
    },
    foodType: {
      id: item.foodType.id,
      name: toLocalization(item.foodType.nameTh, item.foodType.nameEn),
      icon: item.foodType.icon,
    },
    tastes,
    rationale: {
      matchedBudget: true,
      matchedTaste: conditions.tasteId !== null,
      matchedFoodType: conditions.foodTypeId !== null,
      matchedZone: conditions.zoneId !== null,
    },
  }
}
