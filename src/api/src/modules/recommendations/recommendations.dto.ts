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

export const recommendationRequestSchema = z
  .object({
    conditions: z
      .object({
        budget: budgetRangeSchema,
        tasteId: optionalConditionIdSchema,
        foodTypeId: optionalConditionIdSchema,
        zoneId: optionalConditionIdSchema,
      })
      .strict(),
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

export const relaxationValueSchema = z.object({
  type: z.enum([
    'BUDGET_RANGE',
    'TASTE',
    'ANY_TASTE',
    'FOOD_TYPE',
    'ANY_FOOD_TYPE',
    'ZONE',
    'ANY_ZONE',
  ]),
  id: z.string().nullable(),
  label: localizationSchema,
})

export const recommendationRelaxationSchema = z.object({
  field: z.enum(['zone', 'budget', 'taste', 'foodType']),
  from: relaxationValueSchema,
  to: relaxationValueSchema,
  resultCount: z.number().int().positive(),
})

export const recommendationEnvelopeSchema = z.object({
  data: z.object({
    items: z.array(recommendationItemSchema).max(3),
    relaxation: recommendationRelaxationSchema.nullable().optional(),
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
export type RecommendationRelaxation = z.infer<
  typeof recommendationRelaxationSchema
>

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
