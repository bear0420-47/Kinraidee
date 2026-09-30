import type { RefObject } from 'react'

import { ApiError } from '@/api/apiError'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import type { Taste } from '@/schemas/admin/tastes/tasteSchemas'

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === 'TASTE_IN_USE') {
    return 'ยังลบรสชาตินี้ไม่ได้ เพราะมีเมนูใช้งานอยู่ กรุณาแก้ไขเมนูที่ใช้รสชาตินี้ก่อน'
  }
  return 'ลบรสชาติไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

type DeleteTasteDialogProps = {
  taste: Taste
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function DeleteTasteDialog({ taste, ...props }: DeleteTasteDialogProps) {
  return (
    <ConfirmDeleteDialog
      title="ลบรสชาตินี้?"
      confirmLabel="ลบรสชาติ"
      getErrorMessage={getDeleteErrorMessage}
      {...props}
    >
      รสชาติ <strong>{taste.name.th}</strong> ({taste.name.en})
      จะถูกลบออกจากระบบและย้อนกลับไม่ได้
    </ConfirmDeleteDialog>
  )
}
