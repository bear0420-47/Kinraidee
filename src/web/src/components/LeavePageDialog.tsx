import { SignOut } from '@phosphor-icons/react'

import { ConfirmDialog } from '@/components/ConfirmDialog'

type LeavePageDialogProps = {
  // What will be lost, such as `ข้อมูลร้านที่ยังไม่บันทึกจะหายไป`.
  message: string
  onLeave: () => Promise<unknown>
  onStay: () => void
}

// Shown when navigation is blocked because an open form has unsaved input.
export function LeavePageDialog({
  message,
  onLeave,
  onStay,
}: LeavePageDialogProps) {
  return (
    <ConfirmDialog
      title="ออกจากหน้านี้?"
      confirmLabel="ออกจากหน้านี้"
      pendingLabel="กำลังออก…"
      icon={<SignOut aria-hidden weight="bold" />}
      getErrorMessage={() => 'ออกจากหน้านี้ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'}
      onConfirm={onLeave}
      onClose={onStay}
    >
      <p>{message}</p>
    </ConfirmDialog>
  )
}
