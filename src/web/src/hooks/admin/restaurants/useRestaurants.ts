import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import {
  getRestaurantChanges,
  toRestaurantListQuery,
  type CreateRestaurantBody,
  type Restaurant,
  type RestaurantFilters,
  type UpdateRestaurantBody,
} from '@/schemas/admin/restaurants/restaurantSchemas'
import { discardUploadedImage } from './useRestaurantImage'

export const restaurantsQueryKey = ['restaurants'] as const

export function useRestaurants(filters: RestaurantFilters) {
  const query = toRestaurantListQuery(filters)

  return useQuery({
    queryKey: [...restaurantsQueryKey, query],
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET(
        '/api/restaurants',
        { params: { query } },
      )
      if (!data) throw new ApiError(response.status, error)
      return { items: data.data.items, meta: data.meta }
    },
    // Keep the current page visible while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
}

function useInvalidateRestaurants() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: restaurantsQueryKey })
}

function useCreateRestaurant() {
  const invalidateRestaurants = useInvalidateRestaurants()

  return useMutation({
    mutationFn: async (body: CreateRestaurantBody) => {
      const { data, error, response } = await apiClient.POST(
        '/api/restaurants',
        { body },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.restaurant
    },
    onSuccess: invalidateRestaurants,
  })
}

function useUpdateRestaurant() {
  const invalidateRestaurants = useInvalidateRestaurants()

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string
      body: UpdateRestaurantBody
    }) => {
      const { data, error, response } = await apiClient.PATCH(
        '/api/restaurants/{id}',
        { params: { path: { id } }, body },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.restaurant
    },
    onSuccess: invalidateRestaurants,
  })
}

export function useDeleteRestaurant() {
  const invalidateRestaurants = useInvalidateRestaurants()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error, response } = await apiClient.DELETE(
        '/api/restaurants/{id}',
        { params: { path: { id } } },
      )
      if (!response.ok) throw new ApiError(response.status, error)
    },
    onSuccess: invalidateRestaurants,
  })
}

export function useRestoreRestaurant() {
  const invalidateRestaurants = useInvalidateRestaurants()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error, response } = await apiClient.POST(
        '/api/restaurants/{id}/restore',
        { params: { path: { id } } },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.restaurant
    },
    onSuccess: invalidateRestaurants,
  })
}

// A failed save; the new upload (if any) has already been cleaned up best-effort.
export class RestaurantSaveError extends Error {
  readonly reason: unknown
  readonly uploadDiscarded: boolean
  readonly cleanupFailed: boolean

  constructor(
    reason: unknown,
    {
      uploadDiscarded,
      cleanupFailed,
    }: { uploadDiscarded: boolean; cleanupFailed: boolean },
  ) {
    super('Restaurant save failed.')
    this.name = 'RestaurantSaveError'
    this.reason = reason
    this.uploadDiscarded = uploadDiscarded
    this.cleanupFailed = cleanupFailed
  }
}

type SaveRestaurantInput = {
  restaurant?: Restaurant | undefined
  body: CreateRestaurantBody
  // Key of an upload made in this form session that the database does not reference yet.
  pendingUploadKey: string | null
}

export type SaveRestaurantResult = {
  changed: boolean
  cleanupFailed: boolean
}

async function discardAll(keys: (string | null | undefined)[]) {
  const results = await Promise.all(
    keys.flatMap((key) => (key ? [discardUploadedImage(key)] : [])),
  )
  return results.every(Boolean)
}

// Create or update, then remove local files only once the database no longer points at them.
export function useSaveRestaurant() {
  const createRestaurant = useCreateRestaurant()
  const updateRestaurant = useUpdateRestaurant()

  return async function saveRestaurant({
    restaurant,
    body,
    pendingUploadKey,
  }: SaveRestaurantInput): Promise<SaveRestaurantResult> {
    const changes = restaurant ? getRestaurantChanges(restaurant, body) : null

    try {
      if (!restaurant) await createRestaurant.mutateAsync(body)
      else if (changes) {
        await updateRestaurant.mutateAsync({ id: restaurant.id, body: changes })
      }
    } catch (error) {
      // The old image stays referenced; only the new, unsaved upload is an orphan.
      const cleaned = await discardAll([pendingUploadKey])
      throw new RestaurantSaveError(error, {
        uploadDiscarded: Boolean(pendingUploadKey),
        cleanupFailed: !cleaned,
      })
    }

    const savedKey = body.imageKey ?? null
    const unusedUpload = pendingUploadKey !== savedKey ? pendingUploadKey : null
    const replacedKey =
      restaurant?.imageKey && restaurant.imageKey !== savedKey
        ? restaurant.imageKey
        : null
    const cleaned = await discardAll([unusedUpload, replacedKey])

    return { changed: !restaurant || Boolean(changes), cleanupFailed: !cleaned }
  }
}
