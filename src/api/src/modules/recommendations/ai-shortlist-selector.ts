import type {
  RecommendationCandidate,
  RecommendationConditions,
} from './recommendations.dto'

export type AiShortlistSelection = {
  menuItemId: string
  reasonTh: string
}

export type AiShortlistInput = {
  conditions: RecommendationConditions
  candidates: RecommendationCandidate[]
  count: number
}

export type AiShortlistSelector = {
  select(input: AiShortlistInput): Promise<AiShortlistSelection[] | null>
}

export const disabledAiShortlistSelector: AiShortlistSelector = {
  async select() {
    return null
  },
}
