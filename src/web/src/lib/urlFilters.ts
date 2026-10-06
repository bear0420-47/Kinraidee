// A flat filter object kept in the URL query, so a reload or a shared link keeps it. Each
// value's type comes from its default: strings as-is, numbers as positive whole numbers
// (pages), and booleans as `true`. Defaults are left out of the URL, and an unreadable
// value falls back to its default.
export type FilterValues = Record<string, string | number | boolean>

function parseValue(raw: string, fallback: string | number | boolean) {
  if (typeof fallback === 'number') {
    return /^[1-9]\d*$/.test(raw) ? Number(raw) : fallback
  }
  if (typeof fallback === 'boolean') return raw === 'true'
  return raw
}

export function readFilters<T extends FilterValues>(
  params: URLSearchParams,
  defaults: T,
): T {
  const filters: FilterValues = { ...defaults }
  for (const [key, fallback] of Object.entries(defaults)) {
    const raw = params.get(key)
    if (raw !== null) filters[key] = parseValue(raw, fallback)
  }
  return filters as T
}

// Returns a copy of `params` with the filter keys rewritten; other keys are kept.
export function writeFilters<T extends FilterValues>(
  params: URLSearchParams,
  filters: T,
  defaults: T,
): URLSearchParams {
  const next = new URLSearchParams(params)
  for (const key of Object.keys(defaults)) {
    if (filters[key] === defaults[key]) next.delete(key)
    else next.set(key, String(filters[key]))
  }
  return next
}
