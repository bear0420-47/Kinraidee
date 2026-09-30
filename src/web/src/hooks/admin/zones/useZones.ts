import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import type {
  CreateZoneBody,
  UpdateZoneBody,
} from '@/schemas/admin/zones/zoneSchemas'

export const zonesQueryKey = ['zones'] as const

export function useZones() {
  return useQuery({
    queryKey: zonesQueryKey,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET('/api/zones')
      if (!data) throw new ApiError(response.status, error)
      return data.data.items
    },
  })
}

function useInvalidateZones() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: zonesQueryKey })
}

export function useCreateZone() {
  const invalidateZones = useInvalidateZones()

  return useMutation({
    mutationFn: async (body: CreateZoneBody) => {
      const { data, error, response } = await apiClient.POST('/api/zones', {
        body,
      })
      if (!data) throw new ApiError(response.status, error)
      return data.data.zone
    },
    onSuccess: invalidateZones,
  })
}

export function useUpdateZone() {
  const invalidateZones = useInvalidateZones()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateZoneBody }) => {
      const { data, error, response } = await apiClient.PATCH(
        '/api/zones/{id}',
        { params: { path: { id } }, body },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.zone
    },
    onSuccess: invalidateZones,
  })
}

export function useDeleteZone() {
  const invalidateZones = useInvalidateZones()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error, response } = await apiClient.DELETE('/api/zones/{id}', {
        params: { path: { id } },
      })
      if (!response.ok) throw new ApiError(response.status, error)
    },
    onSuccess: invalidateZones,
  })
}
