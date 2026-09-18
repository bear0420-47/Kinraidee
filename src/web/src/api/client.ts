import createClient from 'openapi-fetch'
import type { paths } from '@/api/openapiTypes'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const apiClient = createClient<paths>({
  baseUrl: apiBaseUrl,
  credentials: 'include',
})
