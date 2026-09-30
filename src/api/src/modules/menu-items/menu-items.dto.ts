import { Prisma, type MenuItem } from '@prisma/client'
import { z } from 'zod'

import { uploadFileNameSchema } from '@/modules/uploads/uploads.dto'
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

const externalImageUrlSchema = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), {
    message: 'External images must use HTTP or HTTPS.',
  })

const imageUrlSchema = z.preprocess(
  emptyTrimmedStringToNull,
  z
    .union([externalImageUrlSchema, z.string().startsWith('/uploads/')])
    .nullable(),
)

const imageKeySchema = z.preprocess(
  emptyTrimmedStringToNull,
  uploadFileNameSchema.nullable(),
)

const menuItemFieldsSchema = z
  .object({
    restaurantId: z.string().trim().min(1),
    foodTypeId: z.string().trim().min(1),
    tasteIds: z
      .array(z.string().trim().min(1))
      .min(1)
      .transform((ids) => [...new Set(ids)]),
    name: localizationSchema,
    description: localizationSchema.nullable().optional(),
    price: z.number().int().positive(),
    imageKey: imageKeySchema.optional(),
    imageUrl: imageUrlSchema.optional(),
  })
  .strict()

function validateImageReference(
  input: {
    imageKey?: string | null | undefined
    imageUrl?: string | null | undefined
  },
  context: z.RefinementCtx,
) {
  const { imageKey, imageUrl } = input

  if (imageKey !== undefined && imageUrl === undefined) {
    context.addIssue({
      code: 'custom',
      path: ['imageUrl'],
      message: 'imageUrl is required when imageKey is supplied.',
    })
    return
  }

  if (imageKey) {
    if (imageUrl !== `/uploads/${imageKey}`) {
      context.addIssue({
        code: 'custom',
        path: ['imageUrl'],
        message: 'Local imageUrl must match imageKey.',
      })
    }
    return
  }

  if (imageUrl?.startsWith('/uploads/')) {
    context.addIssue({
      code: 'custom',
      path: ['imageKey'],
      message: 'Local uploads require their generated imageKey.',
    })
  }
}

export const createMenuItemSchema = menuItemFieldsSchema.superRefine(
  validateImageReference,
)

export const updateMenuItemSchema = menuItemFieldsSchema
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field is required.',
  })
  .superRefine(validateImageReference)

export const menuItemIdParamsSchema = z.object({
  id: z.string().trim().min(1),
})

export const menuItemListQuerySchema = z
  .object({
    includeDeleted: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    restaurantId: z.string().trim().min(1).optional(),
    foodTypeId: z.string().trim().min(1).optional(),
    tasteId: z.string().trim().min(1).optional(),
    search: optionalTrimmedStringSchema,
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict()

export const bulkMenuItemSchema = z
  .object({
    ids: z
      .array(z.string().trim().min(1))
      .min(1)
      .max(50)
      .transform((ids) => [...new Set(ids)]),
  })
  .strict()

const relatedRestaurantSchema = z.object({
  id: z.string(),
  name: localizationSchema,
  deletedAt: z.iso.datetime().nullable(),
})

const relatedFoodTypeSchema = z.object({
  id: z.string(),
  name: localizationSchema,
  icon: z.string().nullable(),
})

const relatedTasteSchema = z.object({
  id: z.string(),
  name: localizationSchema,
  icon: z.string().nullable(),
})

export const adminMenuItemSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  foodTypeId: z.string(),
  restaurant: relatedRestaurantSchema,
  foodType: relatedFoodTypeSchema,
  tastes: z.array(relatedTasteSchema),
  name: localizationSchema,
  description: localizationSchema.nullable(),
  price: z.number().int().positive(),
  imageKey: z.string().nullable(),
  imageUrl: z.string().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const menuItemEnvelopeSchema = z.object({
  data: z.object({ menuItem: adminMenuItemSchema }),
})

export const menuItemListEnvelopeSchema = z.object({
  data: z.object({ items: z.array(adminMenuItemSchema) }),
  meta: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive().max(100),
    total: z.number().int().nonnegative(),
  }),
})

export const bulkMenuItemEnvelopeSchema = z.object({
  data: z.object({ updatedCount: z.number().int().nonnegative() }),
})

export const menuItemWithRelations =
  Prisma.validator<Prisma.MenuItemDefaultArgs>()({
    include: {
      restaurant: true,
      foodType: true,
      tastes: { include: { taste: true } },
    },
  })

export type MenuItemWithRelations = Prisma.MenuItemGetPayload<
  typeof menuItemWithRelations
>
export type CreateMenuItemInput = z.output<typeof createMenuItemSchema>
export type UpdateMenuItemInput = z.output<typeof updateMenuItemSchema>
export type MenuItemListQuery = z.output<typeof menuItemListQuerySchema>
export type MenuItemData = Partial<
  Pick<
    MenuItem,
    | 'restaurantId'
    | 'foodTypeId'
    | 'nameTh'
    | 'nameEn'
    | 'descriptionTh'
    | 'descriptionEn'
    | 'price'
    | 'imageKey'
    | 'imageUrl'
  >
>
export type AdminMenuItem = z.infer<typeof adminMenuItemSchema>

export function parseCreateMenuItem(input: unknown) {
  return parseWithSchema(createMenuItemSchema, input)
}

export function parseUpdateMenuItem(input: unknown) {
  return parseWithSchema(updateMenuItemSchema, input)
}

export function parseMenuItemId(params: unknown) {
  return parseWithSchema(menuItemIdParamsSchema, params).id
}

export function parseMenuItemListQuery(input: unknown) {
  return parseWithSchema(menuItemListQuerySchema, input)
}

export function parseBulkMenuItems(input: unknown) {
  return parseWithSchema(bulkMenuItemSchema, input).ids
}

export function toMenuItemCreateData(input: CreateMenuItemInput) {
  return {
    data: {
      restaurantId: input.restaurantId,
      foodTypeId: input.foodTypeId,
      nameTh: input.name.th,
      nameEn: input.name.en,
      descriptionTh: input.description?.th ?? null,
      descriptionEn: input.description?.en ?? null,
      price: input.price,
      imageKey: input.imageKey ?? null,
      imageUrl: input.imageUrl ?? null,
    } satisfies Required<MenuItemData>,
    tasteIds: input.tasteIds,
  }
}

export function toMenuItemUpdateData(input: UpdateMenuItemInput) {
  const data: MenuItemData = {}

  if (input.restaurantId !== undefined) data.restaurantId = input.restaurantId
  if (input.foodTypeId !== undefined) data.foodTypeId = input.foodTypeId
  if (input.name) {
    data.nameTh = input.name.th
    data.nameEn = input.name.en
  }
  if (input.description !== undefined) {
    data.descriptionTh = input.description?.th ?? null
    data.descriptionEn = input.description?.en ?? null
  }
  if (input.price !== undefined) data.price = input.price
  if (input.imageUrl !== undefined) {
    data.imageUrl = input.imageUrl
    data.imageKey = input.imageUrl?.startsWith('/uploads/')
      ? (input.imageKey ?? null)
      : null
  }

  return { data, tasteIds: input.tasteIds }
}

export function toAdminMenuItem(
  menuItem: MenuItemWithRelations,
): AdminMenuItem {
  const tastes = menuItem.tastes
    .map(({ taste }) => taste)
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.nameTh.localeCompare(right.nameTh, 'th') ||
        left.id.localeCompare(right.id),
    )
    .map((taste) => ({
      id: taste.id,
      name: toLocalization(taste.nameTh, taste.nameEn),
      icon: taste.icon,
    }))

  return {
    id: menuItem.id,
    restaurantId: menuItem.restaurantId,
    foodTypeId: menuItem.foodTypeId,
    restaurant: {
      id: menuItem.restaurant.id,
      name: toLocalization(
        menuItem.restaurant.nameTh,
        menuItem.restaurant.nameEn,
      ),
      deletedAt: menuItem.restaurant.deletedAt?.toISOString() ?? null,
    },
    foodType: {
      id: menuItem.foodType.id,
      name: toLocalization(menuItem.foodType.nameTh, menuItem.foodType.nameEn),
      icon: menuItem.foodType.icon,
    },
    tastes,
    name: toLocalization(menuItem.nameTh, menuItem.nameEn),
    description: toOptionalLocalization(
      menuItem.descriptionTh,
      menuItem.descriptionEn,
    ),
    price: menuItem.price,
    imageKey: menuItem.imageKey,
    imageUrl: menuItem.imageUrl,
    deletedAt: menuItem.deletedAt?.toISOString() ?? null,
    createdAt: menuItem.createdAt.toISOString(),
    updatedAt: menuItem.updatedAt.toISOString(),
  }
}

export function toMenuItemAuditSnapshot(menuItem: MenuItemWithRelations) {
  return toAdminMenuItem(menuItem) satisfies Prisma.InputJsonObject
}
