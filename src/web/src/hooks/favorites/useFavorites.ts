import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import {
  currentUserQueryKey,
  useCurrentUser,
} from '@/hooks/auth/useCurrentUser'
import type {
  FavoriteItem,
  FavoriteMenuItem,
} from '@/schemas/favorites/favoriteSchemas'

export const favoritesQueryKey = ['favorites'] as const

// Keyed by user, so one account never sees another account's cached favorites.
function userFavoritesKey(userId: string) {
  return [...favoritesQueryKey, userId] as const
}

// An expired session reads as signed out, not as an error in the meal flow.
function markSignedOut(queryClient: QueryClient) {
  queryClient.setQueryData(currentUserQueryKey, null)
}

export function isUnauthenticated(error: unknown) {
  return error instanceof ApiError && error.status === 401
}

// The signed-in user's favorites, newest first. Idle while signed out.
export function useFavorites() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useQuery({
    queryKey: userFavoritesKey(user?.id ?? ''),
    enabled: Boolean(user),
    queryFn: async (): Promise<FavoriteItem[]> => {
      const { data, error, response } = await apiClient.GET('/api/favorites')
      if (response.status === 401) {
        markSignedOut(queryClient)
        return []
      }
      if (!data) throw new ApiError(response.status, error)
      return data.data.items
    },
  })
}

type SetFavoriteInput = { menuItem: FavoriteMenuItem; favorited: boolean }

// Sets a known target state with PUT or DELETE, which a retry cannot reverse (unlike the
// API's toggle). The cache updates at once, then refetches to pick up the server's order.
export function useSetFavorite() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: async ({ menuItem, favorited }: SetFavoriteInput) => {
      const options = { params: { path: { menuItemId: menuItem.id } } }
      const { data, error, response } = favorited
        ? await apiClient.PUT('/api/favorites/{menuItemId}', options)
        : await apiClient.DELETE('/api/favorites/{menuItemId}', options)
      if (!data) throw new ApiError(response.status, error)
      return data.data
    },
    onSuccess: ({ favorited }, { menuItem }) => {
      if (!user) return
      queryClient.setQueryData<FavoriteItem[]>(
        userFavoritesKey(user.id),
        (items = []) => {
          const saved = items.some((item) => item.menuItemId === menuItem.id)
          if (!favorited) {
            return items.filter((item) => item.menuItemId !== menuItem.id)
          }
          if (saved) return items
          const added: FavoriteItem = {
            menuItemId: menuItem.id,
            createdAt: new Date().toISOString(),
            available: true,
            menuItem,
          }
          return [added, ...items]
        },
      )
      void queryClient.invalidateQueries({ queryKey: favoritesQueryKey })
    },
    onError: (error) => {
      if (isUnauthenticated(error)) markSignedOut(queryClient)
    },
  })
}
