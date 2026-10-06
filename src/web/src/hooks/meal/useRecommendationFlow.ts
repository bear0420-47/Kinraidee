import { useCallback, useEffect, useState } from 'react'

import {
  emptyFlow,
  RECOMMENDATION_STORAGE_KEY,
  storedFlowSchema,
  type FlowStep,
  type RecommendationConditions,
  type RecommendationItem,
  type Shortlist,
  type StoredFlow,
} from '@/schemas/meal/recommendationSchemas'
import { startShortlist } from '@/schemas/meal/shortlist'

// Storage can be unavailable (private mode, blocked site data); the flow then lives in memory.
function readStoredFlow(): StoredFlow {
  try {
    const raw = sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)
    if (!raw) return emptyFlow
    const parsed = storedFlowSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : emptyFlow
  } catch {
    return emptyFlow
  }
}

// A fresh flow leaves nothing behind, so a finished flow clears the key instead of storing it.
function writeStoredFlow(flow: StoredFlow) {
  try {
    if (flow === emptyFlow) {
      sessionStorage.removeItem(RECOMMENDATION_STORAGE_KEY)
    } else {
      sessionStorage.setItem(RECOMMENDATION_STORAGE_KEY, JSON.stringify(flow))
    }
  } catch {
    // Keep working in memory.
  }
}

// The current step, chosen conditions, and displayed shortlist, kept in sessionStorage so
// they survive route changes and the login/register round trip, and end with the browser
// session.
export function useRecommendationFlow() {
  const [flow, setFlow] = useState(readStoredFlow)

  useEffect(() => writeStoredFlow(flow), [flow])

  const choose = useCallback(
    <Field extends keyof RecommendationConditions>(
      field: Field,
      value: RecommendationConditions[Field],
    ) =>
      setFlow((current) => ({
        ...current,
        conditions: { ...current.conditions, [field]: value },
      })),
    [],
  )

  const goTo = useCallback(
    (step: FlowStep) => setFlow((current) => ({ ...current, step })),
    [],
  )

  // A successful shuffle (or relaxed re-shuffle) starts a new shortlist with these conditions.
  const showShortlist = useCallback(
    (conditions: RecommendationConditions, items: RecommendationItem[]) =>
      setFlow({ step: 'cards', conditions, shortlist: startShortlist(items) }),
    [],
  )

  const updateShortlist = useCallback(
    (update: (shortlist: Shortlist) => Shortlist) =>
      setFlow((current) =>
        current.shortlist
          ? { ...current, shortlist: update(current.shortlist) }
          : current,
      ),
    [],
  )

  // Commits a full set of conditions, such as an applied suggestion, without showing cards.
  const setConditions = useCallback(
    (conditions: RecommendationConditions) =>
      setFlow((current) => ({ ...current, conditions })),
    [],
  )

  // Editing conditions starts a new session: the shortlist and rejected IDs are cleared.
  const editConditions = useCallback(
    () => setFlow(({ conditions }) => ({ step: 'summary', conditions })),
    [],
  )

  // A confirmed menu ends the flow: conditions, step, shortlist, rejected IDs, and undo are
  // all cleared. Storage is cleared here too, so it never depends on the page rendering
  // again before it navigates away.
  const finish = useCallback(() => {
    writeStoredFlow(emptyFlow)
    setFlow(emptyFlow)
  }, [])

  return {
    step: flow.step,
    conditions: flow.conditions,
    shortlist: flow.shortlist,
    choose,
    goTo,
    showShortlist,
    updateShortlist,
    setConditions,
    editConditions,
    finish,
  }
}
