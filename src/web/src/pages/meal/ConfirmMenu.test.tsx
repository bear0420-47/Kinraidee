import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RECOMMENDATION_STORAGE_KEY } from '@/schemas/meal/recommendationSchemas'
import {
  curry,
  fakeShuffleApi,
  krapao,
  noodles,
  revealCard,
  shuffleCards,
  somtam,
  type User,
} from '@/test/fakeRecommendationApi'
import { currentPath, renderApp, testUser } from '@/test/renderApp'

const withPhoto = { ...krapao, imageUrl: '/uploads/krapao.png' }

async function chooseMenu(user: User, name: string) {
  await user.click(screen.getByRole('button', { name: `เลือกเมนู ${name}` }))
  return screen.findByRole('dialog', { name: 'เลือกเมนูนี้ใช่ไหม?' })
}

// Only the master data and the recommendation request itself may be called.
const allowedPaths = [
  '/api/auth/me',
  '/api/food-types',
  '/api/recommendations',
  '/api/tastes',
  '/api/zones',
]

function requestedPaths(api: ReturnType<typeof fakeShuffleApi>) {
  return [...new Set(api.requests.map((request) => request.path))].sort()
}

describe('Confirming a menu', () => {
  it('shows the chosen card’s details from the response, without another request', async () => {
    const api = fakeShuffleApi({ results: [{ items: [withPhoto, noodles] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await user.click(screen.getByRole('button', { name: 'เปิดทั้งหมด' }))

    const confirm = within(await chooseMenu(user, 'ผัดกะเพรา'))
    expect(confirm.getByText('ผัดกะเพรา')).toBeTruthy()
    expect(confirm.getByText('ครัวไทย')).toBeTruthy()
    expect(confirm.getByText('หน้ามอ')).toBeTruthy()
    expect(confirm.getByText('฿60')).toBeTruthy()
    expect(confirm.getByRole<HTMLImageElement>('presentation').src).toBe(
      'http://localhost:3000/uploads/krapao.png',
    )
    expect(
      within(confirm.getByRole('list', { name: 'เหตุผลที่แนะนำ' }))
        .getAllByRole('listitem')
        .map((line) => line.textContent),
    ).toEqual([
      'อยู่ในงบที่เลือก',
      'ตรงกับรสชาติที่เลือก',
      'เปิดรับอาหารได้ทุกประเภท',
      'เปิดรับได้ทุกโซน',
    ])
    expect(confirm.queryByText(/นาที|รอคิว/)).toBeNull()
    expect(api.recommendationBodies()).toHaveLength(1)
    expect(requestedPaths(api)).toEqual(allowedPaths)
  })

  it('uses the approved fallback for a missing or broken photo', async () => {
    const brokenPhoto = {
      ...noodles,
      imageUrl: 'https://images.example.com/x.jpg',
    }
    fakeShuffleApi({ results: [{ items: [krapao, brokenPhoto] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await user.click(screen.getByRole('button', { name: 'เปิดทั้งหมด' }))

    expect(
      within(await chooseMenu(user, 'ผัดกะเพรา')).getByText('ไม่มีรูปเมนู'),
    ).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'ขอคิดอีกที' }))

    const confirm = within(await chooseMenu(user, 'ก๋วยเตี๋ยว'))
    fireEvent.error(confirm.getByRole('presentation'))
    expect(await confirm.findByText('โหลดรูปไม่ได้')).toBeTruthy()
  })

  it('traps focus in the dialog and keeps the cards inert behind it', async () => {
    fakeShuffleApi({ results: [{ items: [krapao] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await revealCard(user, 1)
    await chooseMenu(user, 'ผัดกะเพรา')

    const rethink = screen.getByRole('button', { name: 'ขอคิดอีกที' })
    const confirm = screen.getByRole('button', { name: 'เอาเมนูนี้แหละ' })
    expect(document.activeElement).toBe(rethink)
    await user.tab()
    expect(document.activeElement).toBe(confirm)
    await user.tab()
    expect(document.activeElement).toBe(rethink)
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(confirm)
    expect(
      screen
        .getByRole('heading', { name: 'เมนูที่น่าจะตรงใจ', hidden: true })
        .closest('[inert]'),
    ).not.toBeNull()
  })
})

describe('Thinking again', () => {
  it.each([
    [
      'ขอคิดอีกที',
      (user: User) =>
        user.click(screen.getByRole('button', { name: 'ขอคิดอีกที' })),
    ],
    ['Escape', (user: User) => user.keyboard('{Escape}')],
  ])(
    '%s restores the exact shortlist, reveal, and undo state, and returns focus',
    async (_, rethink) => {
      const api = fakeShuffleApi({
        results: [{ items: [krapao, noodles, curry] }, { items: [somtam] }],
      })
      const { user } = renderApp('/meal')
      await shuffleCards(user)
      // A rejected card with a face-down replacement, one revealed card, and an undo record.
      await revealCard(user, 1)
      await user.click(
        screen.getByRole('button', { name: 'ไม่เอาเมนู ผัดกะเพรา' }),
      )
      await screen.findByRole('button', { name: 'เปิดการ์ดใบที่ 1' })
      await revealCard(user, 2)
      const before = sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)

      await chooseMenu(user, 'ก๋วยเตี๋ยว')
      await rethink(user)

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)).toBe(before)
      expect(
        screen.getByRole('button', { name: 'เปิดการ์ดใบที่ 1' }),
      ).toBeTruthy()
      expect(
        screen.getByRole('button', { name: 'เปิดการ์ดใบที่ 3' }),
      ).toBeTruthy()
      expect(screen.getByRole('button', { name: 'เลิกทำ' })).toBeTruthy()
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'เลือกเมนู ก๋วยเตี๋ยว' }),
      )
      expect(api.recommendationBodies()).toHaveLength(2)
    },
  )
})

describe('Success', () => {
  async function confirmMenu(user: User) {
    await shuffleCards(user)
    await revealCard(user, 1)
    await chooseMenu(user, 'ผัดกะเพรา')
    await user.click(screen.getByRole('button', { name: 'เอาเมนูนี้แหละ' }))
    return screen.findByRole('dialog', { name: 'ได้มื้อนี้แล้ว!' })
  }

  it('announces the success state with กลับหน้าหลัก as its only action', async () => {
    fakeShuffleApi({ results: [{ items: [krapao] }] })
    const { user } = renderApp('/meal')
    const success = within(await confirmMenu(user))

    expect(success.getByRole('status').textContent).toBe(
      'ขอให้อร่อยกับผัดกะเพรา ที่ครัวไทย',
    )
    const home = success.getByRole('button', { name: 'กลับหน้าหลัก' })
    expect(success.getAllByRole('button')).toEqual([home])
    expect(document.activeElement).toBe(home)
  })

  it.each([
    ['an anonymous', null],
    ['a signed-in', testUser],
  ])(
    'writes no history for %s user, and กลับหน้าหลัก clears the flow and returns Home',
    async (_, currentUser) => {
      const api = fakeShuffleApi({
        results: [{ items: [krapao, noodles] }],
        currentUser,
      })
      const { user, router } = renderApp('/meal')
      await confirmMenu(user)
      expect(requestedPaths(api)).toEqual(allowedPaths)

      await user.click(screen.getByRole('button', { name: 'กลับหน้าหลัก' }))

      expect(
        await screen.findByRole('heading', { name: 'วันนี้กินอะไรดี?' }),
      ).toBeTruthy()
      expect(currentPath(router)).toBe('/')
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)).toBeNull()
      expect(sessionStorage.length).toBe(0)
      expect(requestedPaths(api)).toEqual(allowedPaths)
    },
  )

  it('starts the next flow from a clean first step', async () => {
    fakeShuffleApi({ results: [{ items: [krapao] }] })
    const { user } = renderApp('/meal')
    await confirmMenu(user)
    await user.click(screen.getByRole('button', { name: 'กลับหน้าหลัก' }))
    await user.click(
      await screen.findByRole('link', { name: 'ช่วยเลือกมื้อให้ฉัน' }),
    )

    expect(
      await screen.findByRole('heading', { name: /เลือกงบประมาณ/ }),
    ).toBeTruthy()
    expect(screen.getByText('ข้อ 1 จาก 4')).toBeTruthy()
    expect(
      screen
        .getAllByRole<HTMLInputElement>('radio')
        .filter((radio) => radio.checked),
    ).toEqual([])
    expect(sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)).toBeNull()
  })

  it('treats Escape on the success state as กลับหน้าหลัก', async () => {
    fakeShuffleApi({ results: [{ items: [krapao] }] })
    const { user, router } = renderApp('/meal')
    await confirmMenu(user)
    await user.keyboard('{Escape}')

    expect(
      await screen.findByRole('heading', { name: 'วันนี้กินอะไรดี?' }),
    ).toBeTruthy()
    expect(currentPath(router)).toBe('/')
    expect(sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)).toBeNull()
  })
})
