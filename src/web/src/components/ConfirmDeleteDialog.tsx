import { Trash } from '@phosphor-icons/react'
import type { ReactNode, RefObject } from 'react'

import { ConfirmDialog } from '@/components/ConfirmDialog'

type ConfirmDeleteDialogProps = {
  title: string
  confirmLabel: string
  children: ReactNode
  getErrorMessage: (error: unknown) => string
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function ConfirmDeleteDialog(props: ConfirmDeleteDialogProps) {
  return (
    <ConfirmDialog
      pendingLabel="กำลังลบ…"
      icon={<Trash aria-hidden weight="bold" />}
      {...props}
    />
  )
}
