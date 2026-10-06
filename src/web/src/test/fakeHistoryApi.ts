import type { HistoryItem } from '@/hooks/recommendation-history/useRecommendationHistory'
import { jsonResponse, type FakeApiOptions } from '@/test/renderApp'

type MenuItemSummary = HistoryItem['menuItem']

export function historyItem(
  menuItem: MenuItemSummary,
  overrides: Partial<Omit<HistoryItem, 'menuItem'>> = {},
): HistoryItem {
  return {
    id: `history_${menuItem.id}`,
    menuItemId: menuItem.id,
    selectedAt: '2026-10-07T05:00:00.000Z',
    available: true,
    menuItem,
    ...overrides,
  }
}

// A stateful `/api/recommendation-history` for one signed-in user. GET pages the rows (kept
// newest first), POST adds a row for a `catalog` item, and DELETE clears everything.
// `failRecord` answers a POST with a fixed response instead.
export function fakeHistory({
  saved = [],
  catalog = [],
  failRecord,
}: {
  saved?: HistoryItem[]
  catalog?: MenuItemSummary[]
  failRecord?: () => Response
} = {}) {
  let rows = [...saved]
  let created = 0

  const handle: NonNullable<FakeApiOptions['handle']> = (method, url, body) => {
    if (url.pathname !== '/api/recommendation-history') return undefined
    if (method === 'GET') {
      const page = Number(url.searchParams.get('page') ?? 1)
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20)
      return jsonResponse(200, {
        data: { items: rows.slice((page - 1) * pageSize, page * pageSize) },
        meta: { page, pageSize, total: rows.length },
      })
    }
    if (method === 'POST') {
      if (failRecord) return failRecord()
      const { menuItemId } = body as { menuItemId: string }
      const menuItem = catalog.find(({ id }) => id === menuItemId)
      if (!menuItem) throw new Error(`Unknown menu item ${menuItemId}.`)
      created += 1
      const row = historyItem(menuItem, { id: `history_new_${created}` })
      rows = [row, ...rows]
      const { id, selectedAt } = row
      return jsonResponse(201, {
        data: { history: { id, menuItemId, selectedAt } },
      })
    }
    if (method === 'DELETE') {
      rows = []
      return new Response(null, { status: 204 })
    }
    return undefined
  }

  return { handle, rows: () => rows }
}
