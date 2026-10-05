import { z } from 'zod'

import type { components, paths } from '@/api/openapiTypes'
import {
  checkDescriptionPair,
  isSameLocalization,
  localizedNameFields,
  optionalDescriptionFields,
  toOptionalDescription,
} from '@/schemas/shared/masterDataFields'
import {
  checkImageSource,
  getImageChange,
  imageFormFields,
  toImageBody,
  toImageFormValues,
} from '@/schemas/shared/imageFields'

export type Restaurant =
  components['schemas']['RestaurantListEnvelope']['data']['items'][number]
export type RestaurantListMeta =
  components['schemas']['RestaurantListEnvelope']['meta']
export type CreateRestaurantBody =
  components['schemas']['CreateRestaurantRequest']
export type UpdateRestaurantBody =
  components['schemas']['UpdateRestaurantRequest']
export type RestaurantListQuery = NonNullable<
  paths['/api/restaurants']['get']['parameters']['query']
>

// UI filter state; converted to the API query string by `toRestaurantListQuery`.
export type RestaurantFilters = {
  page: number
  search: string
  zoneId: string
  includeDeleted: boolean
}

export const RESTAURANT_PAGE_SIZE = 20

export const defaultRestaurantFilters: RestaurantFilters = {
  page: 1,
  search: '',
  zoneId: '',
  includeDeleted: false,
}

export function toRestaurantListQuery(
  filters: RestaurantFilters,
): RestaurantListQuery {
  return {
    page: filters.page,
    pageSize: RESTAURANT_PAGE_SIZE,
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
    ...(filters.zoneId ? { zoneId: filters.zoneId } : {}),
    ...(filters.includeDeleted ? { includeDeleted: 'true' } : {}),
  }
}

export const restaurantFormSchema = z
  .object({
    zoneId: z.string().min(1, 'กรุณาเลือกโซน'),
    ...localizedNameFields,
    ...optionalDescriptionFields,
    phone: z.string().trim(),
    ...imageFormFields,
  })
  .superRefine((values, context) => {
    checkDescriptionPair(values, context)
    checkImageSource(values, context)
  })
  .transform((values): CreateRestaurantBody => ({
    zoneId: values.zoneId,
    name: { th: values.nameTh, en: values.nameEn },
    description: toOptionalDescription(
      values.descriptionTh,
      values.descriptionEn,
    ),
    phone: values.phone || null,
    ...toImageBody(values),
  }))

export type RestaurantFormInput = z.input<typeof restaurantFormSchema>

export function toRestaurantFormValues(
  restaurant?: Restaurant,
): RestaurantFormInput {
  return {
    zoneId: restaurant?.zoneId ?? '',
    nameTh: restaurant?.name.th ?? '',
    nameEn: restaurant?.name.en ?? '',
    descriptionTh: restaurant?.description?.th ?? '',
    descriptionEn: restaurant?.description?.en ?? '',
    phone: restaurant?.phone ?? '',
    ...toImageFormValues(restaurant),
  }
}

// PATCH only what changed; the image key and URL always travel together.
export function getRestaurantChanges(
  restaurant: Restaurant,
  body: CreateRestaurantBody,
): UpdateRestaurantBody | null {
  const changes: UpdateRestaurantBody = {}
  const description = body.description ?? null
  const phone = body.phone ?? null

  if (body.zoneId !== restaurant.zoneId) changes.zoneId = body.zoneId
  if (!isSameLocalization(body.name, restaurant.name)) changes.name = body.name
  if (!isSameLocalization(description, restaurant.description)) {
    changes.description = description
  }
  if (phone !== restaurant.phone) changes.phone = phone
  const imageChange = getImageChange(restaurant, body)
  if (imageChange) Object.assign(changes, imageChange)

  return Object.keys(changes).length > 0 ? changes : null
}
