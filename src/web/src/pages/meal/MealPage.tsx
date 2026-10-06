import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { useFoodTypes } from '@/hooks/admin/food-types/useFoodTypes'
import { useTastes } from '@/hooks/admin/tastes/useTastes'
import { useZones } from '@/hooks/admin/zones/useZones'
import { useRecommendationFlow } from '@/hooks/meal/useRecommendationFlow'
import {
  recommendationErrorMessage,
  useRequestRecommendations,
} from '@/hooks/meal/useRecommendations'
import {
  applyRelaxation,
  conditionSteps,
  firstOpenStep,
  flowSteps,
  initialRequest,
  isCompleteConditions,
  withKnownIds,
  type FlowStep,
  type MealStep,
  type RecommendationConditions,
  type RecommendationItem,
  type Relaxation,
} from '@/schemas/meal/recommendationSchemas'
import { BudgetStep } from './components/BudgetStep'
import { ConditionSummary } from './components/ConditionSummary'
import { ConfirmMenuDialog } from './components/ConfirmMenuDialog'
import { FoodTypeStep } from './components/FoodTypeStep'
import { NoMatchPanel } from './components/NoMatchPanel'
import { ShuffleCardGrid } from './components/ShuffleCardGrid'
import { TasteStep } from './components/TasteStep'
import { ZoneStep } from './components/ZoneStep'

const CONDITIONS_INTRO =
  'เลือกทีละข้ออย่างรวดเร็ว แล้วเราจะคัดเฉพาะตัวเลือกที่น่าสนใจ'

const SESSION_NOTICE =
  'ไม่ต้องเข้าสู่ระบบ คำตอบและเมนูที่ปฏิเสธจะอยู่เฉพาะในหน้าที่เปิดอยู่นี้'

function previousStep(step: FlowStep): FlowStep {
  return flowSteps[Math.max(flowSteps.indexOf(step) - 1, 0)]!
}

function nextStep(step: FlowStep): FlowStep {
  return flowSteps[Math.min(flowSteps.indexOf(step) + 1, flowSteps.length - 1)]!
}

// Home → budget → taste → food type → zone → summary → shuffle cards → confirmation, one
// short step at a time. A shuffle that finds nothing shows the no-match panel instead of
// cards. Confirming a menu clears the flow and returns Home.
export function MealPage() {
  const navigate = useNavigate()
  const flow = useRecommendationFlow()
  const tastes = useTastes()
  const foodTypes = useFoodTypes()
  const zones = useZones()
  const recommend = useRequestRecommendations()
  // The last shuffle found nothing. Kept in memory only, so a reload shows the summary.
  const [noMatch, setNoMatch] = useState<{
    relaxation: Relaxation | null
  } | null>(null)
  const [shuffleError, setShuffleError] = useState<string | null>(null)
  // The card being confirmed. Kept in memory only: the cards stay unchanged underneath, so
  // `ขอคิดอีกที` (or a reload) returns to exactly the same shortlist.
  const [chosen, setChosen] = useState<RecommendationItem | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const shownView = useRef<string | null>(null)

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
  const complete = isCompleteConditions(conditions)
  // The summary and cards need every answer, so a removed record sends the user back to
  // that step. Stored cards without a shortlist fall back to the summary.
  const step: MealStep =
    (flow.step === 'summary' || flow.step === 'cards') && !complete
      ? firstOpenStep(conditions)
      : flow.step === 'cards' && !flow.shortlist
        ? 'summary'
        : flow.step
  const view = step === 'summary' && noMatch ? 'noMatch' : step

  // Move focus to the new view's heading, but not on first render.
  useEffect(() => {
    if (shownView.current !== null && shownView.current !== view) {
      headingRef.current?.focus()
    }
    shownView.current = view
  }, [view])

  const go = (target: FlowStep) => {
    setNoMatch(null)
    flow.goTo(target)
  }
  const optionsFailed = tastes.isError || foodTypes.isError || zones.isError

  async function shuffle(target: RecommendationConditions) {
    setShuffleError(null)
    try {
      const { items, relaxation } = await recommend.mutateAsync(
        initialRequest(target),
      )
      if (items.length > 0) {
        setNoMatch(null)
        flow.showShortlist(target, items)
      } else {
        flow.setConditions(target)
        setNoMatch({ relaxation })
      }
    } catch (error) {
      setNoMatch(null)
      setShuffleError(recommendationErrorMessage(error))
    }
  }

  function editConditions() {
    setNoMatch(null)
    flow.editConditions()
  }

  function finish() {
    flow.finish()
    void navigate('/')
  }

  return (
    <PageShell
      title="บอกมื้อที่อยากได้แบบคร่าว ๆ"
      // The intro is about answering questions, so the cards view drops it.
      {...(view === 'cards' ? {} : { description: CONDITIONS_INTRO })}
      // Three cards need more room than a single question.
      width={view === 'cards' ? 'wide' : 'medium'}
    >
      <p role="status" className="font-bold">
        {step === 'cards'
          ? 'สับการ์ดเมนูแล้ว'
          : step === 'summary'
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
      {view === 'summary' && !optionsLoaded ? (
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
      {view === 'summary' && optionsLoaded && complete ? (
        <ConditionSummary
          conditions={conditions}
          tastes={tastes.data}
          foodTypes={foodTypes.data}
          zones={zones.data}
          headingRef={headingRef}
          shuffling={recommend.isPending}
          shuffleError={shuffleError}
          onEdit={go}
          onBack={() => go(previousStep('summary'))}
          onShuffle={() => void shuffle(conditions)}
        />
      ) : null}
      {view === 'noMatch' && noMatch && complete ? (
        <NoMatchPanel
          relaxation={noMatch.relaxation}
          shuffling={recommend.isPending}
          headingRef={headingRef}
          onApplyRelaxation={() => {
            if (noMatch.relaxation) {
              void shuffle(applyRelaxation(conditions, noMatch.relaxation))
            }
          }}
          onEditConditions={editConditions}
        />
      ) : null}
      {view === 'cards' && flow.shortlist && complete ? (
        <ShuffleCardGrid
          conditions={conditions}
          shortlist={flow.shortlist}
          headingRef={headingRef}
          onUpdate={flow.updateShortlist}
          onEditConditions={editConditions}
          onChoose={setChosen}
        />
      ) : null}
      {view === 'cards' && chosen ? (
        <ConfirmMenuDialog
          item={chosen}
          onCancel={() => setChosen(null)}
          onFinish={finish}
        />
      ) : null}

      <p className="rounded-sm border-2 border-dashed border-line-soft bg-cream p-3 text-small">
        {SESSION_NOTICE}
      </p>
    </PageShell>
  )
}
