import type { UserRole } from '@/hooks/auth/useCurrentUser'

const INTERNAL_ORIGIN = 'http://kinraidee.internal'
const AUTH_PATHS = new Set(['/login', '/register'])

export function getSafeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  // Browsers treat backslashes like slashes, so "/\evil.com" is protocol-relative.
  if (value.includes('\\') || /\p{Cc}/u.test(value)) return null

  const url = new URL(value, INTERNAL_ORIGIN)
  if (url.origin !== INTERNAL_ORIGIN || AUTH_PATHS.has(url.pathname)) {
    return null
  }

  return `${url.pathname}${url.search}${url.hash}`
}

export function getDefaultPathForRole(role: UserRole) {
  return role === 'ADMIN' ? '/admin' : '/account'
}

export function getPostLoginPath(
  returnTo: string | null | undefined,
  role: UserRole,
) {
  return getSafeReturnTo(returnTo) ?? getDefaultPathForRole(role)
}

// Why a page sent the user to log in, passed in router state and announced on the login page.
export type LoginNotice = 'FAVORITE_LOGIN'

export function readLoginNotice(state: unknown): LoginNotice | null {
  if (typeof state === 'object' && state !== null && 'notice' in state) {
    return state.notice === 'FAVORITE_LOGIN' ? 'FAVORITE_LOGIN' : null
  }
  return null
}

export function buildAuthPath(
  page: '/login' | '/register',
  returnTo: string | null | undefined,
) {
  const safeReturnTo = getSafeReturnTo(returnTo)
  if (!safeReturnTo) return page
  return `${page}?${new URLSearchParams({ returnTo: safeReturnTo })}`
}
