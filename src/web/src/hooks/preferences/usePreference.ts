import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import {
  isUnauthenticated,
  markSignedOut,
  useCurrentUser,
} from '@/hooks/auth/useCurrentUser'
import type { Preference } from '@/schemas/preferences/preferenceSchemas'

export const preferencesQueryKey = ['preferences'] as const

// Keyed by user, so one account never sees another account's cached defaults. The query
// cache is the only place the preference is kept; it is never written to browser storage.
function userPreferenceKey(userId: string) {
  return [...preferencesQueryKey, userId] as const
}

// The signed-in user's saved defaults, or null. Idle while signed out.
export function usePreference() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useQuery({
    queryKey: userPreferenceKey(user?.id ?? ''),
    enabled: Boolean(user),
    queryFn: async (): Promise<Preference | null> => {
      const { data, error, response } = await apiClient.GET('/api/preferences')
      if (response.status === 401) {
        markSignedOut(queryClient)
        return null
      }
      if (!data) throw new ApiError(response.status, error)
      return data.data.preference
    },
  })
}

// Stores the saved value at once, then refetches to stay in step with the server.
function useUpdatePreferenceCache() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return (preference: Preference | null) => {
    if (user) queryClient.setQueryData(userPreferenceKey(user.id), preference)
    void queryClient.invalidateQueries({ queryKey: preferencesQueryKey })
  }
}

// Sends the complete four-field replacement.
export function useSavePreference() {
  const queryClient = useQueryClient()
  const updateCache = useUpdatePreferenceCache()

  return useMutation({
    mutationFn: async (body: Preference) => {
      const { data, error, response } = await apiClient.PUT(
        '/api/preferences',
        { body },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.preference
    },
    onSuccess: updateCache,
    onError: (error) => {
      if (isUnauthenticated(error)) markSignedOut(queryClient)
    },
  })
}

export function useClearPreference() {
  const queryClient = useQueryClient()
  const updateCache = useUpdatePreferenceCache()

  return useMutation({
    mutationFn: async () => {
      const { error, response } = await apiClient.DELETE('/api/preferences')
      if (!response.ok) throw new ApiError(response.status, error)
    },
    onSuccess: () => updateCache(null),
    onError: (error) => {
      if (isUnauthenticated(error)) markSignedOut(queryClient)
    },
  })
}
