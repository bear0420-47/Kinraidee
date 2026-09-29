import type { RefObject } from 'react'

import { ApiError } from '@/api/apiError'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === 'FOOD_TYPE_IN_USE') {
    return 'ยังลบประเภทอาหารนี้ไม่ได้ เพราะมีเมนูใช้งานอยู่ กรุณาย้ายเมนูไปประเภทอื่นก่อน'
  }
  return 'ลบประเภทอาหารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

type DeleteFoodTypeDialogProps = {
  foodType: FoodType
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function DeleteFoodTypeDialog({
  foodType,
  ...props
}: DeleteFoodTypeDialogProps) {
  return (
    <ConfirmDeleteDialog
      title="ลบประเภทอาหารนี้?"
      confirmLabel="ลบประเภทอาหาร"
      getErrorMessage={getDeleteErrorMessage}
      {...props}
    >
      ประเภทอาหาร <strong>{foodType.name.th}</strong> ({foodType.name.en})
      จะถูกลบออกจากระบบและย้อนกลับไม่ได้
    </ConfirmDeleteDialog>
  )
}
