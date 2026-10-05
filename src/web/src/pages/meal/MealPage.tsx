import { useEffect, useRef } from 'react'

import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { useFoodTypes } from '@/hooks/admin/food-types/useFoodTypes'
import { useTastes } from '@/hooks/admin/tastes/useTastes'
import { useZones } from '@/hooks/admin/zones/useZones'
import { useRecommendationFlow } from '@/hooks/meal/useRecommendationFlow'
import {
  conditionSteps,
  firstOpenStep,
  flowSteps,
  isCompleteConditions,
  withKnownIds,
  type FlowStep,
} from '@/schemas/meal/recommendationSchemas'
import { BudgetStep } from './components/BudgetStep'
import { ConditionSummary } from './components/ConditionSummary'
import { FoodTypeStep } from './components/FoodTypeStep'
import { TasteStep } from './components/TasteStep'
import { ZoneStep } from './components/ZoneStep'

const SESSION_NOTICE =
  'ไม่ต้องเข้าสู่ระบบ คำตอบและเมนูที่ปฏิเสธจะอยู่เฉพาะในหน้าที่เปิดอยู่นี้'

function previousStep(step: FlowStep): FlowStep {
  return flowSteps[Math.max(flowSteps.indexOf(step) - 1, 0)]!
}

function nextStep(step: FlowStep): FlowStep {
  return flowSteps[Math.min(flowSteps.indexOf(step) + 1, flowSteps.length - 1)]!
}

// Home → budget → taste → food type → zone → summary, one short step at a time. The
// recommendation request itself starts in #54.
export function MealPage() {
  const flow = useRecommendationFlow()
  const tastes = useTastes()
  const foodTypes = useFoodTypes()
  const zones = useZones()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const shownStep = useRef<FlowStep | null>(null)

  const optionsLoaded =
    tastes.isSuccess && foodTypes.isSuccess && zones.isSuccess
  // Until the lists load, stored IDs cannot be checked, so they are trusted for now.
  const conditions = optionsLoaded
    ? withKnownIds(flow.conditions, {
        tasteIds: tastes.data.map(({ id }) => id),
        foodTypeIds: foodTypes.data.map(({ id }) => id),
        zoneIds: zones.data.map(({ id }) => id),
      })
    : flow.conditions
  // The summary needs every answer; a removed record sends the user back to that step.
  const step =
    flow.step === 'summary' && !isCompleteConditions(conditions)
      ? firstOpenStep(conditions)
      : flow.step

  // Move focus to the new step's heading, but not on first render.
  useEffect(() => {
    if (shownStep.current !== null && shownStep.current !== step) {
      headingRef.current?.focus()
    }
    shownStep.current = step
  }, [step])

  const go = (target: FlowStep) => flow.goTo(target)
  const optionsFailed = tastes.isError || foodTypes.isError || zones.isError

  return (
    <PageShell
      title="บอกมื้อที่อยากได้แบบคร่าว ๆ"
      description="เลือกทีละข้ออย่างรวดเร็ว แล้วเราจะคัดเฉพาะตัวเลือกที่น่าสนใจ"
      width="medium"
    >
      <p role="status" className="font-bold">
        {step === 'summary'
          ? 'ตอบครบทั้ง 4 ข้อแล้ว'
          : `ข้อ ${flowSteps.indexOf(step) + 1} จาก ${conditionSteps.length}`}
      </p>

      {step === 'budget' ? (
        <BudgetStep
          value={conditions.budget}
          headingRef={headingRef}
          onChoose={(budget) => flow.choose('budget', budget)}
          onNext={() => go(nextStep(step))}
        />
      ) : null}
      {step === 'taste' ? (
        <TasteStep
          tastes={tastes}
          value={conditions.tasteId}
          headingRef={headingRef}
          onChoose={(tasteId) => flow.choose('tasteId', tasteId)}
          onNext={() => go(nextStep(step))}
          onBack={() => go(previousStep(step))}
        />
      ) : null}
      {step === 'foodType' ? (
        <FoodTypeStep
          foodTypes={foodTypes}
          value={conditions.foodTypeId}
          headingRef={headingRef}
          onChoose={(foodTypeId) => flow.choose('foodTypeId', foodTypeId)}
          onNext={() => go(nextStep(step))}
          onBack={() => go(previousStep(step))}
        />
      ) : null}
      {step === 'zone' ? (
        <ZoneStep
          zones={zones}
          value={conditions.zoneId}
          headingRef={headingRef}
          onChoose={(zoneId) => flow.choose('zoneId', zoneId)}
          onNext={() => go(nextStep(step))}
          onBack={() => go(previousStep(step))}
        />
      ) : null}
      {step === 'summary' && !optionsLoaded ? (
        // The summary names every choice, so it waits for all three lists.
        optionsFailed ? (
          <div role="alert" className="flex flex-col items-start gap-3">
            <p className="font-bold text-rust">
              โหลดตัวเลือกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                void tastes.refetch()
                void foodTypes.refetch()
                void zones.refetch()
              }}
            >
              ลองใหม่
            </Button>
          </div>
        ) : (
          <p role="status">กำลังโหลดตัวเลือก…</p>
        )
      ) : null}
      {step === 'summary' &&
      optionsLoaded &&
      isCompleteConditions(conditions) ? (
        <ConditionSummary
          conditions={conditions}
          tastes={tastes.data}
          foodTypes={foodTypes.data}
          zones={zones.data}
          headingRef={headingRef}
          onEdit={go}
          onBack={() => go(previousStep(step))}
        />
      ) : null}

      <p className="rounded-sm border-2 border-dashed border-line-soft bg-cream p-3 text-small">
        {SESSION_NOTICE}
      </p>
    </PageShell>
  )
}
