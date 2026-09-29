import { Navigate, Outlet, useLocation } from 'react-router'

import { RouteStatus } from '@/components/RouteStatus'
import { useCurrentUser, type UserRole } from '@/hooks/auth/useCurrentUser'
import { buildAuthPath } from '@/lib/authRedirects'

export type AccountNotice = 'ADMIN_FORBIDDEN'

// Guards are UX only; the API enforces roles on every protected request.
export function RequireAuth({ role }: { role?: UserRole }) {
  const { data: user, isPending, isError } = useCurrentUser()
  const location = useLocation()

  if (isPending) return <RouteStatus message="กำลังตรวจสอบบัญชี…" />
  if (isError) {
    return (
      <RouteStatus
        isError
        message="ตรวจสอบสถานะการเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
      />
    )
  }

  if (!user) {
    const requestedPath = `${location.pathname}${location.search}${location.hash}`
    return <Navigate replace to={buildAuthPath('/login', requestedPath)} />
  }

  if (role && user.role !== role) {
    const notice: AccountNotice = 'ADMIN_FORBIDDEN'
    return <Navigate replace to="/account" state={{ notice }} />
  }

  return <Outlet />
}
