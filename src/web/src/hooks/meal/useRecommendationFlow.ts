import { useCallback, useEffect, useState } from 'react'

import {
  emptyFlow,
  RECOMMENDATION_STORAGE_KEY,
  storedFlowSchema,
  type FlowStep,
  type RecommendationConditions,
  type StoredFlow,
} from '@/schemas/meal/recommendationSchemas'

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

function writeStoredFlow(flow: StoredFlow) {
  try {
    sessionStorage.setItem(RECOMMENDATION_STORAGE_KEY, JSON.stringify(flow))
  } catch {
    // Keep working in memory.
  }
}

// The current step and chosen conditions, kept in sessionStorage so they survive route
// changes and the login/register round trip, and end with the browser session.
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

  return { step: flow.step, conditions: flow.conditions, choose, goTo }
}
