import type { Taste } from '@prisma/client'
import { z } from 'zod'

import { iconKeySchema } from '@/shared/iconKey'
import { localizationSchema, toLocalization } from '@/shared/localization'
import { parseWithSchema } from '@/shared/validation'

const tasteFieldsSchema = z
  .object({
    name: localizationSchema,
    icon: iconKeySchema.optional(),
    sortOrder: z.int32(),
  })
  .strict()

export const createTasteSchema = tasteFieldsSchema

export const updateTasteSchema = tasteFieldsSchema
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field is required.',
  })

export const tasteIdParamsSchema = z.object({ id: z.string().min(1) })

export const publicTasteSchema = z.object({
  id: z.string(),
  name: localizationSchema,
  icon: z.string().nullable(),
  sortOrder: z.number().int(),
})

export const adminTasteSchema = publicTasteSchema.extend({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const tasteListEnvelopeSchema = z.object({
  data: z.object({ items: z.array(publicTasteSchema) }),
})

export const tasteEnvelopeSchema = z.object({
  data: z.object({ taste: adminTasteSchema }),
})

export type CreateTasteInput = z.output<typeof createTasteSchema>
export type UpdateTasteInput = z.output<typeof updateTasteSchema>
export type TasteData = Partial<
  Pick<Taste, 'nameTh' | 'nameEn' | 'icon' | 'sortOrder'>
>
export type PublicTaste = z.infer<typeof publicTasteSchema>
export type AdminTaste = z.infer<typeof adminTasteSchema>

export function parseCreateTaste(input: unknown) {
  return parseWithSchema(createTasteSchema, input)
}

export function parseUpdateTaste(input: unknown) {
  return parseWithSchema(updateTasteSchema, input)
}

export function parseTasteId(params: unknown) {
  return parseWithSchema(tasteIdParamsSchema, params).id
}

export function toTasteCreateData(input: CreateTasteInput) {
  return {
    nameTh: input.name.th,
    nameEn: input.name.en,
    icon: input.icon ?? null,
    sortOrder: input.sortOrder,
  } satisfies Required<TasteData>
}

export function toTasteUpdateData(input: UpdateTasteInput): TasteData {
  const data: TasteData = {}

  if (input.name) {
    data.nameTh = input.name.th
    data.nameEn = input.name.en
  }
  if (input.icon !== undefined) data.icon = input.icon
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder

  return data
}

export function toPublicTaste(taste: Taste): PublicTaste {
  return {
    id: taste.id,
    name: toLocalization(taste.nameTh, taste.nameEn),
    icon: taste.icon,
    sortOrder: taste.sortOrder,
  }
}

export function toAdminTaste(taste: Taste): AdminTaste {
  return {
    ...toPublicTaste(taste),
    createdAt: taste.createdAt.toISOString(),
    updatedAt: taste.updatedAt.toISOString(),
  }
}
