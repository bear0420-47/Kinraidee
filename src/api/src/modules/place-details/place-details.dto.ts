import { z } from 'zod'

import { parseWithSchema } from '@/shared/validation'

export const placeDetailsParamsSchema = z.object({
  restaurantId: z.string().trim().min(1),
})

const placeReviewSchema = z.object({
  authorName: z.string(),
  authorUri: z.string().nullable(),
  rating: z.number().nullable(),
  relativePublishTimeDescription: z.string().nullable(),
  text: z.string().nullable(),
  publishTime: z.string().nullable(),
})

export const placeDetailsSchema = z.object({
  rating: z.number().nullable(),
  userRatingCount: z.number().int().nullable(),
  openNow: z.boolean().nullable(),
  weekdayDescriptions: z.array(z.string()),
  googleMapsUri: z.string().nullable(),
  reviews: z.array(placeReviewSchema),
})

export const placeDetailsEnvelopeSchema = z.object({
  data: z.object({ details: placeDetailsSchema.nullable() }),
})

export function parsePlaceDetailsRestaurantId(input: unknown) {
  return parseWithSchema(placeDetailsParamsSchema, input).restaurantId
}
