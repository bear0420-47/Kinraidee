import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import { saveWithImageCleanup } from '@/hooks/admin/images/saveWithImageCleanup'
import { menuItemsQueryKey } from '@/hooks/admin/menu-items/useMenuItems'
import {
  getRestaurantChanges,
  toRestaurantListQuery,
  type CreateRestaurantBody,
  type Restaurant,
  type RestaurantFilters,
  type UpdateRestaurantBody,
} from '@/schemas/admin/restaurants/restaurantSchemas'

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

const OPTIONS_PAGE_SIZE = 100

// Every Restaurant, deleted ones included, for selects on other admin pages. The list API
// pages at most 100 rows, so this walks every page.
export function useRestaurantOptions() {
  return useQuery({
    queryKey: [...restaurantsQueryKey, 'options'],
    queryFn: async () => {
      const restaurants: Restaurant[] = []
      for (let page = 1; ; page += 1) {
        const { data, error, response } = await apiClient.GET(
          '/api/restaurants',
          {
            params: {
              query: {
                page,
                pageSize: OPTIONS_PAGE_SIZE,
                includeDeleted: 'true',
              },
            },
          },
        )
        if (!data) throw new ApiError(response.status, error)
        restaurants.push(...data.data.items)
        if (
          data.data.items.length === 0 ||
          restaurants.length >= data.meta.total
        ) {
          return restaurants
        }
      }
    },
  })
}

function useInvalidateRestaurants() {
  const queryClient = useQueryClient()
  // MenuItem rows embed Restaurant names and deleted state (deleting a Restaurant also
  // deletes its MenuItems), so the MenuItem list refreshes too.
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: restaurantsQueryKey }),
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKey }),
    ])
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
    const { cleanupFailed } = await saveWithImageCleanup({
      previousKey: restaurant?.imageKey ?? null,
      pendingUploadKey,
      savedKey: body.imageKey ?? null,
      write: async () => {
        if (!restaurant) await createRestaurant.mutateAsync(body)
        else if (changes) {
          await updateRestaurant.mutateAsync({
            id: restaurant.id,
            body: changes,
          })
        }
      },
    })

    return { changed: !restaurant || Boolean(changes), cleanupFailed }
  }
}
