import type { Prisma } from '@prisma/client'
import { z } from 'zod'

import { HttpError } from '@/shared/httpError'
import { localizationSchema, toLocalization } from '@/shared/localization'

// The MenuItem summary that account lists (favorites, history) show: no image key, deletion
// time, Restaurant phone, or other admin fields.
export const menuItemSummarySchema = z.object({
  id: z.string(),
  name: localizationSchema,
  price: z.number().int().positive(),
  imageUrl: z.string().nullable(),
  restaurant: z.object({
    id: z.string(),
    name: localizationSchema,
  }),
})

export type MenuItemSummary = z.infer<typeof menuItemSummarySchema>

export type MenuItemWithRestaurant = Prisma.MenuItemGetPayload<{
  include: { restaurant: true }
}>

export function toMenuItemSummary(
  menuItem: MenuItemWithRestaurant,
): MenuItemSummary {
  return {
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
  }
}

// A MenuItem can be newly favorited or selected only while it and its Restaurant are active.
export function isAvailableMenuItem(menuItem: {
  deletedAt: Date | null
  restaurant: { deletedAt: Date | null }
}) {
  return menuItem.deletedAt === null && menuItem.restaurant.deletedAt === null
}

export function menuItemUnavailableError() {
  return new HttpError({
    status: 409,
    code: 'MENU_ITEM_UNAVAILABLE',
    message: 'Menu item is no longer available.',
  })
}
