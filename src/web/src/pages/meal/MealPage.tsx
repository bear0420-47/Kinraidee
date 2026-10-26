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
  firstOpenStep,
  flowSteps,
  initialRequest,
  isCompleteConditions,
  withKnownIds,
  type ConditionDraft,
  type ConditionStep,
  type FlowStep,
  type MealStep,
  type RecommendationConditions,
  type RecommendationItem,
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
import { ShuffleCardGrid } from './components/ShuffleCardGrid'
import { TasteStep } from './components/TasteStep'
import { ZoneStep } from './components/ZoneStep'

const CONDITIONS_INTRO = 'เลือกที่อยากกินมา เดี๋ยวช่วยหาเมนูให้'

function previousStep(step: FlowStep): FlowStep {
  return flowSteps[Math.max(flowSteps.indexOf(step) - 1, 0)]!
}

function nextStep(step: FlowStep): FlowStep {
  return flowSteps[Math.min(flowSteps.indexOf(step) + 1, flowSteps.length - 1)]!
}

// Home → budget → taste → food type → zone → summary → shuffle cards → confirmation, one
// short step at a time. The API returns effective conditions and any automatic adjustment in one request.
// Confirming a menu clears the flow and returns Home. A signed-in user's saved
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
  // A true catalog no-match is kept in memory only, so a reload shows the summary.
  const [noMatch, setNoMatch] = useState(false)
  const [shuffleError, setShuffleError] = useState<string | null>(null)
  const [shuffling, setShuffling] = useState(false)
  const shuffleInFlight = useRef(false)
  const [editing, setEditing] = useState(false)
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
    setNoMatch(false)
    flow.goTo(target)
  }

  function editAnswer(target: ConditionStep) {
    if (step === 'cards') flow.editConditions()
    setEditing(true)
    go(target)
  }

  function choose<Field extends keyof RecommendationConditions>(
    field: Field,
    value: RecommendationConditions[Field],
    advance = false,
  ) {
    flow.choose(field, value)
    if (advance) {
      go(editing ? 'summary' : nextStep(step as FlowStep))
      setEditing(false)
    }
  }

  function back(from: FlowStep) {
    go(editing ? 'summary' : previousStep(from))
    setEditing(false)
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
    go(editing ? 'summary' : nextStep(from))
    setEditing(false)
  }
  const optionsFailed = tastes.isError || foodTypes.isError || zones.isError

  async function shuffle(target: RecommendationConditions) {
    if (shuffleInFlight.current) return
    shuffleInFlight.current = true
    setShuffling(true)
    setShuffleError(null)
    try {
      const { items, adjustment } = await recommend.mutateAsync(
        initialRequest(target),
      )
      if (items.length > 0) {
        setNoMatch(false)
        flow.showShortlist(adjustment?.conditions ?? target, items, adjustment)
      } else {
        flow.setConditions(target)
        setNoMatch(true)
      }
    } catch (error) {
      setNoMatch(false)
      setShuffleError(recommendationErrorMessage(error))
    } finally {
      shuffleInFlight.current = false
      setShuffling(false)
    }
  }

  function editConditions() {
    setEditing(false)
    setNoMatch(false)
    flow.editConditions()
  }

  // `เริ่มใหม่` clears every answer and the shortlist, then asks question 1 again.
  function startOver() {
    setEditing(false)
    setNoMatch(false)
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
      appearance="plain"
      // The intro is about answering questions, so the cards view drops it.
      {...(view === 'cards'
        ? {}
        : {
            title: 'มื้อนี้กินอะไรดี?',
            description: CONDITIONS_INTRO,
          })}
      // Three cards need more room than a single question.
      width={view === 'cards' ? 'wide' : 'medium'}
    >
      {step === 'summary' ? (
        <p
          role="status"
          className="self-start rounded-sm border-2 border-paper bg-cream px-3 py-1 text-small font-extrabold"
        >
          เลือกครบ 4 ข้อแล้ว!
        </p>
      ) : null}

      {step === 'budget' ? (
        <BudgetStep
          value={shown.budget}
          headingRef={headingRef}
          onChoose={(budget, advance) => choose('budget', budget, advance)}
          onNext={() => next('budget', step)}
          onBack={editing ? () => back(step) : undefined}
          editing={editing}
        />
      ) : null}
      {step === 'taste' ? (
        <TasteStep
          tastes={tastes}
          value={shown.tasteId}
          headingRef={headingRef}
          onChoose={(tasteId, advance) => choose('tasteId', tasteId, advance)}
          onNext={() => next('tasteId', step)}
          onBack={() => back(step)}
          editing={editing}
        />
      ) : null}
      {step === 'foodType' ? (
        <FoodTypeStep
          foodTypes={foodTypes}
          value={shown.foodTypeId}
          headingRef={headingRef}
          onChoose={(foodTypeId, advance) =>
            choose('foodTypeId', foodTypeId, advance)
          }
          onNext={() => next('foodTypeId', step)}
          onBack={() => back(step)}
          editing={editing}
        />
      ) : null}
      {step === 'zone' ? (
        <ZoneStep
          zones={zones}
          value={shown.zoneId}
          headingRef={headingRef}
          onChoose={(zoneId, advance) => choose('zoneId', zoneId, advance)}
          onNext={() => next('zoneId', step)}
          onBack={() => back(step)}
          editing={editing}
        />
      ) : null}
      {(view === 'summary' || view === 'noMatch') && !optionsLoaded ? (
        // The summary names every choice, so it waits for all three lists.
        optionsFailed ? (
          <div role="alert" className="flex flex-col items-start gap-3">
            <p className="font-bold text-rust">
              โหลดตัวเลือกไม่สำเร็จ ลองอีกครั้งนะ
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
          <p role="status">กำลังโหลดตัวเลือกให้นะ…</p>
        )
      ) : null}
      {(view === 'summary' || view === 'noMatch') &&
      optionsLoaded &&
      complete ? (
        <ConditionSummary
          conditions={conditions}
          tastes={tastes.data}
          foodTypes={foodTypes.data}
          zones={zones.data}
          headingRef={headingRef}
          shuffling={shuffling}
          shuffleError={shuffleError}
          noMatch={noMatch}
          onEdit={editAnswer}
          onBack={() => go(previousStep('summary'))}
          onShuffle={() => void shuffle(conditions)}
        />
      ) : null}
      {view === 'cards' && flow.shortlist && complete ? (
        <ShuffleCardGrid
          conditions={conditions}
          conditionOptions={{
            tastes: tastes.data ?? [],
            foodTypes: foodTypes.data ?? [],
            zones: zones.data ?? [],
          }}
          onEditCondition={editAnswer}
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

      {view === 'cards' ? (
        <p className="text-small text-muted">
          ภาพประกอบเมนูจาก{' '}
          <a
            href="https://unsplash.com/?utm_source=kinraidee&utm_medium=referral"
            target="_blank"
            rel="noreferrer"
            className="rounded-xs font-bold underline"
          >
            Unsplash
          </a>{' '}
          และภาพ Creative Commons จาก Wikimedia Commons และ Flickr
        </p>
      ) : null}
    </PageShell>
  )
}
