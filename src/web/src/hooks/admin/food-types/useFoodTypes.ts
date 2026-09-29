import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import type {
  CreateFoodTypeBody,
  UpdateFoodTypeBody,
} from '@/schemas/admin/food-types/foodTypeSchemas'

export const foodTypesQueryKey = ['food-types'] as const

export function useFoodTypes() {
  return useQuery({
    queryKey: foodTypesQueryKey,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET('/api/food-types')
      if (!data) throw new ApiError(response.status, error)
      return data.data.items
    },
  })
}

function useInvalidateFoodTypes() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: foodTypesQueryKey })
}

export function useCreateFoodType() {
  const invalidateFoodTypes = useInvalidateFoodTypes()

  return useMutation({
    mutationFn: async (body: CreateFoodTypeBody) => {
      const { data, error, response } = await apiClient.POST(
        '/api/food-types',
        { body },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.foodType
    },
    onSuccess: invalidateFoodTypes,
  })
}

export function useUpdateFoodType() {
  const invalidateFoodTypes = useInvalidateFoodTypes()

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string
      body: UpdateFoodTypeBody
    }) => {
      const { data, error, response } = await apiClient.PATCH(
        '/api/food-types/{id}',
        { params: { path: { id } }, body },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.foodType
    },
    onSuccess: invalidateFoodTypes,
  })
}

export function useDeleteFoodType() {
  const invalidateFoodTypes = useInvalidateFoodTypes()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error, response } = await apiClient.DELETE(
        '/api/food-types/{id}',
        { params: { path: { id } } },
      )
      if (!response.ok) throw new ApiError(response.status, error)
    },
    onSuccess: invalidateFoodTypes,
  })
}
