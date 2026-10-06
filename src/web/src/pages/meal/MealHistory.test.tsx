import { cleanup, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { toFavoriteMenuItem } from '@/schemas/favorites/favoriteSchemas'
import { RECOMMENDATION_STORAGE_KEY } from '@/schemas/meal/recommendationSchemas'
import { fakeHistory } from '@/test/fakeHistoryApi'
import {
  fakeShuffleApi,
  krapao,
  noodles,
  revealCard,
  shuffleCards,
  type User,
} from '@/test/fakeRecommendationApi'
import { errorResponse, renderApp, testUser } from '@/test/renderApp'

const catalog = [krapao, noodles].map(toFavoriteMenuItem)

function historyCalls(api: ReturnType<typeof fakeShuffleApi>) {
  return api.requests.filter(
    (request) => request.path === '/api/recommendation-history',
  )
}

function startFlow({
  signedIn = true,
  failRecord,
}: { signedIn?: boolean; failRecord?: () => Response } = {}) {
  const history = fakeHistory({
    catalog,
    ...(failRecord ? { failRecord } : {}),
  })
  const api = fakeShuffleApi({
    results: [{ items: [krapao, noodles] }],
    currentUser: signedIn ? testUser : null,
    handle: history.handle,
  })
  return { api, history }
}

async function openConfirmation(user: User) {
  await shuffleCards(user)
  await revealCard(user, 1)
  await user.click(screen.getByRole('button', { name: 'เลือกเมนู ผัดกะเพรา' }))
  return screen.findByRole('dialog', { name: 'เลือกเมนูนี้ใช่ไหม?' })
}

async function confirm(user: User) {
  await user.click(screen.getByRole('button', { name: 'เอาเมนูนี้แหละ' }))
  return screen.findByRole('dialog', { name: 'ได้มื้อนี้แล้ว!' })
}

describe('History in the meal flow', () => {
  it('records only the confirmed menu, once, for a signed-in user', async () => {
    const { api, history } = startFlow()
    const { user } = renderApp('/meal')

    // Revealing, opening the dialog, and thinking again write nothing.
    await openConfirmation(user)
    await user.click(screen.getByRole('button', { name: 'ขอคิดอีกที' }))
    expect(historyCalls(api)).toEqual([])

    // Choose the same card again; the cards are still on screen.
    await user.click(
      screen.getByRole('button', { name: 'เลือกเมนู ผัดกะเพรา' }),
    )
    await confirm(user)

    expect(historyCalls(api).map((request) => request.method)).toEqual(['POST'])
    // Only the menu: no conditions, rejected IDs, or shortlist.
    expect(historyCalls(api)[0]?.body).toEqual({ menuItemId: 'menu_1' })
    expect(history.rows().map((row) => row.menuItemId)).toEqual(['menu_1'])
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('never calls the history API for an anonymous user', async () => {
    const { api } = startFlow({ signedIn: false })
    const { user } = renderApp('/meal')

    await openConfirmation(user)
    await confirm(user)

    expect(historyCalls(api)).toEqual([])
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('still reaches success when the write fails, with the warning announced', async () => {
    startFlow({ failRecord: () => errorResponse(500, 'INTERNAL_ERROR') })
    const { user } = renderApp('/meal')

    await openConfirmation(user)
    const success = within(await confirm(user))

    expect((await success.findByRole('alert')).textContent).toBe(
      'เลือกเมนูสำเร็จ แต่บันทึกประวัติไม่สำเร็จ',
    )
    expect(success.getByRole('button', { name: 'กลับหน้าหลัก' })).toBeTruthy()
  })

  it('keeps the success stage after a reload, without recording again', async () => {
    const { api } = startFlow()
    const first = renderApp('/meal')
    await openConfirmation(first.user)
    await confirm(first.user)
    const stored = sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)!
    expect(JSON.parse(stored).shortlist).toMatchObject({
      chosenMenuItemId: 'menu_1',
      confirmed: true,
    })
    const writesBefore = historyCalls(api).length

    // Reload: a fresh app reads the same session state.
    cleanup()
    const reloaded = startFlow()
    sessionStorage.setItem(RECOMMENDATION_STORAGE_KEY, stored)
    renderApp('/meal')

    expect(
      await screen.findByRole('dialog', { name: 'ได้มื้อนี้แล้ว!' }),
    ).toBeTruthy()
    expect(historyCalls(reloaded.api)).toEqual([])
    expect(writesBefore).toBe(1)
  })
})
