import { prisma } from '@/lib/prisma'
import { env } from '@/config/env'
import { googlePlacesAdapter } from '@/modules/place-details/google-places.adapter'
import { recommendationCandidate } from '@/modules/recommendations/recommendations.dto'
import {
  buildGeminiRequest,
  geminiShortlistAdapter,
} from '@/modules/recommendations/gemini-shortlist.adapter'

const candidates = await prisma.menuItem.findMany({
  where: {
    deletedAt: null,
    imageUrl: { not: null },
    restaurant: { deletedAt: null },
  },
  include: recommendationCandidate.include,
  take: 6,
})

const aiSelection = await geminiShortlistAdapter.select({
  conditions: {
    budget: 'BETWEEN_50_100',
    tasteId: null,
    foodTypeId: null,
    zoneId: null,
  },
  candidates,
  count: Math.min(3, candidates.length),
})
let geminiDiagnostic: unknown = null
if (!aiSelection && env.GEMINI_API_KEY) {
  const diagnosticInput = {
    conditions: {
      budget: 'BETWEEN_50_100' as const,
      tasteId: null,
      foodTypeId: null,
      zoneId: null,
    },
    candidates,
    count: Math.min(3, candidates.length),
  }
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY,
      },
      body: JSON.stringify(buildGeminiRequest(diagnosticInput)),
    },
  )
  const body = (await response.json()) as {
    error?: { message?: string }
    candidates?: Array<{
      finishReason?: string
      content?: { parts?: Array<{ text?: string }> }
    }>
  }
  geminiDiagnostic = {
    status: response.status,
    error: body.error?.message ?? null,
    finishReason: body.candidates?.[0]?.finishReason ?? null,
    text: body.candidates?.[0]?.content?.parts?.[0]?.text ?? null,
  }
}

const mappedRestaurant = await prisma.restaurant.findFirst({
  where: { deletedAt: null, googlePlaceId: { not: null } },
  select: { googlePlaceId: true },
})
const placeDetails = mappedRestaurant?.googlePlaceId
  ? await googlePlacesAdapter.get(mappedRestaurant.googlePlaceId)
  : null

process.stdout.write(
  `${JSON.stringify({
    gemini: {
      candidateCount: candidates.length,
      selectionCount: aiSelection?.length ?? 0,
      validCandidateIds:
        aiSelection?.every((selection) =>
          candidates.some((candidate) => candidate.id === selection.menuItemId),
        ) ?? false,
      diagnostic: geminiDiagnostic,
    },
    googlePlaces: {
      mappedRestaurantFound: Boolean(mappedRestaurant),
      detailsReturned: Boolean(placeDetails),
      hasRating: placeDetails?.rating != null,
      reviewCount: placeDetails?.reviews.length ?? 0,
    },
  })}\n`,
)

await prisma.$disconnect()
