import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { historyQueryKey } from '@/hooks/recommendation-history/useRecommendationHistory'
import { fakeHistory, historyItem } from '@/test/fakeHistoryApi'
import {
  currentPath,
  errorResponse,
  fakeAuthApi,
  renderApp,
  testAdmin,
  testUser,
} from '@/test/renderApp'

function menuItem(index: number) {
  return {
    id: `menu_${index}`,
    name: { th: `เมนู ${index}`, en: `Dish ${index}` },
    price: 60 + index,
    imageUrl: null,
    restaurant: { id: 'r_1', name: { th: 'ครัวไทย', en: 'Thai Kitchen' } },
  }
}

// `count` rows, newest first: menu_1 was selected last.
function rows(count: number) {
  return Array.from({ length: count }, (_, index) =>
    historyItem(menuItem(index + 1), {
      id: `history_${index + 1}`,
      selectedAt: new Date(Date.UTC(2026, 9, 7, 12 - index)).toISOString(),
    }),
  )
}

function fakeApi(
  options: Parameters<typeof fakeHistory>[0] = {},
  currentUser = testUser,
) {
  const history = fakeHistory(options)
  const api = fakeAuthApi({ currentUser, handle: history.handle })
  const calls = (method: string) =>
    api.requests.filter(
      (request) =>
        request.method === method &&
        request.path.startsWith('/api/recommendation-history'),
    )
  return { ...api, history, calls }
}

function listedNames() {
  return within(screen.getByRole('list', { name: 'รายการประวัติเมนูที่เลือก' }))
    .getAllByRole('listitem')
    .map((row) => row.getAttribute('aria-labelledby'))
    .map((id) => document.getElementById(id!)?.textContent)
}

describe('HistoryPage', () => {
  it('sends an anonymous visitor to log in first', async () => {
    fakeAuthApi()
    const { router } = renderApp('/account/history')

    await screen.findByRole('heading', { name: 'เข้าสู่ระบบ' })
    expect(currentPath(router)).toBe('/login?returnTo=%2Faccount%2Fhistory')
  })

  it('lists the newest selections first, each labelled by its menu', async () => {
    fakeApi({ saved: rows(3) })
    renderApp('/account/history')

    await screen.findByRole('list', { name: 'รายการประวัติเมนูที่เลือก' })
    expect(listedNames()).toEqual(['เมนู 1', 'เมนู 2', 'เมนู 3'])
    expect(screen.getAllByText(/^เลือกเมื่อ /)).toHaveLength(3)
    // A single page needs no page controls.
    expect(
      screen.queryByRole('navigation', { name: 'หน้าประวัติเมนูที่เลือก' }),
    ).toBeNull()
  })

  it('pages through more than 20 selections with labelled controls', async () => {
    const api = fakeApi({ saved: rows(25) })
    const { user } = renderApp('/account/history')
    await screen.findByRole('list', { name: 'รายการประวัติเมนูที่เลือก' })

    const pages = screen.getByRole('navigation', {
      name: 'หน้าประวัติเมนูที่เลือก',
    })
    expect(
      within(pages).getByText('หน้า 1 จาก 2 · ทั้งหมด 25 รายการ'),
    ).toBeTruthy()
    expect(listedNames()).toHaveLength(20)

    await user.click(within(pages).getByRole('button', { name: /ถัดไป/ }))

    await screen.findByText('หน้า 2 จาก 2 · ทั้งหมด 25 รายการ')
    expect(listedNames()).toEqual([
      'เมนู 21',
      'เมนู 22',
      'เมนู 23',
      'เมนู 24',
      'เมนู 25',
    ])
    expect(api.calls('GET').map((request) => request.path)).toContain(
      '/api/recommendation-history?page=2&pageSize=20',
    )
  })

  it('marks an unavailable menu in text', async () => {
    fakeApi({
      saved: [historyItem(menuItem(1), { available: false })],
    })
    renderApp('/account/history')

    expect(await screen.findByText('เมนูนี้ไม่พร้อมใช้งานแล้ว')).toBeTruthy()
  })

  it('shows the empty state with the clear button disabled', async () => {
    fakeApi()
    renderApp('/account/history')

    expect(await screen.findByText('ยังไม่มีประวัติเมนูที่เลือก')).toBeTruthy()
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'ล้างประวัติทั้งหมด',
      }).disabled,
    ).toBe(true)
  })

  it('clears everything only after confirmation, then announces it and keeps focus', async () => {
    const api = fakeApi({ saved: rows(3) })
    const { user } = renderApp('/account/history')
    await screen.findByRole('list', { name: 'รายการประวัติเมนูที่เลือก' })

    await user.click(screen.getByRole('button', { name: 'ล้างประวัติทั้งหมด' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'ล้างประวัติทั้งหมด?',
    })
    expect(
      within(dialog).getByText('การล้างประวัติจะลบรายการที่คุณเคยเลือกทั้งหมด'),
    ).toBeTruthy()
    expect(document.activeElement).toBe(
      within(dialog).getByRole('button', { name: 'ยกเลิก' }),
    )
    await user.click(within(dialog).getByRole('button', { name: 'ยกเลิก' }))
    expect(api.calls('DELETE')).toEqual([])

    await user.click(screen.getByRole('button', { name: 'ล้างประวัติทั้งหมด' }))
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'ล้างประวัติทั้งหมด',
      }),
    )

    expect(await screen.findByText('ยังไม่มีประวัติเมนูที่เลือก')).toBeTruthy()
    expect(screen.getByText('ล้างประวัติแล้ว').getAttribute('role')).toBe(
      'status',
    )
    expect(api.calls('DELETE')).toHaveLength(1)
    expect(api.history.rows()).toEqual([])
    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'ประวัติที่บันทึกไว้' }),
    )
  })

  it('keeps the history when clearing fails', async () => {
    // Every DELETE fails on top of the stateful fake.
    const failing = fakeHistory({ saved: rows(1) })
    fakeAuthApi({
      currentUser: testUser,
      handle: (method, url, body) =>
        method === 'DELETE'
          ? errorResponse(500, 'INTERNAL_ERROR')
          : failing.handle(method, url, body),
    })
    const { user } = renderApp('/account/history')
    await screen.findByRole('list', { name: 'รายการประวัติเมนูที่เลือก' })

    await user.click(screen.getByRole('button', { name: 'ล้างประวัติทั้งหมด' }))
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'ล้างประวัติทั้งหมด',
      }),
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'ล้างประวัติไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
    )
    expect(failing.rows()).toHaveLength(1)
  })

  it('works the same for an ADMIN account', async () => {
    fakeApi({ saved: rows(1) }, testAdmin)
    renderApp('/account/history')

    expect(await screen.findByText('เมนู 1')).toBeTruthy()
  })

  it('is linked from the account page, and logging out drops the cached history', async () => {
    fakeApi({ saved: rows(1) })
    const { user, queryClient } = renderApp('/account')

    await user.click(
      await screen.findByRole('link', { name: 'ประวัติเมนูที่เลือก' }),
    )
    await screen.findByText('เมนู 1')
    expect(
      queryClient.getQueriesData({ queryKey: historyQueryKey }),
    ).not.toEqual([])

    await user.click(screen.getByRole('link', { name: 'กลับไปบัญชีของฉัน' }))
    await user.click(await screen.findByRole('button', { name: 'ออกจากระบบ' }))
    await screen.findByRole('heading', { name: 'วันนี้กินอะไรดี?' })
    expect(queryClient.getQueriesData({ queryKey: historyQueryKey })).toEqual(
      [],
    )
  })
})
