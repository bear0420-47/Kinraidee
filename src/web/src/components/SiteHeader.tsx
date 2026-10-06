import { House } from '@phosphor-icons/react'
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

  // The brand also links Home, but people miss it, so every other page gets a visible link.
  const showHomeLink = location.pathname !== '/'
  // Links that share one phone-width row lose some side padding; three (an admin away from
  // Home) also use the small text size so they still fit beside the brand.
  const linkCount = actions.length + (showHomeLink ? 1 : 0)
  const phoneLinkClass =
    linkCount > 2
      ? 'max-sm:px-2 max-sm:text-small'
      : linkCount > 1
        ? 'max-sm:px-3'
        : ''

  return (
    <header className="border-b-2 border-paper bg-canvas">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-2 px-4 sm:gap-4 py-3">
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
            {showHomeLink ? (
              <Link
                to="/"
                aria-label="หน้าแรก"
                className={`${buttonClassName('ghost')} ${phoneLinkClass}`}
              >
                <House aria-hidden weight="bold" />
                {/* Phone width keeps only the icon, so the links still fit on one row. */}
                <span aria-hidden className="max-sm:hidden">
                  หน้าแรก
                </span>
              </Link>
            ) : null}
            {actions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`${buttonClassName('ghost')} ${phoneLinkClass}`}
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
