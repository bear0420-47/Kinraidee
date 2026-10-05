import { apiBaseUrl } from '@/api/client'

// Uploaded images are served by the API (`/uploads/<key>`); external URLs pass through unchanged.
export function resolveImageUrl(url: string) {
  return new URL(url, apiBaseUrl).toString()
}
