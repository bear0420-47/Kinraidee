import { PencilSimple, Shuffle } from '@phosphor-icons/react'
import type { Ref } from 'react'

import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import {
  ANY_LABEL,
  ANY_ZONE_LABEL,
  budgetLabels,
  type ConditionStep,
  type RecommendationConditions,
  type Suggestion,
} from '@/schemas/meal/recommendationSchemas'
import { StepFooter } from './StepFooter'
import { NoMatchPanel } from './NoMatchPanel'

type NamedRecord = { id: string; name: { th: string } }

type ConditionSummaryProps = {
  conditions: RecommendationConditions
  tastes: NamedRecord[]
  foodTypes: NamedRecord[]
  zones: NamedRecord[]
  // A shuffle request is in flight.
  shuffling: boolean
  onEdit: (step: ConditionStep) => void
} & (
  | { compact: true }
  | {
      compact?: false
      headingRef: Ref<HTMLHeadingElement>
      // Why the last shuffle failed, if it did.
      shuffleError: string | null
      noMatch?: { suggestion: Suggestion | null } | null
      onBack: () => void
      onShuffle: () => void
    }
)

function nameOf(records: NamedRecord[], id: string | null, anyLabel: string) {
  if (id === null) return anyLabel
  return records.find((record) => record.id === id)?.name.th ?? anyLabel
}

export function ConditionSummary(props: ConditionSummaryProps) {
  const { conditions, tastes, foodTypes, zones, shuffling, onEdit } = props
  const rows: { step: ConditionStep; label: string; value: string }[] = [
    {
      step: 'budget',
      label: 'งบประมาณ',
      value: budgetLabels[conditions.budget],
    },
    {
      step: 'taste',
      label: 'รสชาติ',
      value: nameOf(tastes, conditions.tasteId, ANY_LABEL),
    },
    {
      step: 'foodType',
      label: 'ประเภทอาหาร',
      value: nameOf(foodTypes, conditions.foodTypeId, ANY_LABEL),
    },
    {
      step: 'zone',
      label: 'พื้นที่',
      value: nameOf(zones, conditions.zoneId, ANY_ZONE_LABEL),
    },
  ]

  if (props.compact) {
    return (
      <nav aria-label="ตัวเลือกมื้อนี้" className="flex flex-wrap gap-2">
        {rows.map(({ step, label, value }) => (
          <Button
            key={step}
            variant="ghost"
            size="compact"
            className="min-h-11 max-w-full text-left text-small"
            aria-label={`แก้ไข${label}: ${value}`}
            disabled={shuffling}
            onClick={() => onEdit(step)}
          >
            <span className="min-w-0 break-words">
              <span className="text-muted">{label}: </span>
              {value}
            </span>
            <PencilSimple aria-hidden weight="bold" className="shrink-0" />
          </Button>
        ))}
      </nav>
    )
  }

  const { headingRef, shuffleError, noMatch = null, onBack, onShuffle } = props
  return (
    <section className="flex flex-col gap-5 rounded-lg border-2 border-paper bg-glass p-4 shadow-lg sm:p-6">
      <div className="flex flex-col gap-1">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="pt-1 font-display text-card-title leading-snug"
        >
          {noMatch ? 'ยังไม่มีเมนูตรงที่เลือกเลย' : 'เช็กก่อนหาเมนู'}
        </h2>
        <p className="text-small text-muted">ถ้าโอเคแล้ว ไปหาเมนูกันเลย</p>
      </div>

      {noMatch ? <NoMatchPanel suggestion={noMatch.suggestion} /> : null}

      <dl className="flex flex-col divide-y-2 divide-line-soft rounded-sm border-2 border-line-soft">
        {rows.map(({ step, label, value }) => (
          <div
            key={step}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex flex-col">
              <dt className="text-small text-muted">{label}</dt>
              <dd className="font-bold">{value}</dd>
            </div>
            <Button
              variant="ghost"
              size="compact"
              aria-label={`แก้ไข${label}`}
              onClick={() => onEdit(step)}
              disabled={shuffling}
            >
              <PencilSimple aria-hidden weight="bold" />
              แก้ไข
            </Button>
          </div>
        ))}
      </dl>

      {shuffleError ? <FormAlert message={shuffleError} /> : null}
      <p role="status" className="sr-only">
        {shuffling ? 'กำลังหาเมนูให้นะ…' : ''}
      </p>

      {!noMatch || noMatch.suggestion ? (
        <StepFooter
          onBack={noMatch ? undefined : onBack}
          backDisabled={shuffling}
        >
          <Button
            disabled={shuffling}
            aria-busy={shuffling}
            onClick={onShuffle}
          >
            <Shuffle aria-hidden weight="bold" />
            {shuffling
              ? 'กำลังหาเมนูให้นะ…'
              : noMatch
                ? 'ใช้เงื่อนไขนี้แล้วสับใหม่'
                : 'หาเมนูกัน'}
          </Button>
        </StepFooter>
      ) : null}
    </section>
  )
}
