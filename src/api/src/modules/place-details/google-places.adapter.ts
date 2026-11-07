import { z } from 'zod'

import { env } from '@/config/env'
import type { PlaceDetailsProvider } from './place-details.provider'

// Provider links become `href`s in the web app; anything but http(s), such as a
// `javascript:` URL, is dropped so third-party data can never run script there.
export function toSafeLinkUrl(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : null
  } catch {
    return null
  }
}

const localizedTextSchema = z.object({ text: z.string() }).optional()
const openingHoursSchema = z
  .object({
    openNow: z.boolean().optional(),
    weekdayDescriptions: z.array(z.string()).optional(),
  })
  .optional()
const googlePlaceSchema = z.object({
  rating: z.number().optional(),
  userRatingCount: z.number().int().optional(),
  googleMapsUri: z.string().optional(),
  currentOpeningHours: openingHoursSchema,
  regularOpeningHours: openingHoursSchema,
  reviews: z
    .array(
      z.object({
        authorAttribution: z.object({
          displayName: z.string(),
          uri: z.string().optional(),
        }),
        rating: z.number().optional(),
        relativePublishTimeDescription: z.string().optional(),
        text: localizedTextSchema,
        originalText: localizedTextSchema,
        publishTime: z.string().optional(),
      }),
    )
    .optional(),
})

export const googlePlacesAdapter: PlaceDetailsProvider = {
  async get(placeId) {
    if (!env.GOOGLE_PLACES_API_KEY) return null

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
        {
          headers: {
            'x-goog-api-key': env.GOOGLE_PLACES_API_KEY,
            'x-goog-fieldmask':
              'rating,userRatingCount,currentOpeningHours,regularOpeningHours,googleMapsUri,reviews',
          },
          signal: AbortSignal.timeout(env.EXTERNAL_PROVIDER_TIMEOUT_MS),
        },
      )
      if (!response.ok) return null
      const parsed = googlePlaceSchema.safeParse(await response.json())
      if (!parsed.success) return null
      const place = parsed.data
      const hours = place.currentOpeningHours ?? place.regularOpeningHours
      return {
        rating: place.rating ?? null,
        userRatingCount: place.userRatingCount ?? null,
        openNow: hours?.openNow ?? null,
        weekdayDescriptions: hours?.weekdayDescriptions ?? [],
        googleMapsUri: toSafeLinkUrl(place.googleMapsUri),
        reviews: (place.reviews ?? []).map((review) => ({
          authorName: review.authorAttribution.displayName,
          authorUri: toSafeLinkUrl(review.authorAttribution.uri),
          rating: review.rating ?? null,
          relativePublishTimeDescription:
            review.relativePublishTimeDescription ?? null,
          text: review.text?.text ?? review.originalText?.text ?? null,
          publishTime: review.publishTime ?? null,
        })),
      }
    } catch {
      return null
    }
  },
}
