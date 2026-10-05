import type { RefObject } from 'react'

import { ApiError } from '@/api/apiError'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import type { MenuItem } from '@/schemas/admin/menu-items/menuItemSchemas'

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return 'ไม่พบเมนูนี้แล้ว อาจถูกลบไปก่อนหน้านี้'
  }
  return 'ลบเมนูไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

type DeleteMenuItemDialogProps = {
  menuItem: MenuItem
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

// Soft delete: the item and its image stay stored and can be restored.
export function DeleteMenuItemDialog({
  menuItem,
  ...props
}: DeleteMenuItemDialogProps) {
  return (
    <ConfirmDeleteDialog
      title="ลบเมนูนี้?"
      confirmLabel="ลบเมนู"
      getErrorMessage={getDeleteErrorMessage}
      {...props}
    >
      <p>
        เมนู <strong>{menuItem.name.th}</strong> ({menuItem.name.en}) ของร้าน{' '}
        {menuItem.restaurant.name.th} จะถูกซ่อนจากระบบ และกู้คืนได้ภายหลัง
      </p>
      <p className="font-bold">เมนูนี้จะถูกซ่อนจากการสุ่มเมนู</p>
    </ConfirmDeleteDialog>
  )
}
