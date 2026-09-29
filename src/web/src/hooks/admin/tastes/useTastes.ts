import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import type {
  CreateTasteBody,
  UpdateTasteBody,
} from '@/schemas/admin/tastes/tasteSchemas'

export const tastesQueryKey = ['tastes'] as const

export function useTastes() {
  return useQuery({
    queryKey: tastesQueryKey,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET('/api/tastes')
      if (!data) throw new ApiError(response.status, error)
      return data.data.items
    },
  })
}

function useInvalidateTastes() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: tastesQueryKey })
}

export function useCreateTaste() {
  const invalidateTastes = useInvalidateTastes()

  return useMutation({
    mutationFn: async (body: CreateTasteBody) => {
      const { data, error, response } = await apiClient.POST('/api/tastes', {
        body,
      })
      if (!data) throw new ApiError(response.status, error)
      return data.data.taste
    },
    onSuccess: invalidateTastes,
  })
}

export function useUpdateTaste() {
  const invalidateTastes = useInvalidateTastes()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateTasteBody }) => {
      const { data, error, response } = await apiClient.PATCH(
        '/api/tastes/{id}',
        { params: { path: { id } }, body },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.taste
    },
    onSuccess: invalidateTastes,
  })
}

export function useDeleteTaste() {
  const invalidateTastes = useInvalidateTastes()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error, response } = await apiClient.DELETE('/api/tastes/{id}', {
        params: { path: { id } },
      })
      if (!response.ok) throw new ApiError(response.status, error)
    },
    onSuccess: invalidateTastes,
  })
}
