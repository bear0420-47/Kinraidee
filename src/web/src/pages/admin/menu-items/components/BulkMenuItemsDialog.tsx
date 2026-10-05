import { ArrowCounterClockwise, Trash } from '@phosphor-icons/react'
import type { RefObject } from 'react'

import { ApiError } from '@/api/apiError'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { BULK_RESTORE_BLOCKED_MESSAGE } from './MenuItemBulkActions'

type BulkAction = 'delete' | 'restore'

const copy = {
  delete: {
    title: 'ลบเมนูที่เลือก?',
    confirmLabel: 'ลบเมนูที่เลือก',
    pendingLabel: 'กำลังลบ…',
    body: 'เมนูที่เลือกจะถูกซ่อนจากการสุ่มเมนู และกู้คืนได้ภายหลัง',
    failed: 'ลบเมนูที่เลือกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
  },
  restore: {
    title: 'กู้คืนเมนูที่เลือก?',
    confirmLabel: 'กู้คืนเมนูที่เลือก',
    pendingLabel: 'กำลังกู้คืน…',
    body: 'เมนูที่เลือกจะกลับมาใช้งานในการสุ่มเมนูอีกครั้ง',
    failed: 'กู้คืนเมนูที่เลือกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
  },
} satisfies Record<BulkAction, Record<string, string>>

function getBulkErrorMessage(action: BulkAction, error: unknown) {
  if (error instanceof ApiError && error.code === 'RESTAURANT_DELETED') {
    return BULK_RESTORE_BLOCKED_MESSAGE
  }
  if (error instanceof ApiError && 'ids' in error.fields) {
    return 'มีเมนูที่เลือกบางรายการไม่อยู่ในระบบแล้ว กรุณาโหลดรายการใหม่'
  }
  return copy[action].failed
}

type BulkMenuItemsDialogProps = {
  action: BulkAction
  count: number
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function BulkMenuItemsDialog({
  action,
  count,
  ...props
}: BulkMenuItemsDialogProps) {
  const text = copy[action]

  return (
    <ConfirmDialog
      title={text.title}
      confirmLabel={text.confirmLabel}
      pendingLabel={text.pendingLabel}
      icon={
        action === 'delete' ? (
          <Trash aria-hidden weight="bold" />
        ) : (
          <ArrowCounterClockwise aria-hidden weight="bold" />
        )
      }
      getErrorMessage={(error) => getBulkErrorMessage(action, error)}
      {...props}
    >
      <p>
        เลือกเมนูแล้ว <strong>{count}</strong> รายการ
      </p>
      <p className="font-bold">{text.body}</p>
    </ConfirmDialog>
  )
}
