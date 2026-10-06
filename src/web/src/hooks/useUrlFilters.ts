import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

import { type FilterValues, readFilters, writeFilters } from '@/lib/urlFilters'

type FilterUpdate<T> = T | ((current: T) => T)

// Like `useState`, but the filters live in the URL query (see `lib/urlFilters.ts`).
// Changes replace the history entry, so Back leaves the page instead of undoing filters.
// `defaults` must be a stable module-level object.
export function useUrlFilters<T extends FilterValues>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams, defaults)

  const setFilters = useCallback(
    (update: FilterUpdate<T>) => {
      setSearchParams(
        (current) => {
          const previous = readFilters(current, defaults)
          const next = typeof update === 'function' ? update(previous) : update
          return writeFilters(current, next, defaults)
        },
        { replace: true },
      )
    },
    [defaults, setSearchParams],
  )

  return [filters, setFilters] as const
}
