import { ArrowLeft, Plus } from '@phosphor-icons/react'
import type { ReactNode, Ref } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'

type MasterDataPageShellProps = {
  title: string
  width?: 'wide' | 'extra-wide'
  note: string
  createLabel: string
  onCreate: () => void
  createButtonRef: Ref<HTMLButtonElement>
  // Result of the last create/update/delete, announced through a live region.
  notice: string
  children: ReactNode
}

// Shared frame for the Zone, FoodType, and Taste admin pages.
export function MasterDataPageShell({
  title,
  width = 'wide',
  note,
  createLabel,
  onCreate,
  createButtonRef,
  notice,
  children,
}: MasterDataPageShellProps) {
  return (
    <PageShell title={title} width={width}>
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 self-start rounded-xs font-bold underline"
      >
        <ArrowLeft aria-hidden weight="bold" />
        กลับไปหน้าจัดการระบบ
      </Link>
      <p className="rounded-sm border-2 border-dashed border-line-soft bg-cream p-3 text-small">
        {note}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="font-bold">
          {notice}
        </p>
        <Button ref={createButtonRef} onClick={onCreate}>
          <Plus aria-hidden weight="bold" />
          {createLabel}
        </Button>
      </div>
      {children}
    </PageShell>
  )
}
