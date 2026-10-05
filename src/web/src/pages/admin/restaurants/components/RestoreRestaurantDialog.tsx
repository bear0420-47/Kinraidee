import { ArrowCounterClockwise } from '@phosphor-icons/react'
import type { RefObject } from 'react'

import { ApiError } from '@/api/apiError'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { Restaurant } from '@/schemas/admin/restaurants/restaurantSchemas'

function getRestoreErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return 'ไม่พบร้านนี้แล้ว'
  }
  return 'กู้คืนร้านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

type RestoreRestaurantDialogProps = {
  restaurant: Restaurant
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function RestoreRestaurantDialog({
  restaurant,
  ...props
}: RestoreRestaurantDialogProps) {
  return (
    <ConfirmDialog
      title="กู้คืนร้านนี้?"
      confirmLabel="กู้คืนร้าน"
      pendingLabel="กำลังกู้คืน…"
      icon={<ArrowCounterClockwise aria-hidden weight="bold" />}
      getErrorMessage={getRestoreErrorMessage}
      {...props}
    >
      <p>
        ร้าน <strong>{restaurant.name.th}</strong> ({restaurant.name.en})
        จะกลับมาใช้งานได้อีกครั้ง
      </p>
      <p className="font-bold">
        การกู้คืนร้านจะไม่กู้คืนเมนูที่ถูกลบไว้ ต้องกู้คืนเมนูแยกต่างหาก
      </p>
    </ConfirmDialog>
  )
}
