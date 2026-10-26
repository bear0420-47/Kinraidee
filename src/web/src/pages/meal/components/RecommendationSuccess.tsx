import { Confetti, House } from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/Button'
import type { RecommendationItem } from '@/schemas/meal/recommendationSchemas'

export function successMessage(item: RecommendationItem) {
  return `มื้อนี้ ${item.name.th} จาก ${item.restaurant.name.th} กินให้อร่อยนะ!`
}

type RecommendationSuccessProps = {
  item: RecommendationItem
  // Saving the selection to history failed; the decision itself still stands.
  historyFailed: boolean
  onFinish: () => void
}

// The confirmed decision. `กลับหน้าหลัก` is its only action, so it receives focus.
export function RecommendationSuccess({
  item,
  historyFailed,
  onFinish,
}: RecommendationSuccessProps) {
  const homeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => homeRef.current?.focus(), [])

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Confetti aria-hidden size={56} weight="bold" />
      {/* Announced through the dialog's status region instead. */}
      <p aria-hidden className="font-bold">
        {successMessage(item)}
      </p>
      {historyFailed ? (
        <p
          role="alert"
          className="rounded-sm border-2 border-rust bg-peach-deep px-3 py-2 text-small font-bold text-rust"
        >
          ได้เมนูแล้ว แต่บันทึกประวัติไม่สำเร็จนะ
        </p>
      ) : null}
      <Button ref={homeRef} onClick={onFinish}>
        <House aria-hidden weight="bold" />
        กลับหน้าหลัก
      </Button>
    </div>
  )
}
