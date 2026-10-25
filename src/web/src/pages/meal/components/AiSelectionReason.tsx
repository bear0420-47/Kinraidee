import { Sparkle } from '@phosphor-icons/react'

import type { RecommendationItem } from '@/schemas/meal/recommendationSchemas'

export function AiSelectionReason({
  selection,
}: {
  selection: RecommendationItem['selection']
}) {
  if (selection.source !== 'AI' || !selection.reasonTh) return null
  return (
    <div className="rounded-sm border-2 border-paper bg-cream p-3 text-small">
      <p className="mb-1 inline-flex items-center gap-1 font-extrabold">
        <Sparkle aria-hidden size={17} weight="fill" />
        AI เลือกให้
      </p>
      <p>{selection.reasonTh}</p>
    </div>
  )
}
