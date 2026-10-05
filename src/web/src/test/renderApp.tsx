import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { vi } from 'vitest'

import type { CurrentUser } from '@/hooks/auth/useCurrentUser'
import { routes } from '@/router'

export const testUser: CurrentUser = {
  id: 'user_1',
  email: 'user@example.com',
  role: 'USER',
}

export const testAdmin: CurrentUser = {
  id: 'admin_1',
  email: 'admin@example.com',
  role: 'ADMIN',
}

export type RecordedRequest = {
  method: string
  // Pathname plus any query string, e.g. `/api/restaurants?page=2`.
  path: string
  credentials: RequestCredentials
  // Parsed JSON, or undefined for empty and non-JSON (multipart) bodies.
  body: unknown
}

type FakeApiOptions = {
  currentUser?: CurrentUser | null
  loginAs?: CurrentUser
  // Exact `METHOD /path` handlers, matched on the pathname only.
  // A handler may return a promise to hold the response until the test resolves it.
  responses?: Record<string, (body: unknown) => Response | Promise<Response>>
  // Fallback for dynamic paths; return undefined to continue to the built-ins.
  handle?: (method: string, url: URL, body: unknown) => Response | undefined
}

export function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function errorResponse(
  status: number,
  code: string,
  fields?: Record<string, string>,
) {
  return jsonResponse(status, {
    error: { code, message: 'Request failed.', requestId: 'req_test', fields },
  })
}

// Stateful stand-in for the auth API: login/register set the session, logout clears it.
export function fakeAuthApi({
  currentUser = null,
  loginAs = testUser,
  responses = {},
  handle,
}: FakeApiOptions = {}) {
  let sessionUser = currentUser
  const requests: RecordedRequest[] = []

  vi.mocked(fetch).mockImplementation(async (input) => {
    const request = input as Request
    const url = new URL(request.url)
    const isJson = request.headers
      .get('content-type')
      ?.includes('application/json')
    const text = isJson ? await request.text() : ''
    const body: unknown = text ? JSON.parse(text) : undefined
    requests.push({
      method: request.method,
      path: `${url.pathname}${url.search}`,
      credentials: request.credentials,
      body,
    })

    const key = `${request.method} ${url.pathname}`
    const override = responses[key]
    if (override) return override(body)
    const handled = handle?.(request.method, url, body)
    if (handled) return handled

    switch (key) {
      case 'GET /api/auth/me':
        return sessionUser
          ? jsonResponse(200, { data: { user: sessionUser } })
          : errorResponse(401, 'UNAUTHENTICATED')
      case 'POST /api/auth/login':
        sessionUser = loginAs
        return jsonResponse(200, { data: { user: sessionUser } })
      case 'POST /api/auth/register': {
        const { email } = JSON.parse(text) as { email: string }
        sessionUser = { id: 'user_new', email, role: 'USER' }
        return jsonResponse(201, { data: { user: sessionUser } })
      }
      case 'POST /api/auth/logout':
        sessionUser = null
        return new Response(null, { status: 204 })
      default:
        return errorResponse(404, 'NOT_FOUND')
    }
  })

  return { requests }
}

export function renderApp(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, user, queryClient }
}

export function currentPath(router: ReturnType<typeof createMemoryRouter>) {
  const { pathname, search } = router.state.location
  return `${pathname}${search}`
}
