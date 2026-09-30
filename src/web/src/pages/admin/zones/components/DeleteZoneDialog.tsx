import type { RefObject } from 'react'

import { ApiError } from '@/api/apiError'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import type { Zone } from '@/schemas/admin/zones/zoneSchemas'

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === 'ZONE_IN_USE') {
    return 'ยังลบโซนนี้ไม่ได้ เพราะมีร้านอาหารใช้งานอยู่ กรุณาย้ายร้านไปโซนอื่นก่อน'
  }
  return 'ลบโซนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

type DeleteZoneDialogProps = {
  zone: Zone
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function DeleteZoneDialog({ zone, ...props }: DeleteZoneDialogProps) {
  return (
    <ConfirmDeleteDialog
      title="ลบโซนนี้?"
      confirmLabel="ลบโซน"
      getErrorMessage={getDeleteErrorMessage}
      {...props}
    >
      โซน <strong>{zone.name.th}</strong> ({zone.name.en})
      จะถูกลบออกจากระบบและย้อนกลับไม่ได้
    </ConfirmDeleteDialog>
  )
}
