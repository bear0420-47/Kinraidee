import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { preferencesQueryKey } from '@/hooks/preferences/usePreference'
import {
  RECOMMENDATION_STORAGE_KEY,
  type ConditionDraft,
} from '@/schemas/meal/recommendationSchemas'
import type { Preference } from '@/schemas/preferences/preferenceSchemas'
import { fakePreferences } from '@/test/fakePreferencesApi'
import { fakeShuffleApi, type User } from '@/test/fakeRecommendationApi'
import { jsonResponse, renderApp, testUser } from '@/test/renderApp'

const saved: Preference = {
  budget: 'BETWEEN_50_100',
  tasteId: 'taste_1',
  foodTypeId: null,
  zoneId: 'zone_1',
}

// A fresh flow (no stored answers), optionally signed in with a saved preference.
function startFlow({
  preference = saved,
  signedIn = true,
  stored,
}: {
  preference?: Preference | null
  signedIn?: boolean
  stored?: { step: string; conditions: ConditionDraft }
} = {}) {
  const api = fakeShuffleApi({
    results: [],
    currentUser: signedIn ? testUser : null,
    handle: fakePreferences({ saved: preference }).handle,
  })
  sessionStorage.clear()
  if (stored) {
    sessionStorage.setItem(RECOMMENDATION_STORAGE_KEY, JSON.stringify(stored))
  }
  return api
}

function radio(name: string) {
  return screen.getByRole<HTMLInputElement>('radio', { name })
}

function storedConditions() {
  const raw = sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)
  return raw
    ? (JSON.parse(raw) as { conditions: ConditionDraft }).conditions
    : {}
}

// The steps render before the saved preference arrives, so a check that a default did NOT
// apply must first wait for it to load.
async function preferenceLoaded(
  queryClient: ReturnType<typeof renderApp>['queryClient'],
) {
  // The idle query from before sign-in was checked is also cached, so look at every entry.
  await waitFor(() =>
    expect(
      queryClient
        .getQueriesData({ queryKey: preferencesQueryKey })
        .some(([, data]) => data),
    ).toBe(true),
  )
}

async function next(user: User) {
  await user.click(screen.getByRole('button', { name: /ถัดไป/ }))
}

describe('Saved defaults in the meal flow', () => {
  it.each(['mouse', 'touch', 'pen'])(
    'advances a saved answer after a %s label tap with a zero-detail click',
    async (pointerType) => {
      startFlow()
      renderApp('/meal')
      const budget = await screen.findByRole('radio', {
        name: '฿50–100',
        checked: true,
      })
      const chip = budget.closest('label')!.querySelector('span')!
      fireEvent.pointerDown(chip, { pointerType })
      fireEvent.pointerUp(chip, { pointerType })
      fireEvent.click(chip, { detail: 0 })
      await screen.findByText('ข้อ 2 จาก 4')
      expect(storedConditions()).toEqual({ budget: 'BETWEEN_50_100' })
    },
  )

  it.each(['pointerCancel', 'keyDown'] as const)(
    'clears pointer activation on %s before a keyboard-style click',
    async (interruption) => {
      startFlow({ signedIn: false })
      renderApp('/meal')
      const budget = await screen.findByRole('radio', { name: '฿50–100' })
      fireEvent.pointerDown(budget)
      if (interruption === 'pointerCancel') fireEvent.pointerCancel(budget)
      else fireEvent.keyDown(budget, { key: ' ' })
      fireEvent.click(budget, { detail: 0 })
      expect((budget as HTMLInputElement).checked).toBe(true)
      expect(screen.getByText('ข้อ 1 จาก 4')).toBeTruthy()
      expect(storedConditions().budget).toBe('BETWEEN_50_100')
    },
  )

  it('opens additional choices when a saved taste default is outside the preview', async () => {
    const items = Array.from({ length: 6 }, (_, index) => ({
      id: index === 5 ? saved.tasteId! : `taste_other_${index}`,
      name: {
        th: index === 5 ? 'เผ็ด' : `รสอื่น ${index + 1}`,
        en: `Taste ${index + 1}`,
      },
      icon: 'flame',
      sortOrder: index,
    }))
    fakeShuffleApi({
      results: [],
      currentUser: testUser,
      handle: fakePreferences({ saved }).handle,
      masterData: {
        'GET /api/tastes': () => jsonResponse(200, { data: { items } }),
      },
    })
    sessionStorage.clear()
    const { user, queryClient } = renderApp('/meal')
    await preferenceLoaded(queryClient)
    await next(user)
    const disclosure = await screen.findByLabelText(
      'ดูรสชาติอื่นอีก 1 ตัวเลือก',
    )
    expect(disclosure.closest('details')?.open).toBe(true)
    expect(radio('เผ็ด').checked).toBe(true)
    // Merely showing a saved choice does not commit it.
    expect(storedConditions().tasteId).toBeUndefined()
    await next(user)
    expect(storedConditions().tasteId).toBe(saved.tasteId)
  })

  it('shows each saved default, commits it on ถัดไป, and leaves a field without one unanswered', async () => {
    startFlow()
    const { user } = renderApp('/meal')

    expect(
      await screen.findByRole('radio', { name: '฿50–100', checked: true }),
    ).toBeTruthy()
    // Shown, but not stored until the user moves on.
    expect(storedConditions()).toEqual({})

    await next(user)
    expect(
      (await screen.findByRole<HTMLInputElement>('radio', { name: 'เผ็ด' }))
        .checked,
    ).toBe(true)
    await next(user)

    // Food type has no default, so nothing is selected and the step must be answered.
    await screen.findByText('ข้อ 3 จาก 4')
    expect(
      screen
        .getAllByRole<HTMLInputElement>('radio')
        .filter((input) => input.checked),
    ).toEqual([])
    await user.click(radio('ข้าว'))

    expect(
      (await screen.findByRole<HTMLInputElement>('radio', { name: 'หน้ามอ' }))
        .checked,
    ).toBe(true)
    await next(user)

    await screen.findByRole('heading', { name: 'เช็กก่อนหาเมนู' })
    expect(storedConditions()).toEqual({
      budget: 'BETWEEN_50_100',
      tasteId: 'taste_1',
      foodTypeId: 'food_1',
      zoneId: 'zone_1',
    })
  })

  it('pre-selects the "any" choice for a saved "any" and commits it as any', async () => {
    startFlow({
      preference: { ...saved, tasteId: 'ANY' },
      stored: { step: 'taste', conditions: { budget: 'UNDER_50' } },
    })
    const { user } = renderApp('/meal')

    expect(
      await screen.findByRole('radio', { name: 'อะไรก็ได้', checked: true }),
    ).toBeTruthy()
    await next(user)

    await screen.findByText('ข้อ 3 จาก 4')
    expect(storedConditions()).toEqual({ budget: 'UNDER_50', tasteId: null })
  })

  it('lets the user override a default', async () => {
    startFlow()
    const { user } = renderApp('/meal')
    await screen.findByRole('radio', { name: '฿50–100', checked: true })

    await user.click(radio('ต่ำกว่า ฿50'))

    await screen.findByText('ข้อ 2 จาก 4')

    expect(storedConditions().budget).toBe('UNDER_50')
  })

  it('accepts a preselected default with one pointer activation', async () => {
    startFlow()
    const { user } = renderApp('/meal')
    const budget = await screen.findByRole('radio', {
      name: '฿50–100',
      checked: true,
    })
    await user.click(budget)
    await screen.findByText('ข้อ 2 จาก 4')
    expect(storedConditions()).toEqual({ budget: 'BETWEEN_50_100' })
  })

  it('keeps an answer the user already gave, even "any"', async () => {
    startFlow({
      stored: {
        step: 'taste',
        conditions: { budget: 'UNDER_50', tasteId: null },
      },
    })
    const { queryClient } = renderApp('/meal')

    await screen.findByText('ข้อ 2 จาก 4')
    await preferenceLoaded(queryClient)
    expect(radio('อะไรก็ได้').checked).toBe(true)
    expect(radio('เผ็ด').checked).toBe(false)
  })

  it('drops a default whose record no longer exists', async () => {
    startFlow({
      preference: { ...saved, zoneId: 'zone_gone' },
      stored: {
        step: 'zone',
        conditions: { budget: 'UNDER_50', tasteId: null, foodTypeId: null },
      },
    })
    const { user, queryClient } = renderApp('/meal')

    await screen.findByText('ข้อ 4 จาก 4')
    await screen.findByRole('radio', { name: 'หน้ามอ' })
    await preferenceLoaded(queryClient)
    expect(
      screen
        .getAllByRole<HTMLInputElement>('radio')
        .filter((input) => input.checked),
    ).toEqual([])

    // The step is unanswered, so ถัดไป asks for a choice instead of saving the missing ID.
    await next(user)
    expect(screen.getByText('เลือกโซนก่อนนะ')).toBeTruthy()
    expect(screen.getByText('ข้อ 4 จาก 4')).toBeTruthy()
    expect(storedConditions()).not.toHaveProperty('zoneId')
  })

  it('gives an anonymous user no defaults and no preference request', async () => {
    const api = startFlow({ signedIn: false })
    renderApp('/meal')

    await screen.findByText('ข้อ 1 จาก 4')
    expect(
      screen
        .getAllByRole<HTMLInputElement>('radio')
        .filter((input) => input.checked),
    ).toEqual([])
    expect(
      api.requests.some((request) => request.path === '/api/preferences'),
    ).toBe(false)
  })
})
