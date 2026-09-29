import { z } from 'zod'

import type { components } from '@/api/openapiTypes'
import {
  isSameLocalization,
  localizedNameFields,
  sortOrderField,
} from '@/schemas/shared/masterDataFields'

export type Zone =
  components['schemas']['ZoneListEnvelope']['data']['items'][number]
export type CreateZoneBody = components['schemas']['CreateZoneRequest']
export type UpdateZoneBody = components['schemas']['UpdateZoneRequest']

const DESCRIPTION_PAIR_MESSAGE =
  'กรุณากรอกคำอธิบายทั้งภาษาไทยและภาษาอังกฤษ หรือเว้นว่างทั้งสองช่อง'

// Description is all-or-nothing, matching the API's localized description.
export const zoneFormSchema = z
  .object({
    ...localizedNameFields,
    descriptionTh: z.string().trim(),
    descriptionEn: z.string().trim(),
    sortOrder: sortOrderField,
  })
  .superRefine(({ descriptionTh, descriptionEn }, context) => {
    if (Boolean(descriptionTh) === Boolean(descriptionEn)) return
    context.addIssue({
      code: 'custom',
      path: [descriptionTh ? 'descriptionEn' : 'descriptionTh'],
      message: DESCRIPTION_PAIR_MESSAGE,
    })
  })
  .transform((values): CreateZoneBody => ({
    name: { th: values.nameTh, en: values.nameEn },
    description: values.descriptionTh
      ? { th: values.descriptionTh, en: values.descriptionEn }
      : null,
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
