import { z } from 'zod'

import type { components, paths } from '@/api/openapiTypes'
import {
  checkDescriptionPair,
  isSameLocalization,
  localizedNameFields,
  optionalDescriptionFields,
  toOptionalDescription,
} from '@/schemas/shared/masterDataFields'

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

export const imageModes = ['none', 'url', 'upload'] as const
export type ImageMode = (typeof imageModes)[number]

export type UploadedImage = { key: string; url: string }

export function isHttpImageUrl(value: string) {
  return /^https?:\/\//i.test(value) && z.url().safeParse(value).success
}

// Exactly one image source is active; it becomes the API's imageKey/imageUrl pair.
export const restaurantFormSchema = z
  .object({
    zoneId: z.string().min(1, 'กรุณาเลือกโซน'),
    ...localizedNameFields,
    ...optionalDescriptionFields,
    phone: z.string().trim(),
    imageMode: z.enum(imageModes),
    imageUrl: z.string().trim(),
    uploadedImage: z.object({ key: z.string(), url: z.string() }).nullable(),
  })
  .superRefine((values, context) => {
    checkDescriptionPair(values, context)

    if (values.imageMode === 'url' && !values.imageUrl) {
      context.addIssue({
        code: 'custom',
        path: ['imageUrl'],
        message: 'กรุณากรอก URL รูปภาพ',
      })
    } else if (values.imageMode === 'url' && !isHttpImageUrl(values.imageUrl)) {
      context.addIssue({
        code: 'custom',
        path: ['imageUrl'],
        message: 'URL รูปภาพต้องขึ้นต้นด้วย http:// หรือ https://',
      })
    }

    if (values.imageMode === 'upload' && !values.uploadedImage) {
      context.addIssue({
        code: 'custom',
        path: ['uploadedImage'],
        message: 'กรุณาเลือกรูปเพื่ออัปโหลด',
      })
    }
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

function toImageBody({
  imageMode,
  imageUrl,
  uploadedImage,
}: Pick<RestaurantFormInput, 'imageMode' | 'imageUrl' | 'uploadedImage'>) {
  if (imageMode === 'url') return { imageKey: null, imageUrl }
  if (imageMode === 'upload' && uploadedImage) {
    return { imageKey: uploadedImage.key, imageUrl: uploadedImage.url }
  }
  return { imageKey: null, imageUrl: null }
}

export function toRestaurantFormValues(
  restaurant?: Restaurant,
): RestaurantFormInput {
  const imageKey = restaurant?.imageKey ?? null
  const imageUrl = restaurant?.imageUrl ?? null

  return {
    zoneId: restaurant?.zoneId ?? '',
    nameTh: restaurant?.name.th ?? '',
    nameEn: restaurant?.name.en ?? '',
    descriptionTh: restaurant?.description?.th ?? '',
    descriptionEn: restaurant?.description?.en ?? '',
    phone: restaurant?.phone ?? '',
    imageMode: imageKey ? 'upload' : imageUrl ? 'url' : 'none',
    imageUrl: imageKey ? '' : (imageUrl ?? ''),
    uploadedImage:
      imageKey && imageUrl ? { key: imageKey, url: imageUrl } : null,
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
  const imageKey = body.imageKey ?? null
  const imageUrl = body.imageUrl ?? null

  if (body.zoneId !== restaurant.zoneId) changes.zoneId = body.zoneId
  if (!isSameLocalization(body.name, restaurant.name)) changes.name = body.name
  if (!isSameLocalization(description, restaurant.description)) {
    changes.description = description
  }
  if (phone !== restaurant.phone) changes.phone = phone
  if (imageKey !== restaurant.imageKey || imageUrl !== restaurant.imageUrl) {
    changes.imageKey = imageKey
    changes.imageUrl = imageUrl
  }

  return Object.keys(changes).length > 0 ? changes : null
}
