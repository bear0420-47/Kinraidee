import { Navigate, Outlet, useSearchParams } from 'react-router'

import { RouteStatus } from '@/components/RouteStatus'
import { useCurrentUser } from '@/hooks/auth/useCurrentUser'
import { getPostLoginPath } from '@/lib/authRedirects'

// Also completes login/registration: once the user is cached, this sends them on.
export function RedirectIfAuthenticated() {
  const { data: user, isPending } = useCurrentUser()
  const [searchParams] = useSearchParams()

  if (isPending) return <RouteStatus message="กำลังตรวจสอบบัญชี…" />
  if (user) {
    return (
      <Navigate
        replace
        to={getPostLoginPath(searchParams.get('returnTo'), user.role)}
      />
    )
  }

  return <Outlet />
}
