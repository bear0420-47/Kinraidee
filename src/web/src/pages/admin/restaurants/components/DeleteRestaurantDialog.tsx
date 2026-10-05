import type { RefObject } from 'react'

import { ApiError } from '@/api/apiError'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import type { Restaurant } from '@/schemas/admin/restaurants/restaurantSchemas'

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return 'ไม่พบร้านนี้แล้ว อาจถูกลบไปก่อนหน้านี้'
  }
  return 'ลบร้านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

type DeleteRestaurantDialogProps = {
  restaurant: Restaurant
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

// Soft delete: the restaurant and its images stay stored and can be restored.
export function DeleteRestaurantDialog({
  restaurant,
  ...props
}: DeleteRestaurantDialogProps) {
  return (
    <ConfirmDeleteDialog
      title="ลบร้านนี้?"
      confirmLabel="ลบร้าน"
      getErrorMessage={getDeleteErrorMessage}
      {...props}
    >
      <p>
        ร้าน <strong>{restaurant.name.th}</strong> ({restaurant.name.en})
        จะถูกซ่อนจากระบบ และกู้คืนได้ภายหลัง
      </p>
      <p className="font-bold">
        เมนูทั้งหมดของร้านนี้จะถูกซ่อนจากการสุ่มเมนูด้วย
      </p>
    </ConfirmDeleteDialog>
  )
}
