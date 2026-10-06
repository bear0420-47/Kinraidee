import { toLocalization, type Localization } from '@/shared/localization'
import type {
  BudgetRange,
  RecommendationConditions,
  RecommendationSuggestion,
  SuggestionField,
} from './recommendations.dto'

// The no-match suggestion: the fewest filter changes that still leave at least one menu
// item, computed in memory from every active, non-excluded item (`SuggestionPoolItem`).
//
// Why a suggestion always exists while the pool is not empty: take an item whose set of
// failing fields S is smallest. Every item that matches the fields outside S fails all of S
// (otherwise it would fail fewer fields), so each greedy pick for a field in S has a
// candidate, and trying S succeeds. Sets are tried smallest first, so S is reached.

export type SuggestionOption = {
  id: string
  nameTh: string
  nameEn: string
  sortOrder: number
}

export type SuggestionPoolItem = {
  price: number
  zone: SuggestionOption
  foodType: SuggestionOption
  tastes: SuggestionOption[]
}

// The user's current records, for the `from` labels.
export type CurrentRecords = Record<
  'zone' | 'taste' | 'foodType',
  { id: string; nameTh: string; nameEn: string } | null
>

export const budgetLabels: Record<BudgetRange, Localization> = {
  UNDER_50: { th: 'ไม่เกิน ฿50', en: 'Under ฿50' },
  BETWEEN_50_100: { th: '฿50–100', en: '฿50–100' },
  BETWEEN_101_200: { th: '฿101–200', en: '฿101–200' },
  OVER_200: { th: 'มากกว่า ฿200', en: 'Over ฿200' },
}

const budgetOrder: readonly BudgetRange[] = [
  'UNDER_50',
  'BETWEEN_50_100',
  'BETWEEN_101_200',
  'OVER_200',
]

// Approved priority: flexible constraints change before personal intent.
const fieldPriority: readonly SuggestionField[] = [
  'zone',
  'budget',
  'taste',
  'foodType',
]

type RecordField = Exclude<SuggestionField, 'budget'>

const conditionKeys = {
  zone: 'zoneId',
  taste: 'tasteId',
  foodType: 'foodTypeId',
} as const satisfies Record<RecordField, keyof RecommendationConditions>

const valueTypes = {
  zone: 'ZONE',
  taste: 'TASTE',
  foodType: 'FOOD_TYPE',
} as const

// Same bounds as `budgetWhere`.
export function priceInBudget(price: number, budget: BudgetRange) {
  switch (budget) {
    case 'UNDER_50':
      return price < 50
    case 'BETWEEN_50_100':
      return price >= 50 && price <= 100
    case 'BETWEEN_101_200':
      return price >= 101 && price <= 200
    case 'OVER_200':
      return price > 200
  }
}

// Every other range, nearest first and higher before lower at the same distance.
export function nearestBudgetRanges(budget: BudgetRange): BudgetRange[] {
  const index = budgetOrder.indexOf(budget)
  const ranges: BudgetRange[] = []
  for (let distance = 1; distance < budgetOrder.length; distance += 1) {
    for (const next of [index + distance, index - distance]) {
      const range = budgetOrder[next]
      if (range) ranges.push(range)
    }
  }
  return ranges
}

function optionsOf(item: SuggestionPoolItem, field: RecordField) {
  return field === 'taste' ? item.tastes : [item[field]]
}

function matchesField(
  item: SuggestionPoolItem,
  field: SuggestionField,
  conditions: RecommendationConditions,
) {
  if (field === 'budget') return priceInBudget(item.price, conditions.budget)
  const id = conditions[conditionKeys[field]]
  return (
    id === null || optionsOf(item, field).some((option) => option.id === id)
  )
}

// Mirrors `candidateWhere` for one item.
export function matchesConditions(
  item: SuggestionPoolItem,
  conditions: RecommendationConditions,
) {
  return fieldPriority.every((field) => matchesField(item, field, conditions))
}

// Non-empty subsets of `fields` (already in priority order): smallest first, then by the
// highest-priority field.
function subsetsBySize<T>(fields: readonly T[]): T[][] {
  const subsets: T[][] = []
  const build = (start: number, size: number, picked: T[]) => {
    if (picked.length === size) {
      subsets.push(picked)
      return
    }
    for (let index = start; index < fields.length; index += 1) {
      build(index + 1, size, [...picked, fields[index]!])
    }
  }
  for (let size = 1; size <= fields.length; size += 1) build(0, size, [])
  return subsets
}

// The option, other than the current one, with the most remaining items. Ties go to the
// display order, then the Thai name.
function bestOption(
  items: readonly SuggestionPoolItem[],
  field: RecordField,
  currentId: string,
) {
  const counts = new Map<string, { option: SuggestionOption; count: number }>()
  for (const item of items) {
    for (const option of optionsOf(item, field)) {
      if (option.id === currentId) continue
      const entry = counts.get(option.id)
      if (entry) entry.count += 1
      else counts.set(option.id, { option, count: 1 })
    }
  }
  const [best] = [...counts.values()].sort(
    (a, b) =>
      b.count - a.count ||
      a.option.sortOrder - b.option.sortOrder ||
      a.option.nameTh.localeCompare(b.option.nameTh, 'th'),
  )
  return best?.option ?? null
}

type Change = RecommendationSuggestion['changes'][number]

// Picks a new value for one field and returns the change, or null when the remaining items
// leave no other value.
function pickChange(
  items: readonly SuggestionPoolItem[],
  field: SuggestionField,
  conditions: RecommendationConditions,
  current: CurrentRecords,
): { change: Change; conditions: RecommendationConditions } | null {
  if (field === 'budget') {
    const budget = nearestBudgetRanges(conditions.budget).find((range) =>
      items.some((item) => priceInBudget(item.price, range)),
    )
    if (!budget) return null
    return {
      change: {
        field,
        from: {
          type: 'BUDGET_RANGE',
          id: conditions.budget,
          label: budgetLabels[conditions.budget],
        },
        to: { type: 'BUDGET_RANGE', id: budget, label: budgetLabels[budget] },
      },
      conditions: { ...conditions, budget },
    }
  }

  const key = conditionKeys[field]
  const currentId = conditions[key]
  const record = current[field]
  if (currentId === null || !record) return null
  const option = bestOption(items, field, currentId)
  if (!option) return null
  const type = valueTypes[field]
  return {
    change: {
      field,
      from: {
        type,
        id: record.id,
        label: toLocalization(record.nameTh, record.nameEn),
      },
      to: {
        type,
        id: option.id,
        label: toLocalization(option.nameTh, option.nameEn),
      },
    },
    conditions: { ...conditions, [key]: option.id },
  }
}

export function findSuggestion(
  pool: readonly SuggestionPoolItem[],
  conditions: RecommendationConditions,
  current: CurrentRecords,
): RecommendationSuggestion | null {
  if (pool.length === 0) return null

  // A field left as "any" is already as wide as it can be, so only chosen fields change.
  const changeable = fieldPriority.filter(
    (field) => field === 'budget' || conditions[conditionKeys[field]] !== null,
  )

  for (const fields of subsetsBySize(changeable)) {
    let remaining = pool.filter((item) =>
      fieldPriority.every(
        (field) =>
          fields.includes(field) || matchesField(item, field, conditions),
      ),
    )
    let next = conditions
    const changes: Change[] = []

    for (const field of fields) {
      const picked = pickChange(remaining, field, next, current)
      if (!picked) break
      next = picked.conditions
      changes.push(picked.change)
      remaining = remaining.filter((item) => matchesField(item, field, next))
    }

    if (changes.length === fields.length && remaining.length > 0) {
      return { changes, conditions: next, resultCount: remaining.length }
    }
  }

  return null
}
