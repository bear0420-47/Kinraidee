import { Link, useLocation } from 'react-router'

import { buttonClassName } from '@/components/Button'
import { useCurrentUser } from '@/hooks/auth/useCurrentUser'
import { buildAuthPath } from '@/lib/authRedirects'

export function SiteHeader() {
  const { data: user, isPending } = useCurrentUser()
  const location = useLocation()

  const loginPath = ['/login', '/register'].includes(location.pathname)
    ? `/login${location.search}`
    : buildAuthPath('/login', `${location.pathname}${location.search}`)

  const action = !user
    ? { to: loginPath, label: 'เข้าสู่ระบบ' }
    : user.role === 'ADMIN'
      ? { to: '/admin', label: 'จัดการระบบ' }
      : { to: '/account', label: 'บัญชีของฉัน' }

  return (
    <header className="border-b-2 border-paper bg-canvas">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/"
          className="rounded-md font-brand text-card-title leading-none"
        >
          Kinraidee
        </Link>
        {isPending ? null : (
          <Link to={action.to} className={buttonClassName('ghost')}>
            {action.label}
          </Link>
        )}
      </div>
    </header>
  )
}
