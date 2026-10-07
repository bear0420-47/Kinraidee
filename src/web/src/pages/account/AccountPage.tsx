import { Link, useLocation } from 'react-router'

import { LogoutButton } from '@/components/LogoutButton'
import { NavLinkList } from '@/components/NavLinkList'
import { PageShell } from '@/components/PageShell'
import type { AccountNotice } from '@/components/RequireAuth'

const accountLinks = [
  { to: '/account/favorites', label: 'เมนูโปรด' },
  { to: '/account/history', label: 'ประวัติเมนูที่เลือก' },
  { to: '/account/preferences', label: 'ค่าเริ่มต้นการสุ่มเมนู' },
]

function readNotice(state: unknown): AccountNotice | null {
  if (typeof state === 'object' && state !== null && 'notice' in state) {
    return state.notice === 'ADMIN_FORBIDDEN' ? 'ADMIN_FORBIDDEN' : null
  }
  return null
}

export function AccountPage() {
  const location = useLocation()
  const notice = readNotice(location.state)

  return (
    <PageShell title="บัญชีของฉัน">
      {notice === 'ADMIN_FORBIDDEN' ? (
        <p
          role="status"
          className="rounded-sm border-2 border-paper bg-cream p-3 font-bold"
        >
          บัญชีนี้ไม่มีสิทธิ์จัดการระบบ
        </p>
      ) : null}
      <NavLinkList label="เมนูบัญชี" links={accountLinks} />
      <LogoutButton />
      <Link to="/" className="self-start rounded-xs font-bold underline">
        กลับหน้าแรก
      </Link>
    </PageShell>
  )
}
