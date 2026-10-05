import { z } from 'zod'

import type { components } from '@/api/openapiTypes'
import {
  checkDescriptionPair,
  isSameLocalization,
  localizedNameFields,
  optionalDescriptionFields,
  sortOrderField,
  toOptionalDescription,
} from '@/schemas/shared/masterDataFields'

export type Zone =
  components['schemas']['ZoneListEnvelope']['data']['items'][number]
export type CreateZoneBody = components['schemas']['CreateZoneRequest']
export type UpdateZoneBody = components['schemas']['UpdateZoneRequest']

export const zoneFormSchema = z
  .object({
    ...localizedNameFields,
    ...optionalDescriptionFields,
    sortOrder: sortOrderField,
  })
  .superRefine(checkDescriptionPair)
  .transform((values): CreateZoneBody => ({
    name: { th: values.nameTh, en: values.nameEn },
    description: toOptionalDescription(
      values.descriptionTh,
      values.descriptionEn,
    ),
    sortOrder: values.sortOrder,
  }))

export type ZoneFormInput = z.input<typeof zoneFormSchema>

export function toZoneFormValues(zone?: Zone): ZoneFormInput {
  return {
    nameTh: zone?.name.th ?? '',
    nameEn: zone?.name.en ?? '',
    descriptionTh: zone?.description?.th ?? '',
    descriptionEn: zone?.description?.en ?? '',
    sortOrder: zone ? String(zone.sortOrder) : '',
  }
}

// PATCH only what the admin changed; null means there is nothing to send.
export function getZoneChanges(
  zone: Zone,
  body: CreateZoneBody,
): UpdateZoneBody | null {
  const changes: UpdateZoneBody = {}
  const description = body.description ?? null

  if (!isSameLocalization(body.name, zone.name)) changes.name = body.name
  if (!isSameLocalization(description, zone.description)) {
    changes.description = description
  }
  if (body.sortOrder !== zone.sortOrder) changes.sortOrder = body.sortOrder

  return Object.keys(changes).length > 0 ? changes : null
}
