import { ArrowLeft } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

import { Button } from '@/components/Button'

type StepFooterProps = {
  // Omitted on the first step; the forward action then keeps its place on the right.
  onBack?: (() => void) | undefined
  // The forward action, such as `ถัดไป` or `สับการ์ดเมนู`.
  children: ReactNode
}

// The back/forward row shared by every step of the meal flow, so the buttons sit in the
// same place from step to step.
export function StepFooter({ onBack, children }: StepFooterProps) {
  return (
    <div className="mt-2 flex flex-col-reverse gap-3 border-t-2 border-line-soft pt-5 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft aria-hidden weight="bold" />
          ย้อนกลับ
        </Button>
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}
      {children}
    </div>
  )
}
