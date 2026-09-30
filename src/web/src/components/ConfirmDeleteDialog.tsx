import { Trash } from '@phosphor-icons/react'
import { useState, type ReactNode, type RefObject } from 'react'

import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { FormAlert } from '@/components/FormAlert'

type ConfirmDeleteDialogProps = {
  title: string
  confirmLabel: string
  children: ReactNode
  getErrorMessage: (error: unknown) => string
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function ConfirmDeleteDialog({
  title,
  confirmLabel,
  children,
  getErrorMessage,
  onConfirm,
  onClose,
  fallbackFocusRef,
}: ConfirmDeleteDialogProps) {
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
      setErrorMessage(getErrorMessage(error))
      setIsDeleting(false)
    }
  }

  return (
    <Dialog title={title} onClose={onClose} fallbackFocusRef={fallbackFocusRef}>
      {errorMessage ? (
        <FormAlert key={attempts} message={errorMessage} />
      ) : null}
      <p>{children}</p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button disabled={isDeleting} aria-busy={isDeleting} onClick={confirm}>
          <Trash aria-hidden weight="bold" />
          {isDeleting ? 'กำลังลบ…' : confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
