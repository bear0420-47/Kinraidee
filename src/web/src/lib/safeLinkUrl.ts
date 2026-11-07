// Links from third-party data (Google Places) go into `href`; only http(s) URLs are
// kept so a `javascript:` or `data:` value can never run script when clicked.
export function safeLinkUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : null
  } catch {
    return null
  }
}
