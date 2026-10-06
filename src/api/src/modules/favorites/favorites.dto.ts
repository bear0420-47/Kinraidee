import { Prisma } from '@prisma/client'
import { z } from 'zod'

import { localizationSchema, toLocalization } from '@/shared/localization'
import { parseWithSchema } from '@/shared/validation'

export const favoriteParamsSchema = z.object({
  menuItemId: z.string().trim().min(1),
})

// Only the summary a favorites list needs: no image key, deletion time, or Restaurant phone.
export const favoriteItemSchema = z.object({
  menuItemId: z.string(),
  createdAt: z.iso.datetime(),
  available: z.boolean(),
  menuItem: z.object({
    id: z.string(),
    name: localizationSchema,
    price: z.number().int().positive(),
    imageUrl: z.string().nullable(),
    restaurant: z.object({
      id: z.string(),
      name: localizationSchema,
    }),
  }),
})

export const favoriteListEnvelopeSchema = z.object({
  data: z.object({ items: z.array(favoriteItemSchema) }),
})

export const favoriteStateEnvelopeSchema = z.object({
  data: z.object({
    menuItemId: z.string(),
    favorited: z.boolean(),
  }),
})

export const favoriteWithMenuItem =
  Prisma.validator<Prisma.FavoriteMenuItemDefaultArgs>()({
    include: { menuItem: { include: { restaurant: true } } },
  })

export type FavoriteWithMenuItem = Prisma.FavoriteMenuItemGetPayload<
  typeof favoriteWithMenuItem
>
export type FavoriteItem = z.infer<typeof favoriteItemSchema>
export type FavoriteState = z.infer<typeof favoriteStateEnvelopeSchema>['data']

export function parseFavoriteMenuItemId(params: unknown) {
  return parseWithSchema(favoriteParamsSchema, params).menuItemId
}

// A MenuItem can be newly favorited only while it and its Restaurant are active.
export function isAvailableMenuItem(menuItem: {
  deletedAt: Date | null
  restaurant: { deletedAt: Date | null }
}) {
  return menuItem.deletedAt === null && menuItem.restaurant.deletedAt === null
}

export function toFavoriteItem(favorite: FavoriteWithMenuItem): FavoriteItem {
  const { menuItem } = favorite
  return {
    menuItemId: favorite.menuItemId,
    createdAt: favorite.createdAt.toISOString(),
    available: isAvailableMenuItem(menuItem),
    menuItem: {
      id: menuItem.id,
      name: toLocalization(menuItem.nameTh, menuItem.nameEn),
      price: menuItem.price,
      imageUrl: menuItem.imageUrl,
      restaurant: {
        id: menuItem.restaurant.id,
        name: toLocalization(
          menuItem.restaurant.nameTh,
          menuItem.restaurant.nameEn,
        ),
      },
    },
  }
}
