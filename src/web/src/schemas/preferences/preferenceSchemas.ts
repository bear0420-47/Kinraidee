import { z } from 'zod'

import type { components } from '@/api/openapiTypes'
import {
  budgetValues,
  type ConditionDraft,
} from '@/schemas/meal/recommendationSchemas'

// The four saved defaults. Each is `null` when not set; taste, food type, and zone may also
// be `ANY_CHOICE`, a saved "any".
export type Preference = components['schemas']['Preference']

// Each select's first option: no saved default for that field.
export const NOT_SET = ''
export const NOT_SET_LABEL = 'ไม่ตั้งค่า'
// The API's value for a saved "any" (อะไรก็ได้ / ที่ไหนก็ได้).
export const ANY_CHOICE = 'ANY'
export const EMPTY_PREFERENCE_MESSAGE =
  'เลือกอย่างน้อยหนึ่งค่า หรือกดล้างค่าเริ่มต้น'

function fromSelect<Value extends string>(value: Value) {
  return value === NOT_SET ? null : (value as Exclude<Value, typeof NOT_SET>)
}

const masterChoice = z.string().transform(fromSelect)

// Always produces the complete four-field replacement body the API expects.
export const preferenceFormSchema = z
  .object({
    budget: z.enum([NOT_SET, ...budgetValues]).transform(fromSelect),
    tasteId: masterChoice,
    foodTypeId: masterChoice,
    zoneId: masterChoice,
  })
  // On the first field, so the message is linked to it and receives focus.
  .refine((values) => Object.values(values).some((value) => value !== null), {
    message: EMPTY_PREFERENCE_MESSAGE,
    path: ['budget'],
  })

export type PreferenceFormInput = z.input<typeof preferenceFormSchema>

export function toPreferenceFormValues(
  preference: Preference | null,
): PreferenceFormInput {
  return {
    budget: preference?.budget ?? NOT_SET,
    tasteId: preference?.tasteId ?? NOT_SET,
    foodTypeId: preference?.foodTypeId ?? NOT_SET,
    zoneId: preference?.zoneId ?? NOT_SET,
  }
}

// A saved choice as a meal-flow answer: "any" is the flow's `null`, a record is its ID, and
// "not set" is left out so that step stays unanswered.
function toAnswer(value: string | null) {
  return value === ANY_CHOICE ? null : value
}

export function toConditionDefaults(
  preference: Preference | null | undefined,
): ConditionDraft {
  const defaults: ConditionDraft = {}
  if (!preference) return defaults
  if (preference.budget) defaults.budget = preference.budget
  if (preference.tasteId) defaults.tasteId = toAnswer(preference.tasteId)
  if (preference.foodTypeId) {
    defaults.foodTypeId = toAnswer(preference.foodTypeId)
  }
  if (preference.zoneId) defaults.zoneId = toAnswer(preference.zoneId)
  return defaults
}
