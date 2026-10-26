import { PencilSimple } from '@phosphor-icons/react'
import type { Ref } from 'react'

import { Button } from '@/components/Button'
type NoMatchPanelProps = {
  headingRef: Ref<HTMLHeadingElement>
  onEditConditions: () => void
}

// Shown only when no active photographed menu remains after exclusions.
export function NoMatchPanel({
  headingRef,
  onEditConditions,
}: NoMatchPanelProps) {
  return (
    <section className="flex flex-col gap-4 rounded-md border-2 border-paper bg-glass p-5 shadow-md">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-card-title leading-tight"
      >
        ยังไม่มีเมนูที่แนะนำได้
      </h2>
      <p role="status">
        ตอนนี้ยังไม่มีเมนูในระบบที่สามารถนำมาแนะนำได้ ลองแก้เงื่อนไขดูอีกครั้ง
      </p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onEditConditions}>
          <PencilSimple aria-hidden weight="bold" />
          แก้เงื่อนไขเอง
        </Button>
      </div>
    </section>
  )
}
