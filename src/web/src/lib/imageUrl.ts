import { apiBaseUrl } from '@/api/client'

// Uploaded images are served by the API (`/uploads/<key>`); external URLs pass through unchanged.
// Returns null for a value that is not a URL, so a preview can fall back instead of crashing.
export function resolveImageUrl(url: string) {
  try {
    return new URL(url, apiBaseUrl).toString()
  } catch {
    return null
  }
}
