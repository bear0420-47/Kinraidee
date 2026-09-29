import type { components } from '@/api/openapiTypes'
import { foodTypeIcons } from '@/lib/foodTypeIcons'
import {
  createIconMasterDataFormSchema,
  getIconMasterDataChanges,
  toIconMasterDataFormValues,
  type IconMasterDataFormInput,
} from '@/schemas/shared/iconMasterDataSchemas'

export type FoodType =
  components['schemas']['FoodTypeListEnvelope']['data']['items'][number]
export type CreateFoodTypeBody = components['schemas']['CreateFoodTypeRequest']
export type UpdateFoodTypeBody = components['schemas']['UpdateFoodTypeRequest']
export type FoodTypeFormInput = IconMasterDataFormInput

export const foodTypeFormSchema = createIconMasterDataFormSchema(foodTypeIcons)

export function toFoodTypeFormValues(foodType?: FoodType): FoodTypeFormInput {
  return toIconMasterDataFormValues(foodTypeIcons, foodType)
}

export function getFoodTypeChanges(
  foodType: FoodType,
  body: CreateFoodTypeBody,
): UpdateFoodTypeBody | null {
  return getIconMasterDataChanges(foodTypeIcons, foodType, {
    ...body,
    icon: body.icon ?? null,
  })
}
