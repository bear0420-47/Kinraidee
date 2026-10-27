import { ArrowLeft } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router'

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
  const navigate = useNavigate()
  const notice = readNotice(location.state)

  function goBack() {
    const historyIndex = window.history.state?.idx
    navigate(typeof historyIndex === 'number' && historyIndex > 0 ? -1 : '/')
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-xs text-small font-bold underline sm:text-body"
        onClick={goBack}
      >
        <ArrowLeft aria-hidden weight="bold" />
        ย้อนกลับ
      </button>
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
      </PageShell>
    </div>
  )
}
