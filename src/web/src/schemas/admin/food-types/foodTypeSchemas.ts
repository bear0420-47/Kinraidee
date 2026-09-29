import { z } from 'zod'

import type { components } from '@/api/openapiTypes'
import { foodTypeIcons } from '@/lib/foodTypeIcons'
import {
  isSameLocalization,
  localizedNameFields,
  sortOrderField,
} from '@/schemas/shared/masterDataFields'

export type FoodType =
  components['schemas']['FoodTypeListEnvelope']['data']['items'][number]
export type CreateFoodTypeBody = components['schemas']['CreateFoodTypeRequest']
export type UpdateFoodTypeBody = components['schemas']['UpdateFoodTypeRequest']

// The select offers only registry keys; the empty choice means "use the fallback icon".
export const foodTypeFormSchema = z
  .object({
    ...localizedNameFields,
    icon: z.enum(['', ...foodTypeIcons.keys], 'กรุณาเลือกไอคอนจากรายการ'),
    sortOrder: sortOrderField,
  })
  .transform((values): CreateFoodTypeBody => ({
    name: { th: values.nameTh, en: values.nameEn },
    icon: values.icon || null,
    sortOrder: values.sortOrder,
  }))

export type FoodTypeFormInput = z.input<typeof foodTypeFormSchema>

// A stored key outside the registry is shown as the fallback choice.
function toRegistryIcon(icon: string | null) {
  return foodTypeIcons.isKey(icon) ? icon : null
}

export function toFoodTypeFormValues(foodType?: FoodType): FoodTypeFormInput {
  return {
    nameTh: foodType?.name.th ?? '',
    nameEn: foodType?.name.en ?? '',
    icon: toRegistryIcon(foodType?.icon ?? null) ?? '',
    sortOrder: foodType ? String(foodType.sortOrder) : '',
  }
}

// PATCH only what the admin changed; an untouched unknown icon key is left as stored.
export function getFoodTypeChanges(
  foodType: FoodType,
  body: CreateFoodTypeBody,
): UpdateFoodTypeBody | null {
  const changes: UpdateFoodTypeBody = {}
  const icon = body.icon ?? null

  if (!isSameLocalization(body.name, foodType.name)) changes.name = body.name
  if (icon !== toRegistryIcon(foodType.icon)) changes.icon = icon
  if (body.sortOrder !== foodType.sortOrder) changes.sortOrder = body.sortOrder

  return Object.keys(changes).length > 0 ? changes : null
}
