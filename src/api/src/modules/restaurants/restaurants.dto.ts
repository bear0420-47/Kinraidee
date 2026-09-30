import { Prisma, type Restaurant } from '@prisma/client'
import { z } from 'zod'

import {
  localizationSchema,
  toLocalization,
  toOptionalLocalization,
} from '@/shared/localization'
import {
  emptyTrimmedStringToNull,
  optionalTrimmedStringSchema,
  parseWithSchema,
} from '@/shared/validation'

const nullablePhoneSchema = z.preprocess(
  emptyTrimmedStringToNull,
  z.string().nullable(),
)
const nullableImageUrlSchema = z.preprocess(
  emptyTrimmedStringToNull,
  z
    .string()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), {
      message: 'Must use HTTP or HTTPS.',
    })
    .nullable(),
)

const restaurantFieldsSchema = z
  .object({
    zoneId: z.string().trim().min(1),
    name: localizationSchema,
    description: localizationSchema.nullable().optional(),
    phone: nullablePhoneSchema.optional(),
    imageUrl: nullableImageUrlSchema.optional(),
  })
  .strict()

export const createRestaurantSchema = restaurantFieldsSchema

export const updateRestaurantSchema = restaurantFieldsSchema
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field is required.',
  })

export const restaurantIdParamsSchema = z.object({
  id: z.string().trim().min(1),
})

export const restaurantListQuerySchema = z
  .object({
    includeDeleted: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    zoneId: z.string().trim().min(1).optional(),
    search: optionalTrimmedStringSchema,
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict()

export const restaurantZoneSchema = z.object({
  id: z.string(),
  name: localizationSchema,
})

export const adminRestaurantSchema = z.object({
  id: z.string(),
  zoneId: z.string(),
  zone: restaurantZoneSchema,
  name: localizationSchema,
  description: localizationSchema.nullable(),
  phone: z.string().nullable(),
  imageKey: z.string().nullable(),
  imageUrl: z.string().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const restaurantEnvelopeSchema = z.object({
  data: z.object({ restaurant: adminRestaurantSchema }),
})

export const restaurantListEnvelopeSchema = z.object({
  data: z.object({ items: z.array(adminRestaurantSchema) }),
  meta: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive().max(100),
    total: z.number().int().nonnegative(),
  }),
})

export type RestaurantWithZone = Prisma.RestaurantGetPayload<{
  include: { zone: true }
}>
export type CreateRestaurantInput = z.output<typeof createRestaurantSchema>
export type UpdateRestaurantInput = z.output<typeof updateRestaurantSchema>
export type RestaurantListQuery = z.output<typeof restaurantListQuerySchema>
export type RestaurantData = Partial<
  Pick<
    Restaurant,
    | 'zoneId'
    | 'nameTh'
    | 'nameEn'
    | 'descriptionTh'
    | 'descriptionEn'
    | 'phone'
    | 'imageKey'
    | 'imageUrl'
  >
>
export type AdminRestaurant = z.infer<typeof adminRestaurantSchema>

export function parseCreateRestaurant(input: unknown) {
  return parseWithSchema(createRestaurantSchema, input)
}

export function parseUpdateRestaurant(input: unknown) {
  return parseWithSchema(updateRestaurantSchema, input)
}

export function parseRestaurantId(params: unknown) {
  return parseWithSchema(restaurantIdParamsSchema, params).id
}

export function parseRestaurantListQuery(input: unknown) {
  return parseWithSchema(restaurantListQuerySchema, input)
}

export function toRestaurantCreateData(
  input: CreateRestaurantInput,
): Required<RestaurantData> {
  return {
    zoneId: input.zoneId,
    nameTh: input.name.th,
    nameEn: input.name.en,
    descriptionTh: input.description?.th ?? null,
    descriptionEn: input.description?.en ?? null,
    phone: input.phone ?? null,
    imageKey: null,
    imageUrl: input.imageUrl ?? null,
  }
}

export function toRestaurantUpdateData(
  input: UpdateRestaurantInput,
): RestaurantData {
  const data: RestaurantData = {}

  if (input.zoneId !== undefined) data.zoneId = input.zoneId
  if (input.name) {
    data.nameTh = input.name.th
    data.nameEn = input.name.en
  }
  if (input.description !== undefined) {
    data.descriptionTh = input.description?.th ?? null
    data.descriptionEn = input.description?.en ?? null
  }
  if (input.phone !== undefined) data.phone = input.phone
  if (input.imageUrl !== undefined) {
    data.imageKey = null
    data.imageUrl = input.imageUrl
  }

  return data
}

export function toAdminRestaurant(
  restaurant: RestaurantWithZone,
): AdminRestaurant {
  return {
    id: restaurant.id,
    zoneId: restaurant.zoneId,
    zone: {
      id: restaurant.zone.id,
      name: toLocalization(restaurant.zone.nameTh, restaurant.zone.nameEn),
    },
    name: toLocalization(restaurant.nameTh, restaurant.nameEn),
    description: toOptionalLocalization(
      restaurant.descriptionTh,
      restaurant.descriptionEn,
    ),
    phone: restaurant.phone,
    imageKey: restaurant.imageKey,
    imageUrl: restaurant.imageUrl,
    deletedAt: restaurant.deletedAt?.toISOString() ?? null,
    createdAt: restaurant.createdAt.toISOString(),
    updatedAt: restaurant.updatedAt.toISOString(),
  }
}

export function toRestaurantAuditSnapshot(restaurant: RestaurantWithZone) {
  const { phone: _phone, ...snapshot } = toAdminRestaurant(restaurant)
  return snapshot satisfies Prisma.InputJsonObject
}
