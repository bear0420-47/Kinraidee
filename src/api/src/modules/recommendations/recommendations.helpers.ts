import type { Prisma } from '@prisma/client'

import type {
  BudgetRange,
  RecommendationCandidate,
} from './recommendations.dto'

export function budgetWhere(budget: BudgetRange): Prisma.IntFilter {
  switch (budget) {
    case 'UNDER_50':
      return { lt: 50 }
    case 'BETWEEN_50_100':
      return { gte: 50, lte: 100 }
    case 'BETWEEN_101_200':
      return { gte: 101, lte: 200 }
    case 'OVER_200':
      return { gt: 200 }
  }
}

export function nextBudgetRange(budget: BudgetRange): BudgetRange | null {
  switch (budget) {
    case 'UNDER_50':
      return 'BETWEEN_50_100'
    case 'BETWEEN_50_100':
      return 'BETWEEN_101_200'
    case 'BETWEEN_101_200':
      return 'OVER_200'
    case 'OVER_200':
      return null
  }
}

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = shuffled[index]
    const replacement = shuffled[swapIndex]
    if (current === undefined || replacement === undefined) continue
    shuffled[index] = replacement
    shuffled[swapIndex] = current
  }
  return shuffled
}

export function selectDiverseCandidates(
  candidates: readonly RecommendationCandidate[],
  count: 1 | 3,
  random = Math.random,
): RecommendationCandidate[] {
  const grouped = new Map<string, RecommendationCandidate[]>()
  for (const candidate of candidates) {
    const group = grouped.get(candidate.restaurantId)
    if (group) group.push(candidate)
    else grouped.set(candidate.restaurantId, [candidate])
  }

  const groups = shuffle([...grouped.values()], random).map((group) =>
    shuffle(group, random),
  )
  const selected: RecommendationCandidate[] = []

  for (const group of groups) {
    const candidate = group.shift()
    if (candidate) selected.push(candidate)
    if (selected.length === count) return selected
  }

  while (selected.length < count) {
    let added = false
    for (const group of groups) {
      const candidate = group.shift()
      if (!candidate) continue
      selected.push(candidate)
      added = true
      if (selected.length === count) return selected
    }
    if (!added) break
  }

  return selected
}
