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

  // Admins also have favorites, history, and saved defaults, so they get both links.
  const accountLink = { to: '/account', label: 'บัญชีของฉัน' }
  const actions = !user
    ? [{ to: loginPath, label: 'เข้าสู่ระบบ' }]
    : user.role === 'ADMIN'
      ? [accountLink, { to: '/admin', label: 'จัดการระบบ' }]
      : [accountLink]

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
          <nav
            aria-label="เมนูหลัก"
            className="flex flex-wrap justify-end gap-1"
          >
            {actions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                // Two links share one phone-width row, so they lose some side padding.
                className={`${buttonClassName('ghost')} ${actions.length > 1 ? 'max-sm:px-3' : ''}`}
              >
                {action.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
