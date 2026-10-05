import { ArrowLeft, PencilSimple, Shuffle } from '@phosphor-icons/react'
import { useId, type Ref } from 'react'

import { Button } from '@/components/Button'
import {
  ANY_LABEL,
  ANY_ZONE_LABEL,
  budgetLabels,
  type ConditionStep,
  type RecommendationConditions,
} from '@/schemas/meal/recommendationSchemas'

type NamedRecord = { id: string; name: { th: string } }

type ConditionSummaryProps = {
  conditions: RecommendationConditions
  tastes: NamedRecord[]
  foodTypes: NamedRecord[]
  zones: NamedRecord[]
  headingRef: Ref<HTMLHeadingElement>
  onEdit: (step: ConditionStep) => void
  onBack: () => void
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
  onEdit,
  onBack,
}: ConditionSummaryProps) {
  const pendingNoteId = useId()
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

      <div className="flex flex-col gap-2">
        {/* #54 enables this once the recommendation API is connected. */}
        <Button disabled aria-describedby={pendingNoteId}>
          <Shuffle aria-hidden weight="bold" />
          สับการ์ดเมนู
        </Button>
        <p id={pendingNoteId} className="text-center text-small text-muted">
          การสับการ์ดเมนูจะเปิดใช้งานเร็ว ๆ นี้
        </p>
      </div>

      <Button variant="ghost" className="self-start" onClick={onBack}>
        <ArrowLeft aria-hidden weight="bold" />
        ย้อนกลับ
      </Button>
    </section>
  )
}
