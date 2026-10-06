import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import { favoritesQueryKey } from '@/hooks/favorites/useFavorites'
import { preferencesQueryKey } from '@/hooks/preferences/usePreference'
import { historyQueryKey } from '@/hooks/recommendation-history/useRecommendationHistory'
import { currentUserQueryKey } from './useCurrentUser'

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      const { response } = await apiClient.POST('/api/auth/logout')
      if (!response.ok) throw new ApiError(response.status)
    },
    // Leave the protected page before clearing the user so no guard sends us to /login.
    // Account data (favorites, saved defaults, history) leaves the cache with the user.
    onSuccess: async () => {
      await navigate('/', { replace: true })
      queryClient.setQueryData(currentUserQueryKey, null)
      queryClient.removeQueries({ queryKey: favoritesQueryKey })
      queryClient.removeQueries({ queryKey: preferencesQueryKey })
      queryClient.removeQueries({ queryKey: historyQueryKey })
    },
  })
}
