import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import type { components } from '@/api/openapiTypes'
import {
  isUnauthenticated,
  markSignedOut,
  useCurrentUser,
} from '@/hooks/auth/useCurrentUser'

export type HistoryItem =
  components['schemas']['HistoryListEnvelope']['data']['items'][number]

export const HISTORY_PAGE_SIZE = 20

export const historyQueryKey = ['recommendation-history'] as const

// One page of the signed-in user's selected menus, newest first. Idle while signed out, and
// keyed by user so one account never sees another account's cached history.
export function useHistory(page: number) {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useQuery({
    queryKey: [...historyQueryKey, user?.id ?? '', page],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET(
        '/api/recommendation-history',
        { params: { query: { page, pageSize: HISTORY_PAGE_SIZE } } },
      )
      if (response.status === 401) {
        markSignedOut(queryClient)
        return {
          items: [] as HistoryItem[],
          meta: { page, pageSize: HISTORY_PAGE_SIZE, total: 0 },
        }
      }
      if (!data) throw new ApiError(response.status, error)
      return { items: data.data.items, meta: data.meta }
    },
    // Keep the current page visible while the next one loads.
    placeholderData: keepPreviousData,
  })
}

function useInvalidateHistory() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: historyQueryKey })
}

// Records the menu confirmed with `เอาเมนูนี้แหละ`: only its ID, never the session.
export function useRecordHistory() {
  const queryClient = useQueryClient()
  const invalidateHistory = useInvalidateHistory()

  return useMutation({
    mutationFn: async (menuItemId: string) => {
      const { data, error, response } = await apiClient.POST(
        '/api/recommendation-history',
        { body: { menuItemId } },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.history
    },
    onSuccess: invalidateHistory,
    onError: (error) => {
      if (isUnauthenticated(error)) markSignedOut(queryClient)
    },
  })
}

export function useClearHistory() {
  const queryClient = useQueryClient()
  const invalidateHistory = useInvalidateHistory()

  return useMutation({
    mutationFn: async () => {
      const { error, response } = await apiClient.DELETE(
        '/api/recommendation-history',
      )
      if (!response.ok) throw new ApiError(response.status, error)
    },
    onSuccess: invalidateHistory,
    onError: (error) => {
      if (isUnauthenticated(error)) markSignedOut(queryClient)
    },
  })
}
