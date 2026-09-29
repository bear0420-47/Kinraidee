import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import type { AuthCredentials } from '@/schemas/auth/authSchemas'
import { storeCurrentUser, toCurrentUser } from './useCurrentUser'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      const { data, error, response } = await apiClient.POST(
        '/api/auth/login',
        { body: credentials },
      )
      if (!data) throw new ApiError(response.status, error)
      return toCurrentUser(data.data.user)
    },
    onSuccess: (user) => storeCurrentUser(queryClient, user),
  })
}
