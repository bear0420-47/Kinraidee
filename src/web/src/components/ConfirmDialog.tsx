import { useState, type ReactNode, type RefObject } from 'react'

import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { FormAlert } from '@/components/FormAlert'

type ConfirmDialogProps = {
  title: string
  confirmLabel: string
  pendingLabel: string
  // Decorative icon shown before the confirm label.
  icon: ReactNode
  children: ReactNode
  getErrorMessage: (error: unknown) => string
  onConfirm: () => Promise<unknown>
  onClose: () => void
  fallbackFocusRef?: RefObject<HTMLElement | null>
}

// Confirmation for an irreversible or significant action; failures stay in the dialog.
export function ConfirmDialog({
  title,
  confirmLabel,
  pendingLabel,
  icon,
  children,
  getErrorMessage,
  onConfirm,
  onClose,
  fallbackFocusRef,
}: ConfirmDialogProps) {
  const [attempts, setAttempts] = useState(0)
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function confirm() {
    setAttempts((count) => count + 1)
    setIsPending(true)
    setErrorMessage(null)
    try {
      await onConfirm()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      setIsPending(false)
    }
  }

  return (
    <Dialog
      title={title}
      onClose={onClose}
      {...(fallbackFocusRef ? { fallbackFocusRef } : {})}
    >
      {errorMessage ? (
        <FormAlert key={attempts} message={errorMessage} />
      ) : null}
      <div className="flex flex-col gap-2">{children}</div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button disabled={isPending} aria-busy={isPending} onClick={confirm}>
          {icon}
          {isPending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
