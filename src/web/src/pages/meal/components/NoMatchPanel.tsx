import { PencilSimple, Shuffle } from '@phosphor-icons/react'
import type { Ref } from 'react'

import { Button } from '@/components/Button'
import {
  suggestionMessage,
  type Suggestion,
} from '@/schemas/meal/recommendationSchemas'

type NoMatchPanelProps = {
  // The filter changes the API proved have results, or null when no menu is available.
  suggestion: Suggestion | null
  // A re-shuffle with the suggested conditions is in flight.
  shuffling: boolean
  headingRef: Ref<HTMLHeadingElement>
  onApplySuggestion: () => void
  onEditConditions: () => void
}

// Shown when the first shuffle finds nothing. It never invents a result or changes a condition
// silently, and it has no Home action: the header brand already leads home.
export function NoMatchPanel({
  suggestion,
  shuffling,
  headingRef,
  onApplySuggestion,
  onEditConditions,
}: NoMatchPanelProps) {
  return (
    <section className="flex flex-col gap-4 rounded-md border-2 border-paper bg-glass p-5 shadow-md">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-card-title leading-tight"
      >
        ไม่พบเมนูที่ตรงทุกเงื่อนไข
      </h2>
      <p role="status">
        {suggestion
          ? suggestionMessage(suggestion)
          : 'ตอนนี้ยังไม่มีเมนูในระบบที่ตรงกับเงื่อนไขนี้ ลองแก้เงื่อนไขดูอีกครั้ง'}
      </p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          disabled={shuffling}
          onClick={onEditConditions}
        >
          <PencilSimple aria-hidden weight="bold" />
          แก้เงื่อนไขเอง
        </Button>
        {suggestion ? (
          <Button
            disabled={shuffling}
            aria-busy={shuffling}
            onClick={onApplySuggestion}
          >
            <Shuffle aria-hidden weight="bold" />
            {shuffling ? 'กำลังสับการ์ดเมนู...' : 'ใช้เงื่อนไขนี้แล้วสับใหม่'}
          </Button>
        ) : null}
      </div>
    </section>
  )
}
