import { useQuery } from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import type { AuditLogFilters } from '@/schemas/admin/audit-logs/auditLogSchemas'

export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET('/api/audit-logs', {
        params: { query: filters },
      })
      if (!data) throw new ApiError(response.status, error)
      return data
    },
  })
}
