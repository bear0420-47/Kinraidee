import {
  fakeAuthApi,
  jsonResponse,
  testAdmin,
  type RecordedRequest,
} from '@/test/renderApp'

type CollectionItem = { id: string }

type FakeCollectionApiOptions<Item extends CollectionItem> = {
  // Resource path such as `/api/zones`; item routes are `${path}/${id}`.
  path: string
  // Envelope key for single-item responses, such as `zone` in `{ data: { zone } }`.
  itemKey: string
  items: Item[]
  // Builds the created item from the POST body, applying API defaults.
  create: (body: unknown) => Item
  overrides?: Record<string, (body: unknown) => Response>
}

// Stateful list/create/update/delete API for an ADMIN session, for admin page tests.
export function fakeCollectionApi<Item extends CollectionItem>({
  path,
  itemKey,
  items: initialItems,
  create,
  overrides = {},
}: FakeCollectionApiOptions<Item>) {
  let items = [...initialItems]
  const responses: Record<string, (body: unknown) => Response> = {
    [`GET ${path}`]: () => jsonResponse(200, { data: { items } }),
    [`POST ${path}`]: (body) => {
      const item = create(body)
      items = [...items, item]
      return jsonResponse(201, { data: { [itemKey]: item } })
    },
  }

  for (const { id } of initialItems) {
    responses[`PATCH ${path}/${id}`] = (body) => {
      const current = items.find((item) => item.id === id)
      const updated = { ...current, ...(body as Partial<Item>) } as Item
      items = items.map((item) => (item.id === id ? updated : item))
      return jsonResponse(200, { data: { [itemKey]: updated } })
    }
    responses[`DELETE ${path}/${id}`] = () => {
      items = items.filter((item) => item.id !== id)
      return new Response(null, { status: 204 })
    }
  }

  const api = fakeAuthApi({
    currentUser: testAdmin,
    responses: { ...responses, ...overrides },
  })

  return {
    ...api,
    requestsFor: (method: string): RecordedRequest[] =>
      api.requests.filter(
        (request) => request.method === method && request.path.startsWith(path),
      ),
  }
}
