import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { favoritesQueryKey } from '@/hooks/favorites/useFavorites'
import type { FavoriteMenuItem } from '@/schemas/favorites/favoriteSchemas'
import { fakeFavorites, favoriteItem } from '@/test/fakeFavoritesApi'
import {
  currentPath,
  errorResponse,
  fakeAuthApi,
  renderApp,
  testAdmin,
  testUser,
} from '@/test/renderApp'

function menuItem(id: string, th: string): FavoriteMenuItem {
  return {
    id,
    name: { th, en: `Dish ${id}` },
    price: 65,
    imageUrl: null,
    restaurant: { id: 'r_1', name: { th: 'ครัวไทย', en: 'Thai Kitchen' } },
  }
}

const newest = favoriteItem(menuItem('menu_2', 'ก๋วยเตี๋ยว'), {
  createdAt: '2026-10-07T00:00:00.000Z',
})
const unavailable = favoriteItem(
  { ...menuItem('menu_1', 'ผัดกะเพรา'), imageUrl: '/uploads/krapao.png' },
  { createdAt: '2026-10-06T00:00:00.000Z', available: false },
)

function rows() {
  return within(
    screen.getByRole('list', { name: 'รายการเมนูโปรด' }),
  ).getAllByRole('listitem')
}

describe('FavoritesPage', () => {
  it('lists favorites newest first with their details', async () => {
    const favorites = fakeFavorites({ saved: [newest, unavailable] })
    fakeAuthApi({ currentUser: testUser, handle: favorites.handle })
    renderApp('/account/favorites')

    await screen.findByRole('list', { name: 'รายการเมนูโปรด' })
    const [first, second] = rows()
    expect(within(first!).getByText('ก๋วยเตี๋ยว')).toBeTruthy()
    expect(within(first!).getByText('ครัวไทย')).toBeTruthy()
    expect(within(first!).getByText('฿65')).toBeTruthy()
    expect(within(first!).getByText('ไม่มีรูป')).toBeTruthy()
    expect(within(first!).queryByText('ไม่พร้อมให้บริการ')).toBeNull()
    expect(within(second!).getByText('ผัดกะเพรา')).toBeTruthy()
    expect(
      within(second!).getByRole<HTMLImageElement>('presentation').src,
    ).toBe('http://localhost:3000/uploads/krapao.png')
  })

  it('marks an unavailable favorite in text and lets it be removed', async () => {
    const favorites = fakeFavorites({ saved: [newest, unavailable] })
    const api = fakeAuthApi({
      currentUser: testUser,
      handle: favorites.handle,
    })
    const { user } = renderApp('/account/favorites')
    await screen.findByRole('list', { name: 'รายการเมนูโปรด' })

    const row = rows()[1]!
    expect(within(row).getByText('ไม่พร้อมให้บริการ')).toBeTruthy()
    const remove = within(row).getByRole('button', {
      name: 'นำออกจากเมนูโปรด',
    })
    expect(remove.getAttribute('aria-describedby')).toBe(
      within(row).getByText('ผัดกะเพรา').id,
    )
    await user.click(remove)

    expect(
      await screen.findByText('นำผัดกะเพราออกจากเมนูโปรดแล้ว'),
    ).toBeTruthy()
    expect(rows()).toHaveLength(1)
    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'เมนูโปรดที่บันทึกไว้' }),
    )
    expect(
      api.requests.some(
        (request) =>
          request.method === 'DELETE' &&
          request.path === '/api/favorites/menu_1',
      ),
    ).toBe(true)
  })

  it('explains a failed removal and keeps the row', async () => {
    const favorites = fakeFavorites({
      saved: [newest],
      fail: () => errorResponse(500, 'INTERNAL_ERROR'),
    })
    fakeAuthApi({ currentUser: testUser, handle: favorites.handle })
    const { user } = renderApp('/account/favorites')
    await screen.findByRole('list', { name: 'รายการเมนูโปรด' })

    await user.click(screen.getByRole('button', { name: 'นำออกจากเมนูโปรด' }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'นำเมนูออกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
    )
    expect(rows()).toHaveLength(1)
  })

  it('keeps focus on the page after the last favorite is removed', async () => {
    fakeAuthApi({
      currentUser: testUser,
      handle: fakeFavorites({ saved: [newest] }).handle,
    })
    const { user } = renderApp('/account/favorites')
    await screen.findByRole('list', { name: 'รายการเมนูโปรด' })

    await user.click(screen.getByRole('button', { name: 'นำออกจากเมนูโปรด' }))

    const area = screen.getByRole('region', { name: 'เมนูโปรดที่บันทึกไว้' })
    expect(
      await within(area).findByText(
        'ยังไม่มีเมนูโปรด กดรูปหัวใจบนการ์ดเมนูเพื่อบันทึก',
      ),
    ).toBeTruthy()
    expect(document.activeElement).toBe(area)
    expect(screen.getByText('นำก๋วยเตี๋ยวออกจากเมนูโปรดแล้ว')).toBeTruthy()
  })

  it('shows an empty state', async () => {
    fakeAuthApi({ currentUser: testUser, handle: fakeFavorites().handle })
    renderApp('/account/favorites')

    expect(
      await screen.findByText(
        'ยังไม่มีเมนูโปรด กดรูปหัวใจบนการ์ดเมนูเพื่อบันทึก',
      ),
    ).toBeTruthy()
  })

  it('works the same for an ADMIN account', async () => {
    fakeAuthApi({
      currentUser: testAdmin,
      handle: fakeFavorites({ saved: [newest] }).handle,
    })
    renderApp('/account/favorites')

    expect(await screen.findByText('ก๋วยเตี๋ยว')).toBeTruthy()
  })

  it('sends an anonymous visitor to log in first', async () => {
    fakeAuthApi()
    const { router } = renderApp('/account/favorites')

    await screen.findByRole('heading', { name: 'เข้าสู่ระบบ' })
    expect(currentPath(router)).toBe('/login?returnTo=%2Faccount%2Ffavorites')
  })

  it('is linked from the account page, and logging out drops cached favorites', async () => {
    fakeAuthApi({
      currentUser: testUser,
      handle: fakeFavorites({ saved: [newest] }).handle,
    })
    const { user, queryClient } = renderApp('/account')

    await user.click(await screen.findByRole('link', { name: 'เมนูโปรด' }))
    await screen.findByText('ก๋วยเตี๋ยว')
    expect(
      queryClient.getQueriesData({ queryKey: favoritesQueryKey }),
    ).not.toEqual([])

    await user.click(screen.getByRole('link', { name: 'กลับไปบัญชีของฉัน' }))
    await user.click(await screen.findByRole('button', { name: 'ออกจากระบบ' }))
    await screen.findByRole('heading', { name: 'วันนี้กินอะไรดี?' })
    expect(queryClient.getQueriesData({ queryKey: favoritesQueryKey })).toEqual(
      [],
    )
  })
})
