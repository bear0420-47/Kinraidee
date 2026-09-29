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

type RecordedRequest = {
  method: string
  path: string
  credentials: RequestCredentials
  body: unknown
}

type FakeApiOptions = {
  currentUser?: CurrentUser | null
  loginAs?: CurrentUser
  responses?: Record<string, (body: unknown) => Response>
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
}: FakeApiOptions = {}) {
  let sessionUser = currentUser
  const requests: RecordedRequest[] = []

  vi.mocked(fetch).mockImplementation(async (input) => {
    const request = input as Request
    const path = new URL(request.url).pathname
    const text = await request.text()
    const body: unknown = text ? JSON.parse(text) : undefined
    requests.push({
      method: request.method,
      path,
      credentials: request.credentials,
      body,
    })

    const key = `${request.method} ${path}`
    const override = responses[key]
    if (override) return override(body)

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
