import type { Preference } from '@/schemas/preferences/preferenceSchemas'
import { jsonResponse, type FakeApiOptions } from '@/test/renderApp'

// A stateful `/api/preferences` for one signed-in user: PUT replaces, DELETE clears, and GET
// returns the current value. `failSave` answers a PUT with a fixed response instead.
export function fakePreferences({
  saved = null,
  failSave,
}: {
  saved?: Preference | null
  failSave?: () => Response
} = {}) {
  let preference = saved

  const handle: NonNullable<FakeApiOptions['handle']> = (method, url, body) => {
    if (url.pathname !== '/api/preferences') return undefined
    if (method === 'GET') return jsonResponse(200, { data: { preference } })
    if (method === 'PUT') {
      if (failSave) return failSave()
      preference = body as Preference
      return jsonResponse(200, { data: { preference } })
    }
    if (method === 'DELETE') {
      preference = null
      return new Response(null, { status: 204 })
    }
    return undefined
  }

  return { handle, current: () => preference }
}
