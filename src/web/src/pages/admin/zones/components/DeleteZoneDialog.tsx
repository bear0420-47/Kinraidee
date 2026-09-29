import { Trash } from '@phosphor-icons/react'
import { useState, type RefObject } from 'react'

import { ApiError } from '@/api/apiError'
import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { FormAlert } from '@/components/FormAlert'
import type { Zone } from '@/schemas/admin/zones/zoneSchemas'

const ZONE_IN_USE_MESSAGE =
  'ยังลบโซนนี้ไม่ได้ เพราะมีร้านอาหารใช้งานอยู่ กรุณาย้ายร้านไปโซนอื่นก่อน'

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === 'ZONE_IN_USE') {
    return ZONE_IN_USE_MESSAGE
  }
  return 'ลบโซนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

type DeleteZoneDialogProps = {
  zone: Zone
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function DeleteZoneDialog({
  zone,
  onConfirm,
  onClose,
  fallbackFocusRef,
}: DeleteZoneDialogProps) {
  const [attempts, setAttempts] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function confirm() {
    setAttempts((count) => count + 1)
    setIsDeleting(true)
    setErrorMessage(null)
    try {
      await onConfirm()
    } catch (error) {
      setErrorMessage(getDeleteErrorMessage(error))
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      title="ลบโซนนี้?"
      onClose={onClose}
      fallbackFocusRef={fallbackFocusRef}
    >
      {errorMessage ? (
        <FormAlert key={attempts} message={errorMessage} />
      ) : null}
      <p>
        โซน <strong>{zone.name.th}</strong> ({zone.name.en})
        จะถูกลบออกจากระบบและย้อนกลับไม่ได้
      </p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button disabled={isDeleting} aria-busy={isDeleting} onClick={confirm}>
          <Trash aria-hidden weight="bold" />
          {isDeleting ? 'กำลังลบ…' : 'ลบโซน'}
        </Button>
      </div>
    </Dialog>
  )
}
