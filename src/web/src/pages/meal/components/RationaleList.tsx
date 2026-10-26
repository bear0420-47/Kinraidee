import { CheckCircle, WarningCircle } from '@phosphor-icons/react'

import {
  rationaleLines,
  type RecommendationItem,
} from '@/schemas/meal/recommendationSchemas'

// Why this menu was recommended, in the localized copy from `rationaleLines`.
export function RationaleList({
  rationale,
  differences = [],
  compact = false,
}: {
  rationale: RecommendationItem['rationale']
  differences?: string[]
  compact?: boolean
}) {
  const alternative = differences.length > 0
  const Icon = alternative ? WarningCircle : CheckCircle
  return (
    <ul
      aria-label={alternative ? 'ต่างจากเงื่อนไขที่เลือก' : 'เหตุผลที่แนะนำ'}
      className={
        'flex text-small ' +
        (compact && !alternative
          ? 'flex-wrap gap-x-3 gap-y-1'
          : 'flex-col gap-1') +
        (alternative ? ' text-rust' : '')
      }
    >
      {(alternative ? differences : rationaleLines(rationale, compact)).map(
        (line) => (
          <li key={line} className="flex items-center gap-2">
            <Icon aria-hidden size={18} weight="bold" className="shrink-0" />
            {line}
          </li>
        ),
      )}
    </ul>
  )
}
