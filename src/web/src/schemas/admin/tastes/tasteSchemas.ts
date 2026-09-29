import type { components } from '@/api/openapiTypes'
import { tasteIcons } from '@/lib/tasteIcons'
import {
  createIconMasterDataFormSchema,
  getIconMasterDataChanges,
  toIconMasterDataFormValues,
  type IconMasterDataFormInput,
} from '@/schemas/shared/iconMasterDataSchemas'

export type Taste =
  components['schemas']['TasteListEnvelope']['data']['items'][number]
export type CreateTasteBody = components['schemas']['CreateTasteRequest']
export type UpdateTasteBody = components['schemas']['UpdateTasteRequest']
export type TasteFormInput = IconMasterDataFormInput

export const tasteFormSchema = createIconMasterDataFormSchema(tasteIcons)

export function toTasteFormValues(taste?: Taste): TasteFormInput {
  return toIconMasterDataFormValues(tasteIcons, taste)
}

export function getTasteChanges(
  taste: Taste,
  body: CreateTasteBody,
): UpdateTasteBody | null {
  return getIconMasterDataChanges(tasteIcons, taste, {
    ...body,
    icon: body.icon ?? null,
  })
}
