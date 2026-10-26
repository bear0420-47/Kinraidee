import { screen } from '@testing-library/react'

import type { CurrentUser } from '@/hooks/auth/useCurrentUser'
import {
  RECOMMENDATION_STORAGE_KEY,
  type Adjustment,
  type RecommendationConditions,
  type RecommendationItem,
  type RecommendationRequest,
  type Shortlist,
} from '@/schemas/meal/recommendationSchemas'
import {
  fakeAuthApi,
  jsonResponse,
  type FakeApiOptions,
  type renderApp,
} from '@/test/renderApp'

// Master data, conditions, and menu items shared by the recommendation page tests.
const tastes = [
  {
    id: 'taste_1',
    name: { th: 'เผ็ด', en: 'Spicy' },
    icon: 'flame',
    sortOrder: 1,
  },
]
const foodTypes = [
  {
    id: 'food_1',
    name: { th: 'ข้าว', en: 'Rice' },
    icon: 'rice',
    sortOrder: 1,
  },
]
const zones = [
  {
    id: 'zone_1',
    name: { th: 'หน้ามอ', en: 'Front Gate' },
    description: null,
    sortOrder: 1,
  },
]

// The three master-data lists, as the public list endpoints return them.
export const masterDataResponses = {
  'GET /api/tastes': () => jsonResponse(200, { data: { items: tastes } }),
  'GET /api/food-types': () =>
    jsonResponse(200, { data: { items: foodTypes } }),
  'GET /api/zones': () => jsonResponse(200, { data: { items: zones } }),
}

export const conditions: RecommendationConditions = {
  budget: 'BETWEEN_50_100',
  tasteId: 'taste_1',
  foodTypeId: null,
  zoneId: null,
}

export function recommendationItem(id: string, th: string): RecommendationItem {
  return {
    id,
    name: { th, en: `Dish ${id}` },
    description: null,
    price: 60,
    imageUrl: null,
    restaurant: { id: 'r_1', name: { th: 'ครัวไทย', en: 'Thai Kitchen' } },
    zone: { id: 'zone_1', name: { th: 'หน้ามอ', en: 'Front Gate' } },
    foodType: { id: 'food_1', name: { th: 'ข้าว', en: 'Rice' }, icon: 'rice' },
    tastes: [
      { id: 'taste_1', name: { th: 'เผ็ด', en: 'Spicy' }, icon: 'flame' },
    ],
    rationale: {
      matchedBudget: true,
      matchedTaste: true,
      matchedFoodType: false,
      matchedZone: false,
    },
    selection: { source: 'DETERMINISTIC', reasonTh: null },
  }
}

export const krapao = recommendationItem('menu_1', 'ผัดกะเพรา')
export const noodles = recommendationItem('menu_2', 'ก๋วยเตี๋ยว')
export const curry = recommendationItem('menu_3', 'แกงเขียวหวาน')
export const somtam = recommendationItem('menu_4', 'ส้มตำ')

type Result = { items: RecommendationItem[]; adjustment?: Adjustment | null }

// Answers each recommendation request in turn with the next queued result.
export function fakeShuffleApi({
  results,
  currentUser = null,
  stored = conditions,
  masterData = {},
  handle,
}: {
  results: (Result | Response | Promise<Response>)[]
  currentUser?: CurrentUser | null
  stored?: RecommendationConditions
  masterData?: FakeApiOptions['responses']
  // Answers other routes, such as favorites.
  handle?: FakeApiOptions['handle']
}) {
  sessionStorage.setItem(
    RECOMMENDATION_STORAGE_KEY,
    JSON.stringify({ step: 'summary', conditions: stored }),
  )
  const queue = [...results]
  const api = fakeAuthApi({
    currentUser,
    handle: (method, url, body) => {
      const custom = handle?.(method, url, body)
      if (custom) return custom
      if (
        method === 'GET' &&
        /^\/api\/restaurants\/[^/]+\/place-details$/.test(url.pathname)
      ) {
        return jsonResponse(200, { data: { details: null } })
      }
      return undefined
    },
    responses: {
      ...masterDataResponses,
      ...masterData,
      'POST /api/recommendations': () => {
        const next = queue.shift()
        if (!next) throw new Error('Unexpected recommendation request.')
        return next instanceof Response || next instanceof Promise
          ? next
          : jsonResponse(200, {
              data: { adjustment: null, ...next },
            })
      },
    },
  })

  return {
    ...api,
    recommendationBodies: () =>
      api.requests
        .filter((request) => request.path === '/api/recommendations')
        .map((request) => request.body as RecommendationRequest),
  }
}

export type User = ReturnType<typeof renderApp>['user']

export async function shuffleCards(user: User) {
  await user.click(await screen.findByRole('button', { name: 'หาเมนูกัน' }))
  await screen.findByRole('heading', { name: 'มีเมนูน่าลองมาให้แล้ว' })
}

// The top-level card slots, in order (each card also holds its own nested lists).
export function cards() {
  return [...screen.getByRole('list', { name: 'การ์ดเมนู' }).children].map(
    (slot) => slot as HTMLElement,
  )
}

export function storedShortlist() {
  const stored = JSON.parse(
    sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)!,
  ) as { shortlist?: Shortlist }
  return stored.shortlist
}

export function storedConditions() {
  const stored = JSON.parse(
    sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)!,
  ) as { conditions: RecommendationConditions }
  return stored.conditions
}

export async function revealCard(user: User, position: number) {
  await user.click(
    screen.getByRole('button', { name: `เปิดการ์ดใบที่ ${position}` }),
  )
}
