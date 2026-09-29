import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { Button } from '@/components/Button'

type QueryListStateProps<Item> = {
  query: UseQueryResult<Item[]>
  loadingMessage: string
  errorMessage: string
  emptyMessage: string
  children: (items: Item[]) => ReactNode
}

// Loading, error-with-retry, and empty states around a list query.
export function QueryListState<Item>({
  query,
  loadingMessage,
  errorMessage,
  emptyMessage,
  children,
}: QueryListStateProps<Item>) {
  if (query.isPending) return <p role="status">{loadingMessage}</p>

  if (query.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="font-bold text-rust">{errorMessage}</p>
        <Button variant="secondary" onClick={() => void query.refetch()}>
          ลองใหม่
        </Button>
      </div>
    )
  }

  if (query.data.length === 0) {
    return (
      <p className="rounded-sm border-2 border-line-soft p-6 text-center font-bold text-muted">
        {emptyMessage}
      </p>
    )
  }

  return children(query.data)
}
