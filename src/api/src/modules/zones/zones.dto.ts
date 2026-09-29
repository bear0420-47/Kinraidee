import type { Zone } from '@prisma/client'
import { z } from 'zod'

import {
  localizationSchema,
  toLocalization,
  toOptionalLocalization,
} from '@/shared/localization'
import { parseWithSchema } from '@/shared/validation'

const zoneFieldsSchema = z
  .object({
    name: localizationSchema,
    description: localizationSchema.nullable().optional(),
    sortOrder: z.int32(),
  })
  .strict()

export const createZoneSchema = zoneFieldsSchema

export const updateZoneSchema = zoneFieldsSchema
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field is required.',
  })

export const zoneIdParamsSchema = z.object({ id: z.string().min(1) })

export const publicZoneSchema = z.object({
  id: z.string(),
  name: localizationSchema,
  description: localizationSchema.nullable(),
  sortOrder: z.number().int(),
})

export const adminZoneSchema = publicZoneSchema.extend({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const zoneListEnvelopeSchema = z.object({
  data: z.object({ items: z.array(publicZoneSchema) }),
})

export const zoneEnvelopeSchema = z.object({
  data: z.object({ zone: adminZoneSchema }),
})

export type CreateZoneInput = z.output<typeof createZoneSchema>
export type UpdateZoneInput = z.output<typeof updateZoneSchema>
export type ZoneData = Partial<
  Pick<
    Zone,
    'nameTh' | 'nameEn' | 'descriptionTh' | 'descriptionEn' | 'sortOrder'
  >
>
export type PublicZone = z.infer<typeof publicZoneSchema>
export type AdminZone = z.infer<typeof adminZoneSchema>

export function parseCreateZone(input: unknown) {
  return parseWithSchema(createZoneSchema, input)
}

export function parseUpdateZone(input: unknown) {
  return parseWithSchema(updateZoneSchema, input)
}

export function parseZoneId(params: unknown) {
  return parseWithSchema(zoneIdParamsSchema, params).id
}

export function toZoneCreateData(input: CreateZoneInput) {
  return {
    nameTh: input.name.th,
    nameEn: input.name.en,
    descriptionTh: input.description?.th ?? null,
    descriptionEn: input.description?.en ?? null,
    sortOrder: input.sortOrder,
  } satisfies Required<ZoneData>
}

export function toZoneUpdateData(input: UpdateZoneInput): ZoneData {
  const data: ZoneData = {}

  if (input.name) {
    data.nameTh = input.name.th
    data.nameEn = input.name.en
  }
  if (input.description !== undefined) {
    data.descriptionTh = input.description?.th ?? null
    data.descriptionEn = input.description?.en ?? null
  }
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder

  return data
}

export function toPublicZone(zone: Zone): PublicZone {
  return {
    id: zone.id,
    name: toLocalization(zone.nameTh, zone.nameEn),
    description: toOptionalLocalization(zone.descriptionTh, zone.descriptionEn),
    sortOrder: zone.sortOrder,
  }
}

export function toAdminZone(zone: Zone): AdminZone {
  return {
    ...toPublicZone(zone),
    createdAt: zone.createdAt.toISOString(),
    updatedAt: zone.updatedAt.toISOString(),
  }
}
