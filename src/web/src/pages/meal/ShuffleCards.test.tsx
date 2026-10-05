import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  RECOMMENDATION_STORAGE_KEY,
  type Relaxation,
} from '@/schemas/meal/recommendationSchemas'
import {
  cards,
  conditions,
  curry,
  fakeShuffleApi,
  krapao,
  noodles,
  revealCard,
  shuffleCards,
  somtam,
  storedShortlist,
  type User,
} from '@/test/fakeRecommendationApi'
import {
  errorResponse,
  jsonResponse,
  renderApp,
  testUser,
} from '@/test/renderApp'

describe('Shuffling', () => {
  it('sends the initial request and shows face-down cards, announcing the loading state', async () => {
    let release: (response: Response) => void = () => undefined
    const pending = new Promise<Response>((resolve) => {
      release = resolve
    })
    const api = fakeShuffleApi({ results: [pending] })
    const { user } = renderApp('/meal')

    await user.click(
      await screen.findByRole('button', { name: 'สับการ์ดเมนู' }),
    )
    expect(
      screen
        .getAllByText('กำลังสับการ์ดเมนู...')
        .some((element) => element.closest('[role="status"]')),
    ).toBe(true)
    release(
      jsonResponse(200, {
        data: { items: [krapao, noodles, curry], relaxation: null },
      }),
    )

    const heading = await screen.findByRole('heading', {
      name: 'เมนูที่น่าจะตรงใจ',
    })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(api.recommendationBodies()).toEqual([
      {
        conditions,
        rejectedMenuItemIds: [],
        displayedMenuItemIds: [],
        count: 3,
      },
    ])
    expect(cards()).toHaveLength(3)
    for (const card of cards()) {
      expect(within(card).getByText('ยังไม่เปิด')).toBeTruthy()
    }
    expect(screen.queryByText('ผัดกะเพรา')).toBeNull()
  })

  it('renders only the returned cards when fewer than three match', async () => {
    fakeShuffleApi({ results: [{ items: [krapao, noodles] }] })
    const { user } = renderApp('/meal')

    await shuffleCards(user)

    expect(cards()).toHaveLength(2)
    expect(
      screen.queryByRole('button', { name: 'เปิดการ์ดใบที่ 3' }),
    ).toBeNull()
  })

  it('works the same for a signed-in user', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao] }],
      currentUser: testUser,
    })
    const { user } = renderApp('/meal')

    await shuffleCards(user)

    expect(screen.getByRole('link', { name: 'บัญชีของฉัน' })).toBeTruthy()
    expect(cards()).toHaveLength(1)
    expect(api.recommendationBodies()[0]?.count).toBe(3)
  })

  it('explains a failed shuffle and stays on the summary', async () => {
    fakeShuffleApi({ results: [errorResponse(500, 'INTERNAL_SERVER_ERROR')] })
    const { user } = renderApp('/meal')

    await user.click(
      await screen.findByRole('button', { name: 'สับการ์ดเมนู' }),
    )

    expect(
      await screen.findByText('สับการ์ดเมนูไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'สรุปมื้อที่ต้องการ' }),
    ).toBeTruthy()
  })
})

describe('Revealing', () => {
  it('reveals one card without calling the API, with details and rationale', async () => {
    const api = fakeShuffleApi({ results: [{ items: [krapao, noodles] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)

    await revealCard(user, 1)

    const heading = screen.getByRole('heading', { name: 'ผัดกะเพรา' })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    const card = heading.closest('article')!
    expect(within(card).getByText('การ์ดใบที่ 1 · เปิดแล้ว')).toBeTruthy()
    expect(within(card).getByText('ครัวไทย')).toBeTruthy()
    expect(within(card).getByText('฿60')).toBeTruthy()
    expect(
      within(within(card).getByRole('list', { name: 'เหตุผลที่แนะนำ' }))
        .getAllByRole('listitem')
        .map((line) => line.textContent),
    ).toEqual([
      'อยู่ในงบที่เลือก',
      'ตรงกับรสชาติที่เลือก',
      'เปิดรับอาหารได้ทุกประเภท',
      'เปิดรับได้ทุกโซน',
    ])
    // The second card stays face-down, and revealing made no request.
    expect(
      screen.getByRole('button', { name: 'เปิดการ์ดใบที่ 2' }),
    ).toBeTruthy()
    expect(api.recommendationBodies()).toHaveLength(1)
  })

  it('reveals every card with เปิดทั้งหมด', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles, curry] }],
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)

    await user.click(screen.getByRole('button', { name: 'เปิดทั้งหมด' }))

    for (const name of ['ผัดกะเพรา', 'ก๋วยเตี๋ยว', 'แกงเขียวหวาน']) {
      expect(screen.getByRole('heading', { name })).toBeTruthy()
    }
    expect(screen.queryByText('ยังไม่เปิด')).toBeNull()
    expect(screen.queryByRole('button', { name: 'เปิดทั้งหมด' })).toBeNull()
    expect(api.recommendationBodies()).toHaveLength(1)
  })

  it('fills the photo area for a photo, a missing photo, and a broken photo alike', async () => {
    const withPhoto = { ...krapao, imageUrl: '/uploads/krapao.png' }
    const brokenPhoto = {
      ...curry,
      imageUrl: 'https://images.example.com/x.jpg',
    }
    fakeShuffleApi({ results: [{ items: [withPhoto, noodles, brokenPhoto] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await user.click(screen.getByRole('button', { name: 'เปิดทั้งหมด' }))

    const [photo, missing, broken] = cards()
    expect(within(photo!).getByRole<HTMLImageElement>('presentation').src).toBe(
      'http://localhost:3000/uploads/krapao.png',
    )
    expect(within(missing!).getByText('ไม่มีรูปเมนู')).toBeTruthy()
    fireEvent.error(within(broken!).getByRole('presentation'))
    expect(await within(broken!).findByText('โหลดรูปไม่ได้')).toBeTruthy()
  })

  it('animates the reveal only when motion is allowed and names every state in text', async () => {
    fakeShuffleApi({ results: [{ items: [krapao, noodles] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await revealCard(user, 1)

    const revealed = screen
      .getByRole('heading', { name: 'ผัดกะเพรา' })
      .closest('article')!
    const animations = revealed.className
      .split(' ')
      .filter((name) => name.includes('animate-'))
    expect(animations).toEqual(['motion-safe:animate-card-reveal'])
    expect(screen.getByText('ยังไม่เปิด')).toBeTruthy()
  })
})

describe('Rejecting and undo', () => {
  async function showRevealedCards(user: User) {
    await shuffleCards(user)
    await user.click(screen.getByRole('button', { name: 'เปิดทั้งหมด' }))
  }

  it('asks for one replacement that excludes the rejected and displayed cards, in the same slot face-down', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles, curry] }, { items: [somtam] }],
    })
    const { user } = renderApp('/meal')
    await showRevealedCards(user)

    await user.click(
      screen.getByRole('button', { name: 'ไม่เอาเมนู ก๋วยเตี๋ยว' }),
    )

    const replacement = await screen.findByRole('button', {
      name: 'เปิดการ์ดใบที่ 2',
    })
    await waitFor(() => expect(document.activeElement).toBe(replacement))
    expect(api.recommendationBodies()[1]).toEqual({
      conditions,
      rejectedMenuItemIds: ['menu_2'],
      displayedMenuItemIds: ['menu_1', 'menu_3'],
      count: 1,
    })
    expect(within(cards()[1]!).getByText('ยังไม่เปิด')).toBeTruthy()
    // The other cards keep their place and reveal state.
    expect(within(cards()[0]!).getByText('ผัดกะเพรา')).toBeTruthy()
    expect(within(cards()[2]!).getByText('แกงเขียวหวาน')).toBeTruthy()
    // The rejection is announced through a live region.
    expect(
      screen
        .getAllByText('ไม่เอา ก๋วยเตี๋ยว แล้ว')
        .some((element) => element.getAttribute('role') === 'status'),
    ).toBe(true)
    expect(storedShortlist()?.rejectedMenuItemIds).toEqual(['menu_2'])

    await revealCard(user, 2)
    expect(screen.getByRole('heading', { name: 'ส้มตำ' })).toBeTruthy()
  })

  it('shows ไม่มีตัวเลือกเพิ่มแล้ว when no replacement exists, without suggesting a relaxation', async () => {
    fakeShuffleApi({
      results: [{ items: [krapao, noodles] }, { items: [], relaxation: null }],
    })
    const { user } = renderApp('/meal')
    await showRevealedCards(user)

    await user.click(
      screen.getByRole('button', { name: 'ไม่เอาเมนู ผัดกะเพรา' }),
    )

    expect(within(cards()[0]!).getByText('ไม่มีตัวเลือกเพิ่มแล้ว')).toBeTruthy()
    expect(screen.queryByText('ใช้เงื่อนไขนี้แล้วสับใหม่')).toBeNull()
  })

  it('undoes the last rejection: original card, slot, reveal state, and rejected IDs', async () => {
    const api = fakeShuffleApi({
      results: [
        { items: [krapao, noodles] },
        { items: [somtam] },
        { items: [curry] },
      ],
    })
    const { user } = renderApp('/meal')
    await showRevealedCards(user)
    await user.click(
      screen.getByRole('button', { name: 'ไม่เอาเมนู ผัดกะเพรา' }),
    )
    await screen.findByRole('button', { name: 'เปิดการ์ดใบที่ 1' })

    await user.click(screen.getByRole('button', { name: 'เลิกทำ' }))

    const restored = screen.getByRole('heading', { name: 'ผัดกะเพรา' })
    await waitFor(() => expect(document.activeElement).toBe(restored))
    expect(
      within(cards()[0]!).getByText('การ์ดใบที่ 1 · เปิดแล้ว'),
    ).toBeTruthy()
    expect(screen.queryByText('ส้มตำ')).toBeNull()
    expect(screen.queryByRole('button', { name: 'เลิกทำ' })).toBeNull()
    expect(storedShortlist()?.rejectedMenuItemIds).toEqual([])

    // A later rejection no longer carries the undone ID.
    await user.click(
      screen.getByRole('button', { name: 'ไม่เอาเมนู ก๋วยเตี๋ยว' }),
    )
    await screen.findByRole('button', { name: 'เปิดการ์ดใบที่ 2' })
    expect(api.recommendationBodies()[2]?.rejectedMenuItemIds).toEqual([
      'menu_2',
    ])
  })

  it('keeps the card and the rejected list unchanged when the replacement request fails', async () => {
    fakeShuffleApi({
      results: [
        { items: [krapao] },
        errorResponse(500, 'INTERNAL_SERVER_ERROR'),
      ],
    })
    const { user } = renderApp('/meal')
    await showRevealedCards(user)

    await user.click(
      screen.getByRole('button', { name: 'ไม่เอาเมนู ผัดกะเพรา' }),
    )

    expect(
      await screen.findByText('หาเมนูใหม่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'ผัดกะเพรา' })).toBeTruthy()
    expect(storedShortlist()?.rejectedMenuItemIds).toEqual([])
    expect(screen.queryByRole('button', { name: 'เลิกทำ' })).toBeNull()
  })
})

describe('No match', () => {
  const zoneRelaxation: Relaxation = {
    field: 'zone',
    from: {
      type: 'ZONE',
      id: 'zone_1',
      label: { th: 'หน้ามอ', en: 'Front Gate' },
    },
    to: {
      type: 'ANY_ZONE',
      id: null,
      label: { th: 'ที่ไหนก็ได้', en: 'Anywhere' },
    },
    resultCount: 4,
  }

  it('explains the single relaxation and applies only that change', async () => {
    const strict = { ...conditions, zoneId: 'zone_1' }
    const api = fakeShuffleApi({
      stored: strict,
      results: [{ items: [], relaxation: zoneRelaxation }, { items: [krapao] }],
    })
    const { user } = renderApp('/meal')

    await user.click(
      await screen.findByRole('button', { name: 'สับการ์ดเมนู' }),
    )
    const heading = await screen.findByRole('heading', {
      name: 'ไม่พบเมนูที่ตรงทุกเงื่อนไข',
    })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    const explanation = screen.getByText(
      'ถ้าเปลี่ยนพื้นที่จาก “หน้ามอ” เป็น “ที่ไหนก็ได้” จะพบ 4 เมนู',
    )
    expect(explanation.getAttribute('role')).toBe('status')
    expect(screen.queryByRole('button', { name: /หน้าหลัก/ })).toBeNull()

    await user.click(
      screen.getByRole('button', { name: 'ใช้เงื่อนไขนี้แล้วสับใหม่' }),
    )
    await screen.findByRole('heading', { name: 'เมนูที่น่าจะตรงใจ' })

    const [first, second] = api.recommendationBodies()
    expect(first?.conditions).toEqual(strict)
    expect(second?.conditions).toEqual({ ...strict, zoneId: null })
  })

  it('offers only manual editing when no relaxation helps, keeping every selection', async () => {
    fakeShuffleApi({ results: [{ items: [], relaxation: null }] })
    const { user } = renderApp('/meal')

    await user.click(
      await screen.findByRole('button', { name: 'สับการ์ดเมนู' }),
    )
    await screen.findByText(
      'ตอนนี้ยังไม่มีเมนูในระบบที่ตรงกับเงื่อนไขนี้ ลองแก้เงื่อนไขดูอีกครั้ง',
    )
    expect(
      screen.queryByRole('button', { name: 'ใช้เงื่อนไขนี้แล้วสับใหม่' }),
    ).toBeNull()

    await user.click(screen.getByRole('button', { name: 'แก้เงื่อนไขเอง' }))

    await screen.findByRole('heading', { name: 'สรุปมื้อที่ต้องการ' })
    expect(
      screen.getAllByRole('definition').map((value) => value.textContent),
    ).toEqual(['฿50–100', 'เผ็ด', 'อะไรก็ได้', 'ที่ไหนก็ได้'])
  })
})

describe('Session and scope', () => {
  it('keeps only the allowed shortlist state and restores it after a reload', async () => {
    fakeShuffleApi({
      results: [{ items: [krapao, noodles] }, { items: [curry] }],
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await revealCard(user, 2)
    await user.click(
      screen.getByRole('button', { name: 'ไม่เอาเมนู ก๋วยเตี๋ยว' }),
    )
    await screen.findByRole('button', { name: 'เปิดการ์ดใบที่ 2' })

    const stored = JSON.parse(
      sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)!,
    ) as Record<string, Record<string, unknown>>
    expect(Object.keys(sessionStorage)).toEqual([RECOMMENDATION_STORAGE_KEY])
    expect(Object.keys(stored).sort()).toEqual([
      'conditions',
      'shortlist',
      'step',
    ])
    expect(Object.keys(stored.shortlist!).sort()).toEqual([
      'rejectedMenuItemIds',
      'slots',
      'undo',
    ])

    // A fresh app in the same browser session picks the cards up where they were.
    cleanup()
    renderApp('/meal')
    expect(
      await screen.findByRole('button', { name: 'เปิดการ์ดใบที่ 2' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'เปิดการ์ดใบที่ 1' }),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'เลิกทำ' })).toBeTruthy()
  })

  it('clears the shortlist and rejected IDs when conditions are edited from the cards', async () => {
    fakeShuffleApi({ results: [{ items: [krapao] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)

    await user.click(screen.getByRole('button', { name: 'แก้เงื่อนไข' }))

    await screen.findByRole('heading', { name: 'สรุปมื้อที่ต้องการ' })
    expect(storedShortlist()).toBeUndefined()
  })

  it('calls no history or menu-detail endpoint', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles] }, { items: [curry] }],
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await user.click(screen.getByRole('button', { name: 'เปิดทั้งหมด' }))
    await user.click(
      screen.getByRole('button', { name: 'ไม่เอาเมนู ผัดกะเพรา' }),
    )
    await screen.findByRole('button', { name: 'เปิดการ์ดใบที่ 1' })
    await user.click(screen.getByRole('button', { name: 'เลิกทำ' }))

    const paths = new Set(api.requests.map((request) => request.path))
    expect([...paths].sort()).toEqual([
      '/api/auth/me',
      '/api/food-types',
      '/api/recommendations',
      '/api/tastes',
      '/api/zones',
    ])
  })
})
