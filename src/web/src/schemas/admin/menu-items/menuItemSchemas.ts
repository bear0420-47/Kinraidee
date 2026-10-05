import { z } from 'zod'

import type { components, paths } from '@/api/openapiTypes'
import {
  checkImageSource,
  getImageChange,
  imageFormFields,
  toImageBody,
  toImageFormValues,
} from '@/schemas/shared/imageFields'
import {
  checkDescriptionPair,
  isSameLocalization,
  localizedNameFields,
  optionalDescriptionFields,
  toOptionalDescription,
} from '@/schemas/shared/masterDataFields'

export type MenuItem =
  components['schemas']['MenuItemListEnvelope']['data']['items'][number]
export type CreateMenuItemBody = components['schemas']['CreateMenuItemRequest']
export type UpdateMenuItemBody = components['schemas']['UpdateMenuItemRequest']
export type MenuItemListQuery = NonNullable<
  paths['/api/menu-items']['get']['parameters']['query']
>

// UI filter state; converted to the API query string by `toMenuItemListQuery`.
export type MenuItemFilters = {
  page: number
  search: string
  restaurantId: string
  foodTypeId: string
  tasteId: string
  includeDeleted: boolean
}

export const MENU_ITEM_PAGE_SIZE = 20

export const defaultMenuItemFilters: MenuItemFilters = {
  page: 1,
  search: '',
  restaurantId: '',
  foodTypeId: '',
  tasteId: '',
  includeDeleted: false,
}

export function toMenuItemListQuery(
  filters: MenuItemFilters,
): MenuItemListQuery {
  return {
    page: filters.page,
    pageSize: MENU_ITEM_PAGE_SIZE,
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
    ...(filters.restaurantId ? { restaurantId: filters.restaurantId } : {}),
    ...(filters.foodTypeId ? { foodTypeId: filters.foodTypeId } : {}),
    ...(filters.tasteId ? { tasteId: filters.tasteId } : {}),
    ...(filters.includeDeleted ? { includeDeleted: 'true' } : {}),
  }
}

export function isFilteringMenuItems(filters: MenuItemFilters) {
  return (
    filters.search.trim() !== '' ||
    filters.restaurantId !== '' ||
    filters.foodTypeId !== '' ||
    filters.tasteId !== '' ||
    filters.includeDeleted
  )
}

// The largest value the MenuItem.price PostgreSQL Int column holds.
export const MAX_PRICE = 2_147_483_647

const priceField = z
  .string()
  .trim()
  .min(1, { message: 'กรุณากรอกราคา', abort: true })
  .regex(/^\d+$/, 'ราคาต้องเป็นจำนวนเต็มบาท')
  .transform(Number)
  .pipe(
    z
      .number()
      .min(1, 'ราคาต้องมากกว่า 0 บาท')
      .max(MAX_PRICE, 'ราคาสูงเกินกว่าที่ระบบรองรับ'),
  )

export const menuItemFormSchema = z
  .object({
    restaurantId: z.string().min(1, 'กรุณาเลือกร้านอาหาร'),
    foodTypeId: z.string().min(1, 'กรุณาเลือกประเภทอาหาร'),
    tasteIds: z.array(z.string()).min(1, 'กรุณาเลือกรสชาติอย่างน้อย 1 รายการ'),
    ...localizedNameFields,
    ...optionalDescriptionFields,
    price: priceField,
    ...imageFormFields,
  })
  .superRefine((values, context) => {
    checkDescriptionPair(values, context)
    checkImageSource(values, context)
  })
  .transform((values): CreateMenuItemBody => ({
    restaurantId: values.restaurantId,
    foodTypeId: values.foodTypeId,
    tasteIds: [...new Set(values.tasteIds)],
    name: { th: values.nameTh, en: values.nameEn },
    description: toOptionalDescription(
      values.descriptionTh,
      values.descriptionEn,
    ),
    price: values.price,
    ...toImageBody(values),
  }))

export type MenuItemFormInput = z.input<typeof menuItemFormSchema>

export function toMenuItemFormValues(menuItem?: MenuItem): MenuItemFormInput {
  return {
    restaurantId: menuItem?.restaurantId ?? '',
    foodTypeId: menuItem?.foodTypeId ?? '',
    tasteIds: menuItem?.tastes.map((taste) => taste.id) ?? [],
    nameTh: menuItem?.name.th ?? '',
    nameEn: menuItem?.name.en ?? '',
    descriptionTh: menuItem?.description?.th ?? '',
    descriptionEn: menuItem?.description?.en ?? '',
    price: menuItem ? String(menuItem.price) : '',
    ...toImageFormValues(menuItem),
  }
}

function isSameIdSet(left: string[], right: string[]) {
  const rightIds = new Set(right)
  return left.length === rightIds.size && left.every((id) => rightIds.has(id))
}

// PATCH only what changed; tastes compare as a set, and the image key and URL travel together.
export function getMenuItemChanges(
  menuItem: MenuItem,
  body: CreateMenuItemBody,
): UpdateMenuItemBody | null {
  const changes: UpdateMenuItemBody = {}
  const description = body.description ?? null
  const tasteIds = menuItem.tastes.map((taste) => taste.id)

  if (body.restaurantId !== menuItem.restaurantId) {
    changes.restaurantId = body.restaurantId
  }
  if (body.foodTypeId !== menuItem.foodTypeId) {
    changes.foodTypeId = body.foodTypeId
  }
  if (!isSameIdSet(body.tasteIds, tasteIds)) changes.tasteIds = body.tasteIds
  if (!isSameLocalization(body.name, menuItem.name)) changes.name = body.name
  if (!isSameLocalization(description, menuItem.description)) {
    changes.description = description
  }
  if (body.price !== menuItem.price) changes.price = body.price
  const imageChange = getImageChange(menuItem, body)
  if (imageChange) Object.assign(changes, imageChange)

  return Object.keys(changes).length > 0 ? changes : null
}

export const isMenuItemDeleted = (menuItem: MenuItem) =>
  menuItem.deletedAt !== null

export const isRestaurantDeleted = (menuItem: MenuItem) =>
  menuItem.restaurant.deletedAt !== null

// Bulk actions accept at most this many explicit IDs, matching the API.
export const MAX_BULK_SELECTION = 50

export function toggleSelection(selected: ReadonlySet<string>, id: string) {
  const next = new Set(selected)
  if (next.has(id)) next.delete(id)
  else if (next.size < MAX_BULK_SELECTION) next.add(id)
  return next
}

// Selects every visible row up to the limit, or clears them when all are already selected.
export function toggleAllVisible(
  selected: ReadonlySet<string>,
  visibleIds: string[],
) {
  const next = new Set(selected)
  if (visibleIds.every((id) => next.has(id))) {
    visibleIds.forEach((id) => next.delete(id))
    return next
  }
  for (const id of visibleIds) {
    if (next.size >= MAX_BULK_SELECTION) break
    next.add(id)
  }
  return next
}

export function formatPrice(price: number) {
  return `฿${price.toLocaleString('th-TH')}`
}
