import type { FoodType } from '@prisma/client'
import { z } from 'zod'

import { iconKeySchema } from '@/shared/iconKey'
import { localizationSchema, toLocalization } from '@/shared/localization'
import { parseWithSchema } from '@/shared/validation'

const foodTypeFieldsSchema = z
  .object({
    name: localizationSchema,
    icon: iconKeySchema.optional(),
    sortOrder: z.int32(),
  })
  .strict()

export const createFoodTypeSchema = foodTypeFieldsSchema

export const updateFoodTypeSchema = foodTypeFieldsSchema
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field is required.',
  })

export const foodTypeIdParamsSchema = z.object({ id: z.string().min(1) })

export const publicFoodTypeSchema = z.object({
  id: z.string(),
  name: localizationSchema,
  icon: z.string().nullable(),
  sortOrder: z.number().int(),
})

export const adminFoodTypeSchema = publicFoodTypeSchema.extend({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const foodTypeListEnvelopeSchema = z.object({
  data: z.object({ items: z.array(publicFoodTypeSchema) }),
})

export const foodTypeEnvelopeSchema = z.object({
  data: z.object({ foodType: adminFoodTypeSchema }),
})

export type CreateFoodTypeInput = z.output<typeof createFoodTypeSchema>
export type UpdateFoodTypeInput = z.output<typeof updateFoodTypeSchema>
export type FoodTypeData = Partial<
  Pick<FoodType, 'nameTh' | 'nameEn' | 'icon' | 'sortOrder'>
>
export type PublicFoodType = z.infer<typeof publicFoodTypeSchema>
export type AdminFoodType = z.infer<typeof adminFoodTypeSchema>

export function parseCreateFoodType(input: unknown) {
  return parseWithSchema(createFoodTypeSchema, input)
}

export function parseUpdateFoodType(input: unknown) {
  return parseWithSchema(updateFoodTypeSchema, input)
}

export function parseFoodTypeId(params: unknown) {
  return parseWithSchema(foodTypeIdParamsSchema, params).id
}

export function toFoodTypeCreateData(input: CreateFoodTypeInput) {
  return {
    nameTh: input.name.th,
    nameEn: input.name.en,
    icon: input.icon ?? null,
    sortOrder: input.sortOrder,
  } satisfies Required<FoodTypeData>
}

export function toFoodTypeUpdateData(input: UpdateFoodTypeInput): FoodTypeData {
  const data: FoodTypeData = {}

  if (input.name) {
    data.nameTh = input.name.th
    data.nameEn = input.name.en
  }
  if (input.icon !== undefined) data.icon = input.icon
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder

  return data
}

export function toPublicFoodType(foodType: FoodType): PublicFoodType {
  return {
    id: foodType.id,
    name: toLocalization(foodType.nameTh, foodType.nameEn),
    icon: foodType.icon,
    sortOrder: foodType.sortOrder,
  }
}

export function toAdminFoodType(foodType: FoodType): AdminFoodType {
  return {
    ...toPublicFoodType(foodType),
    createdAt: foodType.createdAt.toISOString(),
    updatedAt: foodType.updatedAt.toISOString(),
  }
}
