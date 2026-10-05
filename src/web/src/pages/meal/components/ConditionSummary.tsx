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
} from '@/schemas/meal/recommendationSchemas'
import { StepFooter } from './StepFooter'

type NamedRecord = { id: string; name: { th: string } }

type ConditionSummaryProps = {
  conditions: RecommendationConditions
  tastes: NamedRecord[]
  foodTypes: NamedRecord[]
  zones: NamedRecord[]
  headingRef: Ref<HTMLHeadingElement>
  // A shuffle request is in flight.
  shuffling: boolean
  // Why the last shuffle failed, if it did.
  shuffleError: string | null
  onEdit: (step: ConditionStep) => void
  onBack: () => void
  onShuffle: () => void
}

function nameOf(records: NamedRecord[], id: string | null, anyLabel: string) {
  if (id === null) return anyLabel
  return records.find((record) => record.id === id)?.name.th ?? anyLabel
}

export function ConditionSummary({
  conditions,
  tastes,
  foodTypes,
  zones,
  headingRef,
  shuffling,
  shuffleError,
  onEdit,
  onBack,
  onShuffle,
}: ConditionSummaryProps) {
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

  return (
    <section className="flex flex-col gap-4 rounded-md border-2 border-paper bg-glass p-5 shadow-md">
      <div className="flex flex-col gap-1">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-card-title leading-tight"
        >
          สรุปมื้อที่ต้องการ
        </h2>
        <p className="text-small text-muted">
          ตรวจคำตอบทั้ง 4 ข้อก่อนสับการ์ดเมนู
        </p>
      </div>

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
            >
              <PencilSimple aria-hidden weight="bold" />
              แก้ไข
            </Button>
          </div>
        ))}
      </dl>

      {shuffleError ? <FormAlert message={shuffleError} /> : null}
      <p role="status" className="sr-only">
        {shuffling ? 'กำลังสับการ์ดเมนู...' : ''}
      </p>

      <StepFooter onBack={onBack} backDisabled={shuffling}>
        <Button disabled={shuffling} aria-busy={shuffling} onClick={onShuffle}>
          <Shuffle aria-hidden weight="bold" />
          {shuffling ? 'กำลังสับการ์ดเมนู...' : 'สับการ์ดเมนู'}
        </Button>
      </StepFooter>
    </section>
  )
}
