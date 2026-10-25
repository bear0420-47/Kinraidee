import { z } from 'zod'

import { env } from '@/config/env'
import type {
  AiShortlistInput,
  AiShortlistSelector,
} from './ai-shortlist-selector'

const selectionSchema = z.object({
  selections: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        reasonTh: z.string().trim().min(1).max(120),
      }),
    )
    .min(1)
    .max(3),
})

const geminiEnvelopeSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z.object({
          parts: z.array(z.object({ text: z.string() })).min(1),
        }),
      }),
    )
    .min(1),
})

function compactInput({ conditions, candidates, count }: AiShortlistInput) {
  return {
    task: `Select up to ${count} menu items. Return only JSON matching the schema. Write concise Thai reasons based only on the supplied facts. Prefer different restaurants.`,
    conditions,
    candidates: candidates.map((candidate) => ({
      menuItemId: candidate.id,
      menuName: candidate.nameTh,
      restaurantId: candidate.restaurantId,
      restaurantName: candidate.restaurant.nameTh,
      price: candidate.price,
      foodType: candidate.foodType.nameTh,
      tastes: candidate.tastes.map(({ taste }) => taste.nameTh),
      zone: candidate.restaurant.zone.nameTh,
    })),
  }
}

export function buildGeminiRequest(input: AiShortlistInput) {
  return {
    contents: [
      {
        role: 'user',
        parts: [{ text: JSON.stringify(compactInput(input)) }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 400,
      temperature: 0.2,
      responseSchema: {
        type: 'OBJECT',
        required: ['selections'],
        properties: {
          selections: {
            type: 'ARRAY',
            minItems: 1,
            maxItems: input.count,
            items: {
              type: 'OBJECT',
              required: ['menuItemId', 'reasonTh'],
              properties: {
                menuItemId: { type: 'STRING' },
                reasonTh: { type: 'STRING' },
              },
            },
          },
        },
      },
    },
  }
}

export const geminiShortlistAdapter: AiShortlistSelector = {
  async select(input) {
    if (!env.GEMINI_API_KEY) return null

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY,
          },
          signal: AbortSignal.timeout(env.EXTERNAL_PROVIDER_TIMEOUT_MS),
          body: JSON.stringify(buildGeminiRequest(input)),
        },
      )
      if (!response.ok) return null

      const envelope = geminiEnvelopeSchema.safeParse(await response.json())
      if (!envelope.success) return null
      const text = envelope.data.candidates[0]?.content.parts[0]?.text
      if (!text) return null
      const parsed = selectionSchema.safeParse(JSON.parse(text))
      return parsed.success ? parsed.data.selections : null
    } catch {
      return null
    }
  },
}
