import { useQuery, type QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import type { components } from '@/api/openapiTypes'

export type CurrentUser =
  components['schemas']['AuthUserEnvelope']['data']['user']

export type UserRole = CurrentUser['role']

export const currentUserQueryKey = ['auth', 'currentUser'] as const

export function toCurrentUser(user: CurrentUser): CurrentUser {
  return { id: user.id, email: user.email, role: user.role }
}

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const { data, error, response } = await apiClient.GET('/api/auth/me')

  if (response.status === 401) return null
  if (!data) throw new ApiError(response.status, error)

  return toCurrentUser(data.data.user)
}

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
  })
}

export function storeCurrentUser(queryClient: QueryClient, user: CurrentUser) {
  queryClient.setQueryData(currentUserQueryKey, user)
  void queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
}

// An account request that comes back 401 means the session expired: the page reads as signed
// out, not as an error in the flow it belongs to.
export function markSignedOut(queryClient: QueryClient) {
  queryClient.setQueryData(currentUserQueryKey, null)
}

export function isUnauthenticated(error: unknown) {
  return error instanceof ApiError && error.status === 401
}
