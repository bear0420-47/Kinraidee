import { z } from 'zod'

import type { components } from '@/api/openapiTypes'

type Localization = components['schemas']['Localization']

export type Zone =
  components['schemas']['ZoneListEnvelope']['data']['items'][number]
export type CreateZoneBody = components['schemas']['CreateZoneRequest']
export type UpdateZoneBody = components['schemas']['UpdateZoneRequest']

const DESCRIPTION_PAIR_MESSAGE =
  'กรุณากรอกคำอธิบายทั้งภาษาไทยและภาษาอังกฤษ หรือเว้นว่างทั้งสองช่อง'

// Mirrors the API rules: both names required, description is all-or-nothing, int32 sortOrder.
export const zoneFormSchema = z
  .object({
    nameTh: z.string().trim().min(1, 'กรุณากรอกชื่อภาษาไทย'),
    nameEn: z.string().trim().min(1, 'กรุณากรอกชื่อภาษาอังกฤษ'),
    descriptionTh: z.string().trim(),
    descriptionEn: z.string().trim(),
    sortOrder: z
      .string()
      .trim()
      .min(1, 'กรุณากรอกลำดับการแสดงผล')
      .regex(/^-?\d+$/, 'ลำดับการแสดงผลต้องเป็นจำนวนเต็ม')
      .transform(Number)
      .pipe(z.int32('ลำดับการแสดงผลต้องอยู่ในช่วงที่ระบบรองรับ')),
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

function isSameLocalization(a: Localization | null, b: Localization | null) {
  return a?.th === b?.th && a?.en === b?.en
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
