import { CheckCircle } from '@phosphor-icons/react'

import {
  rationaleLines,
  type RecommendationItem,
} from '@/schemas/meal/recommendationSchemas'

// Why this menu was recommended, in the localized copy from `rationaleLines`.
export function RationaleList({
  rationale,
}: {
  rationale: RecommendationItem['rationale']
}) {
  return (
    <ul aria-label="เหตุผลที่แนะนำ" className="flex flex-col gap-1 text-small">
      {rationaleLines(rationale).map((line) => (
        <li key={line} className="flex items-center gap-2">
          <CheckCircle aria-hidden size={18} weight="bold" />
          {line}
        </li>
      ))}
    </ul>
  )
}
