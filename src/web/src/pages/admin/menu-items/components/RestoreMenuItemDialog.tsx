import { ArrowCounterClockwise } from '@phosphor-icons/react'
import type { RefObject } from 'react'

import { ApiError } from '@/api/apiError'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  isRestaurantDeleted,
  type MenuItem,
} from '@/schemas/admin/menu-items/menuItemSchemas'

const RESTAURANT_DELETED_MESSAGE =
  'ยังกู้คืนเมนูนี้ไม่ได้ เพราะร้านอาหารของเมนูถูกลบอยู่'

function getRestoreErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === 'RESTAURANT_DELETED') {
    return RESTAURANT_DELETED_MESSAGE
  }
  if (error instanceof ApiError && error.status === 404) {
    return 'ไม่พบเมนูนี้แล้ว'
  }
  return 'กู้คืนเมนูไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

type RestoreMenuItemDialogProps = {
  menuItem: MenuItem
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

// Restoring needs an active Restaurant; while it is deleted the dialog explains why instead.
export function RestoreMenuItemDialog({
  menuItem,
  ...props
}: RestoreMenuItemDialogProps) {
  const blocked = isRestaurantDeleted(menuItem)

  return (
    <ConfirmDialog
      title="กู้คืนเมนูนี้?"
      confirmLabel="กู้คืนเมนู"
      pendingLabel="กำลังกู้คืน…"
      icon={<ArrowCounterClockwise aria-hidden weight="bold" />}
      getErrorMessage={getRestoreErrorMessage}
      confirmDisabled={blocked}
      {...props}
    >
      <p>
        เมนู <strong>{menuItem.name.th}</strong> ({menuItem.name.en}) ของร้าน{' '}
        {menuItem.restaurant.name.th} จะกลับมาใช้งานในการสุ่มเมนูอีกครั้ง
      </p>
      {blocked ? (
        <p className="font-bold text-rust">{RESTAURANT_DELETED_MESSAGE}</p>
      ) : null}
    </ConfirmDialog>
  )
}
