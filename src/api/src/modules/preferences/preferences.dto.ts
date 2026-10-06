import type { BudgetRange } from '@prisma/client'
import { z } from 'zod'

import { budgetRangeSchema } from '@/modules/recommendations/recommendations.dto'
import { parseWithSchema } from '@/shared/validation'

// A saved "any" choice (อะไรก็ได้ / ที่ไหนก็ได้). Record IDs are never this value.
export const ANY_CHOICE = 'ANY'

// A record ID, a saved "any", or `null` for "not set". A plain string (rather than a union
// with the literal) keeps the generated client type `string | null`.
const masterChoice = z
  .string()
  .trim()
  .min(1)
  .nullable()
  .describe(
    `A record ID, "${ANY_CHOICE}" for a saved "any" choice, or null when not set.`,
  )

// The only four saved defaults. A full replacement: every field is required, and anything
// else (a user ID, sensitive or session data) is a 400. Budget has no "any", because the
// meal flow always asks for a budget range.
export const preferenceSchema = z
  .object({
    budget: budgetRangeSchema.nullable(),
    zoneId: masterChoice,
    foodTypeId: masterChoice,
    tasteId: masterChoice,
  })
  .strict()
  .refine((preference) => Object.values(preference).some((value) => value), {
    message:
      'At least one field must be set. Use DELETE to clear the preference.',
  })

export const preferenceEnvelopeSchema = z.object({
  data: z.object({ preference: preferenceSchema.nullable() }),
})

export type Preference = z.output<typeof preferenceSchema>

export const masterIdFields = ['zoneId', 'foodTypeId', 'tasteId'] as const
export type MasterIdField = (typeof masterIdFields)[number]

// How a preference is stored: the ID columns keep their foreign keys, and "any" is a flag.
export type PreferenceRow = {
  budget: BudgetRange | null
  zoneId: string | null
  foodTypeId: string | null
  tasteId: string | null
  zoneAny: boolean
  foodTypeAny: boolean
  tasteAny: boolean
}

export function parsePreference(input: unknown) {
  return parseWithSchema(preferenceSchema, input)
}

// The record ID a field names, if any; "any" and "not set" name none.
export function recordId(value: string | null) {
  return value === ANY_CHOICE ? null : value
}

export function toPreferenceRow(preference: Preference): PreferenceRow {
  return {
    budget: preference.budget,
    zoneId: recordId(preference.zoneId),
    foodTypeId: recordId(preference.foodTypeId),
    tasteId: recordId(preference.tasteId),
    zoneAny: preference.zoneId === ANY_CHOICE,
    foodTypeAny: preference.foodTypeId === ANY_CHOICE,
    tasteAny: preference.tasteId === ANY_CHOICE,
  }
}

export function toPreference(row: PreferenceRow): Preference {
  return {
    budget: row.budget,
    zoneId: row.zoneAny ? ANY_CHOICE : row.zoneId,
    foodTypeId: row.foodTypeAny ? ANY_CHOICE : row.foodTypeId,
    tasteId: row.tasteAny ? ANY_CHOICE : row.tasteId,
  }
}
