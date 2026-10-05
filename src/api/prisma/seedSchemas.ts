import { z } from 'zod'

const cuidSchema = z.string().regex(/^c[a-z0-9]{24}$/, 'Expected a CUID.')
const requiredTextSchema = z.string().trim().min(1)
const externalImageUrlSchema = z
  .url()
  .refine((value) => /^https?:\/\//i.test(value), {
    message: 'External images must use HTTP or HTTPS.',
  })

const localizationSchema = z.object({
  th: requiredTextSchema,
  en: requiredTextSchema,
})

const optionalLocalizationSchema = z
  .object({
    th: requiredTextSchema.optional(),
    en: requiredTextSchema.optional(),
  })
  .refine(({ th, en }) => th !== undefined || en !== undefined, {
    message: 'At least one localized description is required.',
  })
  .nullable()

const zoneSchema = z.object({
  id: cuidSchema,
  name: localizationSchema,
  description: optionalLocalizationSchema,
  sortOrder: z.number().int().nonnegative(),
})

const iconMasterDataSchema = z.object({
  id: cuidSchema,
  name: localizationSchema,
  icon: requiredTextSchema.nullable(),
  sortOrder: z.number().int().nonnegative(),
})

const restaurantSchema = z.object({
  id: cuidSchema,
  zoneId: cuidSchema,
  name: localizationSchema,
  description: optionalLocalizationSchema,
  phone: z
    .string()
    .regex(/^\d{9,10}$/)
    .nullable(),
  imageUrl: externalImageUrlSchema.nullable(),
})

const menuItemSchema = z.object({
  id: cuidSchema,
  restaurantId: cuidSchema,
  foodTypeId: cuidSchema,
  tasteIds: z.array(cuidSchema).min(1),
  name: localizationSchema,
  description: optionalLocalizationSchema,
  price: z.number().int().positive(),
  imageUrl: externalImageUrlSchema.nullable(),
})

function addDuplicateIssues(
  values: string[],
  path: (string | number)[],
  context: z.RefinementCtx,
) {
  const seen = new Set<string>()

  values.forEach((value, index) => {
    if (seen.has(value)) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate value: ${value}`,
        path: [...path, index],
      })
    }
    seen.add(value)
  })
}

export const catalogSeedSchema = z
  .object({
    zones: z.array(zoneSchema).min(1),
    foodTypes: z.array(iconMasterDataSchema).min(1),
    tastes: z.array(iconMasterDataSchema).min(1),
    restaurants: z.array(restaurantSchema).min(1),
    menuItems: z.array(menuItemSchema).min(1),
  })
  .superRefine((catalog, context) => {
    const collections = [
      ['zones', catalog.zones],
      ['foodTypes', catalog.foodTypes],
      ['tastes', catalog.tastes],
      ['restaurants', catalog.restaurants],
      ['menuItems', catalog.menuItems],
    ] as const

    addDuplicateIssues(
      collections.flatMap(([, records]) => records.map(({ id }) => id)),
      ['ids'],
      context,
    )

    const uniquelyNamedCollections = [
      ['zones', catalog.zones],
      ['foodTypes', catalog.foodTypes],
      ['tastes', catalog.tastes],
    ] as const

    for (const [name, records] of uniquelyNamedCollections) {
      addDuplicateIssues(
        records.map((record) => record.name.th),
        [name, 'name', 'th'],
        context,
      )
      addDuplicateIssues(
        records.map((record) => record.name.en),
        [name, 'name', 'en'],
        context,
      )
    }

    const zoneIds = new Set(catalog.zones.map(({ id }) => id))
    const foodTypeIds = new Set(catalog.foodTypes.map(({ id }) => id))
    const tasteIds = new Set(catalog.tastes.map(({ id }) => id))
    const restaurantIds = new Set(catalog.restaurants.map(({ id }) => id))

    catalog.restaurants.forEach((restaurant, index) => {
      if (!zoneIds.has(restaurant.zoneId)) {
        context.addIssue({
          code: 'custom',
          message: 'Restaurant references an unknown zone.',
          path: ['restaurants', index, 'zoneId'],
        })
      }
    })

    catalog.menuItems.forEach((menuItem, index) => {
      if (!restaurantIds.has(menuItem.restaurantId)) {
        context.addIssue({
          code: 'custom',
          message: 'Menu item references an unknown restaurant.',
          path: ['menuItems', index, 'restaurantId'],
        })
      }
      if (!foodTypeIds.has(menuItem.foodTypeId)) {
        context.addIssue({
          code: 'custom',
          message: 'Menu item references an unknown food type.',
          path: ['menuItems', index, 'foodTypeId'],
        })
      }

      addDuplicateIssues(
        menuItem.tasteIds,
        ['menuItems', index, 'tasteIds'],
        context,
      )
      menuItem.tasteIds.forEach((tasteId, tasteIndex) => {
        if (!tasteIds.has(tasteId)) {
          context.addIssue({
            code: 'custom',
            message: 'Menu item references an unknown taste.',
            path: ['menuItems', index, 'tasteIds', tasteIndex],
          })
        }
      })
    })
  })

export type CatalogSeed = z.infer<typeof catalogSeedSchema>
