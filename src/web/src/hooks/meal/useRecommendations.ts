import { useMutation } from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import type { RecommendationRequest } from '@/schemas/meal/recommendationSchemas'

// A mutation rather than a cached query: every shuffle and replacement draws fresh, and the
// API keeps no session of its own.
export function useRequestRecommendations() {
  return useMutation({
    mutationFn: async (body: RecommendationRequest) => {
      const { data, error, response } = await apiClient.POST(
        '/api/recommendations',
        { body },
      )
      if (!data) throw new ApiError(response.status, error)
      return {
        items: data.data.items,
        suggestion: data.data.suggestion ?? null,
      }
    },
  })
}

// A 400 means a stored condition no longer matches the catalog, such as a deleted zone.
export function recommendationErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 400) {
    return 'เงื่อนไขบางข้อไม่มีในระบบแล้ว กรุณาแก้เงื่อนไขแล้วลองใหม่'
  }
  return 'สับการ์ดเมนูไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}
