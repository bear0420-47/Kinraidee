import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { useFoodTypes } from '@/hooks/admin/food-types/useFoodTypes'
import { useTastes } from '@/hooks/admin/tastes/useTastes'
import { useZones } from '@/hooks/admin/zones/useZones'
import { useCurrentUser } from '@/hooks/auth/useCurrentUser'
import { useRecommendationFlow } from '@/hooks/meal/useRecommendationFlow'
import {
  recommendationErrorMessage,
  useRequestRecommendations,
} from '@/hooks/meal/useRecommendations'
import { usePreference } from '@/hooks/preferences/usePreference'
import { useRecordHistory } from '@/hooks/recommendation-history/useRecommendationHistory'
import {
  conditionSteps,
  firstOpenStep,
  flowSteps,
  initialRequest,
  isCompleteConditions,
  withKnownIds,
  type ConditionDraft,
  type FlowStep,
  type MealStep,
  type RecommendationConditions,
  type RecommendationItem,
  type Suggestion,
} from '@/schemas/meal/recommendationSchemas'
import {
  chooseCard,
  chosenItem,
  clearChoice,
  confirmChoice,
} from '@/schemas/meal/shortlist'
import { toConditionDefaults } from '@/schemas/preferences/preferenceSchemas'
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
// cards. Confirming a menu clears the flow and returns Home. A signed-in user's saved
// defaults are shown as each step's selection until the user answers it.
export function MealPage() {
  const navigate = useNavigate()
  const flow = useRecommendationFlow()
  const tastes = useTastes()
  const foodTypes = useFoodTypes()
  const zones = useZones()
  const recommend = useRequestRecommendations()
  // Idle while signed out, so anonymous users never get defaults.
  const preference = usePreference()
  const { data: user } = useCurrentUser()
  const recordHistory = useRecordHistory()
  // The last shuffle found nothing. Kept in memory only, so a reload shows the summary.
  const [noMatch, setNoMatch] = useState<{
    suggestion: Suggestion | null
  } | null>(null)
  const [shuffleError, setShuffleError] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const shownView = useRef<string | null>(null)

  const optionsLoaded =
    tastes.isSuccess && foodTypes.isSuccess && zones.isSuccess
  const knownIds = optionsLoaded
    ? {
        tasteIds: tastes.data.map(({ id }) => id),
        foodTypeIds: foodTypes.data.map(({ id }) => id),
        zoneIds: zones.data.map(({ id }) => id),
      }
    : null
  // Until the lists load, stored IDs cannot be checked, so they are trusted for now.
  const conditions = knownIds
    ? withKnownIds(flow.conditions, knownIds)
    : flow.conditions
  // Saved defaults wait for the lists, so a default whose record is gone is never shown.
  const defaults: ConditionDraft = knownIds
    ? withKnownIds(toConditionDefaults(preference.data), knownIds)
    : {}
  // What each step shows: the user's own answer (even "any") wins over a saved default.
  const shown: ConditionDraft = { ...defaults, ...conditions }
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
  // The card being confirmed is stored with the shortlist, so its dialog reopens after the
  // login round trip or a reload. The cards underneath never change while it is open.
  const chosen = flow.shortlist ? chosenItem(flow.shortlist) : null

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

  // `ถัดไป` on a step still showing a saved default commits it, like any other answer.
  function next<Field extends keyof ConditionDraft>(
    field: Field,
    from: FlowStep,
  ) {
    const value = shown[field]
    if (conditions[field] === undefined && value !== undefined) {
      flow.choose(field, value as RecommendationConditions[Field])
    }
    go(nextStep(from))
  }
  const optionsFailed = tastes.isError || foodTypes.isError || zones.isError

  async function shuffle(target: RecommendationConditions) {
    setShuffleError(null)
    try {
      const { items, suggestion } = await recommend.mutateAsync(
        initialRequest(target),
      )
      if (items.length > 0) {
        setNoMatch(null)
        flow.showShortlist(target, items)
      } else {
        flow.setConditions(target)
        setNoMatch({ suggestion })
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

  // `เริ่มใหม่` clears every answer and the shortlist, then asks question 1 again.
  function startOver() {
    setNoMatch(null)
    flow.finish()
  }

  // `เอาเมนูนี้แหละ`: the decision stands at once. A signed-in user's choice is also recorded
  // in history, once; a failure only shows a warning. Anonymous users never record history.
  function confirm(item: RecommendationItem) {
    flow.updateShortlist(confirmChoice)
    if (user) recordHistory.mutate(item.id)
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
          value={shown.budget}
          headingRef={headingRef}
          onChoose={(budget) => flow.choose('budget', budget)}
          onNext={() => next('budget', step)}
        />
      ) : null}
      {step === 'taste' ? (
        <TasteStep
          tastes={tastes}
          value={shown.tasteId}
          headingRef={headingRef}
          onChoose={(tasteId) => flow.choose('tasteId', tasteId)}
          onNext={() => next('tasteId', step)}
          onBack={() => go(previousStep(step))}
        />
      ) : null}
      {step === 'foodType' ? (
        <FoodTypeStep
          foodTypes={foodTypes}
          value={shown.foodTypeId}
          headingRef={headingRef}
          onChoose={(foodTypeId) => flow.choose('foodTypeId', foodTypeId)}
          onNext={() => next('foodTypeId', step)}
          onBack={() => go(previousStep(step))}
        />
      ) : null}
      {step === 'zone' ? (
        <ZoneStep
          zones={zones}
          value={shown.zoneId}
          headingRef={headingRef}
          onChoose={(zoneId) => flow.choose('zoneId', zoneId)}
          onNext={() => next('zoneId', step)}
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
          suggestion={noMatch.suggestion}
          shuffling={recommend.isPending}
          headingRef={headingRef}
          // The suggestion carries the complete conditions, every change already applied.
          onApplySuggestion={() => {
            if (noMatch.suggestion) {
              void shuffle(noMatch.suggestion.conditions)
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
          onStartOver={startOver}
          onChoose={(item) =>
            flow.updateShortlist((current) => chooseCard(current, item.id))
          }
        />
      ) : null}
      {view === 'cards' && chosen ? (
        <ConfirmMenuDialog
          item={chosen}
          confirmed={flow.shortlist?.confirmed === true}
          historyFailed={recordHistory.isError}
          onConfirm={() => confirm(chosen)}
          onCancel={() => flow.updateShortlist(clearChoice)}
          onFinish={finish}
        />
      ) : null}

      {/* Only for signed-out users (`null`); hidden while the session loads so it never
          flashes for a signed-in user. */}
      {user === null ? (
        <p className="rounded-sm border-2 border-dashed border-line-soft bg-cream p-3 text-small">
          {SESSION_NOTICE}
        </p>
      ) : null}
    </PageShell>
  )
}
