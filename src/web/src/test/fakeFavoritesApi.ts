import type {
  FavoriteItem,
  FavoriteMenuItem,
} from '@/schemas/favorites/favoriteSchemas'
import { jsonResponse, type FakeApiOptions } from '@/test/renderApp'

export function favoriteItem(
  menuItem: FavoriteMenuItem,
  overrides: Partial<Omit<FavoriteItem, 'menuItem'>> = {},
): FavoriteItem {
  return {
    menuItemId: menuItem.id,
    createdAt: '2026-10-07T00:00:00.000Z',
    available: true,
    menuItem,
    ...overrides,
  }
}

// A stateful `/api/favorites` for one signed-in user: PUT adds from `catalog`, DELETE
// removes, and GET lists newest first. `fail` answers a write with a fixed response instead.
export function fakeFavorites({
  saved = [],
  catalog = [],
  fail,
}: {
  saved?: FavoriteItem[]
  catalog?: FavoriteMenuItem[]
  fail?: () => Response
} = {}) {
  let items = [...saved]

  const handle: NonNullable<FakeApiOptions['handle']> = (method, url) => {
    if (url.pathname === '/api/favorites' && method === 'GET') {
      return jsonResponse(200, { data: { items } })
    }
    const match = /^\/api\/favorites\/([^/]+)$/.exec(url.pathname)
    if (!match || (method !== 'PUT' && method !== 'DELETE')) return undefined
    if (fail) return fail()

    const menuItemId = decodeURIComponent(match[1]!)
    const known = items.some((item) => item.menuItemId === menuItemId)
    if (method === 'DELETE') {
      items = items.filter((item) => item.menuItemId !== menuItemId)
    } else if (!known) {
      const menuItem = catalog.find(({ id }) => id === menuItemId)
      if (!menuItem) throw new Error(`Unknown menu item ${menuItemId}.`)
      items = [favoriteItem(menuItem), ...items]
    }
    return jsonResponse(200, {
      data: { menuItemId, favorited: method === 'PUT' },
    })
  }

  return { handle, items: () => items }
}
