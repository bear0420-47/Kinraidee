import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { toFavoriteMenuItem } from '@/schemas/favorites/favoriteSchemas'
import { RECOMMENDATION_STORAGE_KEY } from '@/schemas/meal/recommendationSchemas'
import { favoriteItem, fakeFavorites } from '@/test/fakeFavoritesApi'
import {
  cards,
  fakeShuffleApi,
  krapao,
  noodles,
  revealCard,
  shuffleCards,
  type User,
} from '@/test/fakeRecommendationApi'
import {
  currentPath,
  errorResponse,
  renderApp,
  testUser,
} from '@/test/renderApp'

const catalog = [krapao, noodles].map(toFavoriteMenuItem)
const SAVE = 'บันทึกเป็นเมนูโปรด'
const REMOVE = 'นำออกจากเมนูโปรด'

function heartIn(card: HTMLElement, name: string) {
  return within(card).getByRole<HTMLButtonElement>('button', { name })
}

function favoriteWrites(api: ReturnType<typeof fakeShuffleApi>) {
  return api.requests
    .filter(
      (request) =>
        request.path.startsWith('/api/favorites') && request.method !== 'GET',
    )
    .map((request) => `${request.method} ${request.path}`)
}

async function showRevealedCard(user: User) {
  await shuffleCards(user)
  await revealCard(user, 1)
  return cards()[0]!
}

describe('Favorites on recommendation cards', () => {
  it('sends an anonymous user to log in, keeps the cards, and favorites nothing on return', async () => {
    const favorites = fakeFavorites({ catalog })
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles] }],
      handle: favorites.handle,
    })
    const { user, router } = renderApp('/meal')
    const card = await showRevealedCard(user)
    const stored = sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)

    const heart = heartIn(card, SAVE)
    expect(heart.hasAttribute('aria-pressed')).toBe(false)
    await user.click(heart)

    expect(
      await screen.findByRole('heading', { name: 'เข้าสู่ระบบ' }),
    ).toBeTruthy()
    expect(currentPath(router)).toBe('/login?returnTo=%2Fmeal')
    expect(screen.getByRole('status').textContent).toBe(
      'เข้าสู่ระบบเพื่อบันทึกเมนูโปรด',
    )
    expect(sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)).toBe(stored)

    const password = 'correct-horse-battery'
    await user.type(screen.getByLabelText('อีเมล'), testUser.email)
    await user.type(screen.getByLabelText('รหัสผ่าน'), password)
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

    // Back on the same cards, with the same reveal state, and nothing saved.
    await screen.findByRole('heading', { name: 'เมนูที่น่าจะตรงใจ' })
    expect(currentPath(router)).toBe('/meal')
    expect(sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)).toBe(stored)
    expect(
      await within(cards()[0]!).findByRole('button', {
        name: SAVE,
        pressed: false,
      }),
    ).toBeTruthy()
    expect(favoriteWrites(api)).toEqual([])
    expect(
      screen.getByRole('button', { name: 'เปิดการ์ดใบที่ 2' }),
    ).toBeTruthy()

    // No credential or token is kept in browser storage.
    const kept = JSON.stringify({ ...localStorage, ...sessionStorage })
    expect(kept).not.toContain(password)
    expect(kept.toLowerCase()).not.toContain('token')
  })

  it('reopens the confirmation dialog after logging in from it', async () => {
    const favorites = fakeFavorites({ catalog })
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles] }],
      handle: favorites.handle,
    })
    const { user, router } = renderApp('/meal')
    await showRevealedCard(user)
    await user.click(
      screen.getByRole('button', { name: 'เลือกเมนู ผัดกะเพรา' }),
    )
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: SAVE }))
    await screen.findByRole('heading', { name: 'เข้าสู่ระบบ' })
    await user.type(screen.getByLabelText('อีเมล'), testUser.email)
    await user.type(screen.getByLabelText('รหัสผ่าน'), 'correct-horse-battery')
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

    // The same menu's dialog is open again, unsaved, with focus on the safe action.
    const reopened = await screen.findByRole('dialog', {
      name: 'เลือกเมนูนี้ใช่ไหม?',
    })
    expect(currentPath(router)).toBe('/meal')
    expect(within(reopened).getByText('ผัดกะเพรา')).toBeTruthy()
    expect(
      await within(reopened).findByRole('button', {
        name: SAVE,
        pressed: false,
      }),
    ).toBeTruthy()
    expect(document.activeElement).toBe(
      within(reopened).getByRole('button', { name: 'ขอคิดอีกที' }),
    )
    expect(favoriteWrites(api)).toEqual([])

    // With no opener to return to, closing focuses the card's choose button.
    await user.click(
      within(reopened).getByRole('button', { name: 'ขอคิดอีกที' }),
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'เลือกเมนู ผัดกะเพรา' }),
    )
  })

  it('saves and removes a favorite with PUT and DELETE, never the toggle route', async () => {
    const favorites = fakeFavorites({ catalog })
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles] }],
      currentUser: testUser,
      handle: favorites.handle,
    })
    const { user } = renderApp('/meal')
    const card = await showRevealedCard(user)

    await user.click(
      await within(card).findByRole('button', { name: SAVE, pressed: false }),
    )
    const saved = await within(card).findByRole('button', {
      name: REMOVE,
      pressed: true,
    })
    expect(favorites.items().map(({ menuItemId }) => menuItemId)).toEqual([
      'menu_1',
    ])

    await user.click(saved)
    await within(card).findByRole('button', { name: SAVE, pressed: false })
    expect(favorites.items()).toEqual([])
    expect(favoriteWrites(api)).toEqual([
      'PUT /api/favorites/menu_1',
      'DELETE /api/favorites/menu_1',
    ])
  })

  it('shows a saved menu as saved, on the card and in the confirmation dialog', async () => {
    const favorites = fakeFavorites({
      saved: [favoriteItem(catalog[0]!)],
      catalog,
    })
    fakeShuffleApi({
      results: [{ items: [krapao, noodles] }],
      currentUser: testUser,
      handle: favorites.handle,
    })
    const { user } = renderApp('/meal')
    const card = await showRevealedCard(user)

    expect(
      await within(card).findByRole('button', { name: REMOVE, pressed: true }),
    ).toBeTruthy()
    await user.click(
      screen.getByRole('button', { name: 'เลือกเมนู ผัดกะเพรา' }),
    )
    const dialog = await screen.findByRole('dialog')

    await user.click(
      within(dialog).getByRole('button', { name: REMOVE, pressed: true }),
    )
    await within(dialog).findByRole('button', { name: SAVE, pressed: false })
    await user.click(within(dialog).getByRole('button', { name: 'ขอคิดอีกที' }))
    expect(
      within(cards()[0]!).getByRole('button', { name: SAVE, pressed: false }),
    ).toBeTruthy()
  })

  it('sends a user whose session expired to log in', async () => {
    // The session ends between loading the cards and pressing the heart.
    let expired = false
    const favorites = fakeFavorites({
      catalog,
      fail: () => {
        expired = true
        return errorResponse(401, 'UNAUTHENTICATED')
      },
    })
    fakeShuffleApi({
      results: [{ items: [krapao] }],
      currentUser: testUser,
      handle: (method, url, body) =>
        expired && url.pathname === '/api/auth/me'
          ? errorResponse(401, 'UNAUTHENTICATED')
          : favorites.handle(method, url, body),
    })
    const { user, router } = renderApp('/meal')
    const card = await showRevealedCard(user)

    await user.click(
      await within(card).findByRole('button', { name: SAVE, pressed: false }),
    )

    expect(
      await screen.findByText('เข้าสู่ระบบเพื่อบันทึกเมนูโปรด'),
    ).toBeTruthy()
    expect(currentPath(router)).toBe('/login?returnTo=%2Fmeal')
  })

  it('explains a menu that became unavailable and keeps it unsaved', async () => {
    const favorites = fakeFavorites({
      catalog,
      fail: () => errorResponse(409, 'MENU_ITEM_UNAVAILABLE'),
    })
    fakeShuffleApi({
      results: [{ items: [krapao] }],
      currentUser: testUser,
      handle: favorites.handle,
    })
    const { user } = renderApp('/meal')
    const card = await showRevealedCard(user)

    await user.click(
      await within(card).findByRole('button', { name: SAVE, pressed: false }),
    )

    expect((await within(card).findByRole('alert')).textContent).toBe(
      'เมนูนี้ไม่พร้อมให้บริการแล้ว',
    )
    expect(
      within(card).getByRole('button', { name: SAVE, pressed: false }),
    ).toBeTruthy()
  })
})
