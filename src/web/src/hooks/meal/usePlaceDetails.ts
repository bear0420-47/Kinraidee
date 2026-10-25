import { useQuery } from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'

export function usePlaceDetails(restaurantId: string) {
  return useQuery({
    queryKey: ['place-details', restaurantId],
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET(
        '/api/restaurants/{restaurantId}/place-details',
        { params: { path: { restaurantId } } },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.details
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
