import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const COMMONS_PHOTO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Pad_see_ew.jpg/800px-Pad_see_ew.jpg'

vi.mock('@/generated/photoCredits.json', () => ({
  default: {
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Pad_see_ew.jpg/800px-Pad_see_ew.jpg':
      {
        creator: 'stu_spivack',
        license: 'CC BY-SA 2.0',
        pageUrl: 'https://commons.wikimedia.org/w/index.php?curid=2923094',
        source: 'Wikimedia Commons',
      },
  },
}))

import {
  RECOMMENDATION_STORAGE_KEY,
  type Adjustment,
} from '@/schemas/meal/recommendationSchemas'
import {
  cards,
  conditions,
  curry,
  fakeShuffleApi,
  krapao,
  noodles,
  shownCard,
  shuffleCards,
  somtam,
  storedShortlist,
  storedConditions,
  type User,
} from '@/test/fakeRecommendationApi'
import {
  errorResponse,
  jsonResponse,
  renderApp,
  testUser,
} from '@/test/renderApp'

describe('Shuffling', () => {
  it('shows every returned menu immediately after loading without reveal controls', async () => {
    let release: (response: Response) => void = () => undefined
    const pending = new Promise<Response>((resolve) => {
      release = resolve
    })
    const api = fakeShuffleApi({ results: [pending] })
    const { user } = renderApp('/meal')

    await user.click(await screen.findByRole('button', { name: 'หาเมนูกัน' }))
    expect(
      screen
        .getAllByText('กำลังหาเมนูให้นะ…')
        .some((element) => element.closest('[role="status"]')),
    ).toBe(true)
    release(
      jsonResponse(200, {
        data: { items: [krapao, noodles, curry], adjustment: null },
      }),
    )

    const heading = await screen.findByRole('heading', {
      name: 'มีเมนูน่าลองมาให้แล้ว',
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
      expect(within(card).getByRole('article')).toBeTruthy()
    }
    expect(screen.getByRole('heading', { name: 'ผัดกะเพรา' })).toBeTruthy()
    expect(screen.queryByText('ยังไม่เปิด')).toBeNull()
    expect(screen.queryByRole('button', { name: 'เปิดทั้งหมด' })).toBeNull()
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

    await user.click(await screen.findByRole('button', { name: 'หาเมนูกัน' }))

    expect(
      await screen.findByText('หาเมนูไม่สำเร็จ ลองอีกครั้งนะ'),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'เช็กก่อนหาเมนู' })).toBeTruthy()
  })
})

describe('Result condition editing', () => {
  it.each([
    ['งบประมาณ: ฿50–100', 'มื้อนี้มีงบเท่าไหร่?', '฿50–100'],
    ['รสชาติ: เผ็ด', 'มื้อนี้อยากกินแบบไหน?', 'เผ็ด'],
    ['ประเภทอาหาร: อะไรก็ได้', 'อยากกินแนวไหน?', 'อะไรก็ได้'],
    ['พื้นที่: ที่ไหนก็ได้', 'แถวไหนดี?', 'ที่ไหนก็ได้'],
  ])(
    'opens the selected original condition directly: %s',
    async (label, question, answer) => {
      const api = fakeShuffleApi({ results: [{ items: [krapao] }] })
      const { user } = renderApp('/meal')
      await shuffleCards(user)
      await user.click(screen.getByRole('button', { name: `แก้ไข${label}` }))
      expect(screen.getByRole('heading', { name: question })).toBeTruthy()
      expect(
        screen.getByRole<HTMLInputElement>('radio', { name: answer }).checked,
      ).toBe(true)
      expect(storedShortlist()).toBeUndefined()
      await user.click(screen.getByRole('button', { name: 'ย้อนกลับ' }))
      await screen.findByRole('heading', { name: 'เช็กก่อนหาเมนู' })
      expect(
        screen.getAllByRole('definition').map((row) => row.textContent),
      ).toEqual(['฿50–100', 'เผ็ด', 'อะไรก็ได้', 'ที่ไหนก็ได้'])
      expect(api.recommendationBodies()).toHaveLength(1)
      expect(screen.queryByRole('dialog')).toBeNull()
    },
  )

  it('edits one condition after a rejection and searches afresh only after submission', async () => {
    const api = fakeShuffleApi({
      results: [
        { items: [krapao, noodles] },
        { items: [somtam] },
        { items: [curry] },
      ],
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await shownCard(1)
    await user.click(
      screen.getByRole('button', { name: 'ขอดูเมนูอื่นแทน ผัดกะเพรา' }),
    )
    await shownCard(1)
    expect(storedShortlist()?.rejectedMenuItemIds).toEqual([krapao.id])
    await user.click(
      screen.getByRole('button', { name: 'แก้ไขงบประมาณ: ฿50–100' }),
    )
    await user.click(screen.getByRole('radio', { name: '฿101–200' }))
    await screen.findByRole('heading', { name: 'เช็กก่อนหาเมนู' })
    expect(
      screen.getAllByRole('definition').map((row) => row.textContent),
    ).toEqual(['฿101–200', 'เผ็ด', 'อะไรก็ได้', 'ที่ไหนก็ได้'])
    expect(storedShortlist()).toBeUndefined()
    expect(api.recommendationBodies()).toHaveLength(2)
    await shuffleCards(user)
    expect(api.recommendationBodies()[2]).toEqual({
      conditions: { ...conditions, budget: 'BETWEEN_101_200' },
      rejectedMenuItemIds: [],
      displayedMenuItemIds: [],
      count: 3,
    })
  })

  it('disables result-condition edits while replacement is pending', async () => {
    let release: (response: Response) => void = () => undefined
    const pending = new Promise<Response>((resolve) => {
      release = resolve
    })
    const api = fakeShuffleApi({ results: [{ items: [krapao] }, pending] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await shownCard(1)
    await user.click(
      screen.getByRole('button', { name: 'ขอดูเมนูอื่นแทน ผัดกะเพรา' }),
    )
    const edits = within(
      screen.getByRole('navigation', { name: 'ตัวเลือกมื้อนี้' }),
    ).getAllByRole<HTMLButtonElement>('button')
    expect(edits).toHaveLength(4)
    expect(edits.every((button) => button.disabled)).toBe(true)
    await user.click(edits[0]!)
    expect(
      screen.queryByRole('heading', { name: 'มื้อนี้มีงบเท่าไหร่?' }),
    ).toBeNull()
    release(jsonResponse(200, { data: { items: [somtam], adjustment: null } }))
    await shownCard(1)
    expect(edits.every((button) => !button.disabled)).toBe(true)
    expect(api.recommendationBodies()).toHaveLength(2)
  })
})

describe('Mobile card browsing', () => {
  it('browses by numbered controls without revealing, rejecting, selecting or requesting menus', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles, curry] }],
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    const before = storedShortlist()
    const scroll = vi.mocked(Element.prototype.scrollIntoView)
    scroll.mockClear()

    await user.click(screen.getByRole('button', { name: 'ดูการ์ดใบที่ 2' }))
    expect(screen.getByText('ใบที่ 2 จาก 3')).toBeTruthy()
    expect(scroll.mock.contexts.at(-1)).toBe(cards()[1])
    expect(scroll).toHaveBeenLastCalledWith({
      block: 'nearest',
      inline: 'start',
      behavior: 'smooth',
    })
    expect(
      screen
        .getByRole('button', { name: 'ดูการ์ดใบที่ 2' })
        .getAttribute('aria-current'),
    ).toBe('true')
    expect(
      screen
        .getByRole('button', { name: 'ดูการ์ดใบที่ 1' })
        .getAttribute('aria-current'),
    ).toBeNull()
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(storedShortlist()).toEqual(before)
    expect(api.recommendationBodies()).toHaveLength(1)
    expect(screen.queryByRole('dialog')).toBeNull()

    vi.mocked(window.matchMedia).mockReturnValueOnce({
      matches: true,
    } as MediaQueryList)
    await user.click(screen.getByRole('button', { name: 'ดูการ์ดใบที่ 3' }))
    expect(scroll).toHaveBeenLastCalledWith({
      block: 'nearest',
      inline: 'start',
      behavior: 'auto',
    })
  })

  it('keeps keyboard actions on the immediately visible card 2 after paging', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles, curry] }],
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)

    await user.click(screen.getByRole('button', { name: 'ดูการ์ดใบที่ 2' }))

    const heading = await screen.findByRole('heading', { name: 'ก๋วยเตี๋ยว' })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'เลือกเมนู ก๋วยเตี๋ยว' }),
    )
    expect(
      screen
        .getByRole('button', { name: 'ดูการ์ดใบที่ 2' })
        .getAttribute('aria-current'),
    ).toBe('true')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(api.recommendationBodies()).toHaveLength(1)
    expect(storedShortlist()?.rejectedMenuItemIds).toEqual([])
  })

  it('updates the visible position from native rail scrolling without changing session data', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles, curry] }],
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    const before = storedShortlist()
    const rail = screen.getByRole('list', { name: 'การ์ดเมนู' })
    vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue({
      left: 0,
    } as DOMRect)
    cards().forEach((card, index) => {
      vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
        left: (index - 1) * 350,
      } as DOMRect)
    })
    fireEvent.scroll(rail)
    expect(screen.getByText('ใบที่ 2 จาก 3')).toBeTruthy()
    expect(
      screen
        .getByRole('button', { name: 'ดูการ์ดใบที่ 2' })
        .getAttribute('aria-current'),
    ).toBe('true')
    expect(storedShortlist()).toEqual(before)
    expect(api.recommendationBodies()).toHaveLength(1)
  })

  it('omits swipe guidance and navigation when only one card exists', async () => {
    fakeShuffleApi({ results: [{ items: [krapao] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    expect(screen.queryByRole('navigation', { name: 'ดูการ์ดเมนู' })).toBeNull()
    expect(screen.queryByText('ปัดซ้าย–ขวา ดูเมนูอื่นได้เลย')).toBeNull()
    expect(within(cards()[1 - 1]!).getByRole('article')).toBeTruthy()
  })
})

describe('Revealing', () => {
  it('reveals one card without calling the API, with details and rationale', async () => {
    const api = fakeShuffleApi({ results: [{ items: [krapao, noodles] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)

    await shownCard(1)

    const heading = screen.getByRole('heading', { name: 'ผัดกะเพรา' })
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: 'มีเมนูน่าลองมาให้แล้ว' }),
    )
    const card = heading.closest('article')!
    expect(within(card).getByText('เมนูที่ 1')).toBeTruthy()
    expect(within(card).getByText('ครัวไทย')).toBeTruthy()
    expect(within(card).getByText('฿60')).toBeTruthy()
    expect(
      within(within(card).getByRole('list', { name: 'เหตุผลที่แนะนำ' }))
        .getAllByRole('listitem')
        .map((line) => line.textContent),
    ).toEqual(['อยู่ในงบที่เลือก', 'ตรงกับรสชาติที่เลือก'])
    // The second card stays face-down, and revealing made no request.
    expect(within(cards()[2 - 1]!).getByRole('article')).toBeTruthy()
    expect(api.recommendationBodies()).toHaveLength(1)
  })

  it('labels a genuine AI selection and shows its Thai reason', async () => {
    const aiItem = {
      ...krapao,
      selection: {
        source: 'AI' as const,
        reasonTh: 'ตรงกับงบและรสชาติที่เลือก',
      },
    }
    fakeShuffleApi({ results: [{ items: [aiItem] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await shownCard(1)

    expect(screen.getByText('AI เลือกให้')).toBeTruthy()
    expect(screen.getByText('ตรงกับงบและรสชาติที่เลือก')).toBeTruthy()
  })

  it('loads attributed Google Places evidence when a result is displayed', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao] }],
      handle: (method, url) =>
        method === 'GET' && url.pathname.endsWith('/place-details')
          ? jsonResponse(200, {
              data: {
                details: {
                  rating: 4.6,
                  userRatingCount: 42,
                  openNow: true,
                  weekdayDescriptions: ['วันจันทร์: 09:00–20:00'],
                  googleMapsUri: 'https://maps.google.com/example',
                  reviews: [
                    {
                      authorName: 'ผู้รีวิวตัวอย่าง',
                      authorUri: 'https://example.com/reviewer',
                      rating: 5,
                      relativePublishTimeDescription: 'เดือนที่แล้ว',
                      text: 'อาหารอร่อย',
                      publishTime: null,
                    },
                  ],
                },
              },
            })
          : undefined,
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)

    await shownCard(1)

    expect(await screen.findByText('4.6 จาก 42 คะแนน')).toBeTruthy()
    expect(
      api.requests.filter((request) => request.path.endsWith('/place-details')),
    ).toHaveLength(1)
    expect(screen.getByText(/อาหารอร่อย/)).toBeTruthy()
    const disclosure = screen
      .getByText('ดูรายละเอียดเมนูและร้าน')
      .closest('details')!
    expect(disclosure.open).toBe(false)
    // JSDOM does not model the accessibility exclusion of closed details contents.
    expect(
      screen.getByRole('link', { name: 'ผู้รีวิวตัวอย่าง' }).closest('details'),
    ).toBe(disclosure)
    expect(
      screen.getByRole('button', { name: 'เลือกเมนู ผัดกะเพรา' }),
    ).toBeTruthy()
    await user.click(screen.getByText('ดูรายละเอียดเมนูและร้าน'))
    expect(disclosure.open).toBe(true)
    expect(screen.getByText(krapao.name.en)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'ผู้รีวิวตัวอย่าง' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: /ดูร้านนี้บน Google Maps/ }),
    ).toBeTruthy()
  })

  it('scrolls the whole revealed card into view, instantly under reduced motion', async () => {
    fakeShuffleApi({ results: [{ items: [krapao, noodles] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    const scroll = vi.mocked(Element.prototype.scrollIntoView)
    scroll.mockClear()

    await user.click(screen.getByRole('button', { name: 'ดูการ์ดใบที่ 1' }))
    expect(scroll.mock.contexts).toEqual([cards()[0]])
    expect(scroll).toHaveBeenLastCalledWith({
      block: 'nearest',
      inline: 'start',
      behavior: 'smooth',
    })
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: 'ผัดกะเพรา' }),
    )

    vi.mocked(window.matchMedia).mockReturnValueOnce({
      matches: true,
    } as MediaQueryList)
    await user.click(screen.getByRole('button', { name: 'ดูการ์ดใบที่ 2' }))
    expect(scroll.mock.contexts.at(-1)).toBe(cards()[1])
    expect(scroll).toHaveBeenLastCalledWith({
      block: 'nearest',
      inline: 'start',
      behavior: 'auto',
    })
  })

  it('shows every returned menu with no additional interaction', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles, curry] }],
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)

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

    const [photo, missing, broken] = cards()
    expect(within(photo!).getByRole<HTMLImageElement>('presentation').src).toBe(
      'http://localhost:3000/uploads/krapao.png',
    )
    expect(within(missing!).getByText('ไม่มีรูปเมนู')).toBeTruthy()
    fireEvent.error(within(broken!).getByRole('presentation'))
    expect(await within(broken!).findByText('โหลดรูปไม่ได้')).toBeTruthy()
  })

  it('labels stock photos as illustrations and credits Unsplash, but not own photos', async () => {
    const stock = {
      ...krapao,
      imageUrl:
        'https://images.unsplash.com/photo-1?w=800&q=75&fit=crop&auto=format',
    }
    const own = { ...noodles, imageUrl: '/uploads/noodles.png' }
    fakeShuffleApi({ results: [{ items: [stock, own] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)

    const [stockCard, ownCard] = cards()
    expect(within(stockCard!).getByText('ภาพประกอบ')).toBeTruthy()
    expect(within(ownCard!).queryByText('ภาพประกอบ')).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Unsplash' }).getAttribute('href'),
    ).toBe('https://unsplash.com/?utm_source=kinraidee&utm_medium=referral')
  })

  it('credits the creator and licence of a Creative Commons photo on its card', async () => {
    const commons = { ...krapao, imageUrl: COMMONS_PHOTO }
    fakeShuffleApi({ results: [{ items: [commons] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await shownCard(1)

    const [card] = cards()
    expect(within(card!).getByText('ภาพประกอบ')).toBeTruthy()
    const credit = within(card!).getByRole('link', {
      name: '© stu_spivack · CC BY-SA 2.0',
    })
    expect(credit.getAttribute('href')).toBe(
      'https://commons.wikimedia.org/w/index.php?curid=2923094',
    )
  })

  it('animates the reveal only when motion is allowed and names every state in text', async () => {
    fakeShuffleApi({ results: [{ items: [krapao, noodles] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await shownCard(1)

    const revealed = screen
      .getByRole('heading', { name: 'ผัดกะเพรา' })
      .closest('article')!
    const animations = revealed.className
      .split(' ')
      .filter((name) => name.includes('animate-'))
    expect(animations).toEqual(['motion-safe:animate-card-reveal'])
    expect(screen.queryByText('ยังไม่เปิด')).toBeNull()
  })
})

describe('Rejecting and undo', () => {
  async function showRevealedCards(user: User) {
    await shuffleCards(user)
  }

  it('asks for one replacement that excludes the rejected and displayed cards, immediately in the same slot', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles, curry] }, { items: [somtam] }],
    })
    const { user } = renderApp('/meal')
    await showRevealedCards(user)

    await user.click(
      screen.getByRole('button', { name: 'ขอดูเมนูอื่นแทน ก๋วยเตี๋ยว' }),
    )

    const replacement = await shownCard(2)
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(replacement).getByRole('heading'),
      ),
    )
    expect(api.recommendationBodies()[1]).toEqual({
      conditions,
      rejectedMenuItemIds: ['menu_2'],
      displayedMenuItemIds: ['menu_1', 'menu_3'],
      count: 1,
    })
    expect(
      within(cards()[1]!).getByRole('heading', { name: 'ส้มตำ' }),
    ).toBeTruthy()
    // The other cards keep their place and reveal state.
    expect(within(cards()[0]!).getByText('ผัดกะเพรา')).toBeTruthy()
    expect(within(cards()[2]!).getByText('แกงเขียวหวาน')).toBeTruthy()
    // The rejection is announced through a live region.
    expect(
      screen
        .getAllByText('ข้าม ก๋วยเตี๋ยว แล้ว')
        .some((element) => element.getAttribute('role') === 'status'),
    ).toBe(true)
    expect(storedShortlist()?.rejectedMenuItemIds).toEqual(['menu_2'])

    await shownCard(2)
    expect(screen.getByRole('heading', { name: 'ส้มตำ' })).toBeTruthy()
  })

  it('shows รอบนี้ไม่มีเมนูเพิ่มแล้ว when no replacement exists, without suggesting a filter change', async () => {
    fakeShuffleApi({
      results: [{ items: [krapao, noodles] }, { items: [], adjustment: null }],
    })
    const { user } = renderApp('/meal')
    await showRevealedCards(user)

    await user.click(
      screen.getByRole('button', { name: 'ขอดูเมนูอื่นแทน ผัดกะเพรา' }),
    )

    expect(
      within(cards()[0]!).getByText('รอบนี้ไม่มีเมนูเพิ่มแล้ว'),
    ).toBeTruthy()
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
      screen.getByRole('button', { name: 'ขอดูเมนูอื่นแทน ผัดกะเพรา' }),
    )
    await shownCard(1)

    await user.click(screen.getByRole('button', { name: 'เอาเมนูเดิมกลับมา' }))

    const restored = screen.getByRole('heading', { name: 'ผัดกะเพรา' })
    await waitFor(() => expect(document.activeElement).toBe(restored))
    expect(within(cards()[0]!).getByText('เมนูที่ 1')).toBeTruthy()
    expect(screen.queryByText('ส้มตำ')).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'เอาเมนูเดิมกลับมา' }),
    ).toBeNull()
    expect(storedShortlist()?.rejectedMenuItemIds).toEqual([])

    // A later rejection no longer carries the undone ID.
    await user.click(
      screen.getByRole('button', { name: 'ขอดูเมนูอื่นแทน ก๋วยเตี๋ยว' }),
    )
    await shownCard(2)
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
      screen.getByRole('button', { name: 'ขอดูเมนูอื่นแทน ผัดกะเพรา' }),
    )

    expect(
      await screen.findByText('หาเมนูใหม่ไม่สำเร็จ ลองอีกครั้งนะ'),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'ผัดกะเพรา' })).toBeTruthy()
    expect(storedShortlist()?.rejectedMenuItemIds).toEqual([])
    expect(
      screen.queryByRole('button', { name: 'เอาเมนูเดิมกลับมา' }),
    ).toBeNull()
  })
})

describe('Automatic adjustment and true no match', () => {
  const budgetChange = (
    from: Adjustment['conditions']['budget'],
    to: Adjustment['conditions']['budget'],
    th: [string, string],
  ): Adjustment['changes'][number] => ({
    field: 'budget',
    from: { type: 'BUDGET_RANGE', id: from, label: { th: th[0], en: th[0] } },
    to: { type: 'BUDGET_RANGE', id: to, label: { th: th[1], en: th[1] } },
  })

  it('shows cards immediately and explains one automatic change', async () => {
    const strict = { ...conditions, budget: 'UNDER_50' as const }
    const suggested = { ...strict, budget: 'BETWEEN_50_100' as const }
    const api = fakeShuffleApi({
      stored: strict,
      results: [
        {
          items: [krapao],
          adjustment: {
            changes: [
              budgetChange('UNDER_50', 'BETWEEN_50_100', [
                'ต่ำกว่า ฿50',
                '฿50–100',
              ]),
            ],
            conditions: suggested,
            resultCount: 4,
          },
        },
        { items: [], adjustment: null },
      ],
    })
    const { user } = renderApp('/meal')

    await user.click(await screen.findByRole('button', { name: 'หาเมนูกัน' }))
    await screen.findByRole('heading', { name: 'มีเมนูน่าลองมาให้แล้ว' })
    const explanation = screen.getByText(
      'ยังไม่เจอเมนูที่ตรงครบทุกข้อ เลยปรับงบจาก “ต่ำกว่า ฿50” เป็น “฿50–100” ให้แล้ว เจอ 4 เมนูแล้ว ลองดูการ์ดด้านล่างได้เลย',
    )
    expect(explanation.getAttribute('role')).toBe('status')
    expect(api.recommendationBodies()).toHaveLength(1)
    expect(api.recommendationBodies()[0]?.conditions).toEqual(strict)
    expect(storedConditions()).toEqual(suggested)
    expect(storedShortlist()?.adjustment?.conditions).toEqual(suggested)

    await shownCard(1)
    await user.click(
      screen.getByRole('button', { name: 'ขอดูเมนูอื่นแทน ผัดกะเพรา' }),
    )
    await waitFor(() => expect(api.recommendationBodies()).toHaveLength(2))
    expect(api.recommendationBodies()[1]?.conditions).toEqual(suggested)
  })

  it('names every automatic change and persists it across reload', async () => {
    const strict = {
      ...conditions,
      budget: 'UNDER_50' as const,
      zoneId: 'zone_1',
    }
    const suggested = {
      ...strict,
      budget: 'BETWEEN_101_200' as const,
      zoneId: 'zone_2',
      tasteId: 'taste_2',
    }
    const api = fakeShuffleApi({
      stored: strict,
      masterData: {
        'GET /api/tastes': () =>
          jsonResponse(200, {
            data: {
              items: [
                {
                  id: 'taste_1',
                  name: { th: 'เผ็ด', en: 'Spicy' },
                  icon: 'flame',
                  sortOrder: 1,
                },
                {
                  id: 'taste_2',
                  name: { th: 'กลมกล่อม', en: 'Savory' },
                  icon: null,
                  sortOrder: 2,
                },
              ],
            },
          }),
        'GET /api/zones': () =>
          jsonResponse(200, {
            data: {
              items: [
                {
                  id: 'zone_1',
                  name: { th: 'หน้ามอ', en: 'Front Gate' },
                  description: null,
                  sortOrder: 1,
                },
                {
                  id: 'zone_2',
                  name: { th: 'ตลาด', en: 'Market' },
                  description: null,
                  sortOrder: 2,
                },
              ],
            },
          }),
      },
      results: [
        {
          items: [krapao],
          adjustment: {
            changes: [
              {
                field: 'zone',
                from: {
                  type: 'ZONE',
                  id: 'zone_1',
                  label: { th: 'หน้ามอ', en: 'Front Gate' },
                },
                to: {
                  type: 'ZONE',
                  id: 'zone_2',
                  label: { th: 'ตลาด', en: 'Market' },
                },
              },
              budgetChange('UNDER_50', 'BETWEEN_101_200', [
                'ต่ำกว่า ฿50',
                '฿101–200',
              ]),
              {
                field: 'taste',
                from: {
                  type: 'TASTE',
                  id: 'taste_1',
                  label: { th: 'เผ็ด', en: 'Spicy' },
                },
                to: {
                  type: 'TASTE',
                  id: 'taste_2',
                  label: { th: 'กลมกล่อม', en: 'Savory' },
                },
              },
            ],
            conditions: suggested,
            resultCount: 2,
          },
        },
      ],
    })
    const { user } = renderApp('/meal')

    await user.click(await screen.findByRole('button', { name: 'หาเมนูกัน' }))
    expect(
      await screen.findByText(
        'ยังไม่เจอเมนูที่ตรงครบทุกข้อ เลยปรับพื้นที่จาก “หน้ามอ” เป็น “ตลาด” และงบจาก “ต่ำกว่า ฿50” เป็น “฿101–200” และรสชาติจาก “เผ็ด” เป็น “กลมกล่อม” ให้แล้ว เจอ 2 เมนูแล้ว ลองดูการ์ดด้านล่างได้เลย',
      ),
    ).toBeTruthy()

    expect(api.recommendationBodies()).toHaveLength(1)
    cleanup()
    renderApp('/meal')
    expect(
      await screen.findByText(
        'ยังไม่เจอเมนูที่ตรงครบทุกข้อ เลยปรับพื้นที่จาก “หน้ามอ” เป็น “ตลาด” และงบจาก “ต่ำกว่า ฿50” เป็น “฿101–200” และรสชาติจาก “เผ็ด” เป็น “กลมกล่อม” ให้แล้ว เจอ 2 เมนูแล้ว ลองดูการ์ดด้านล่างได้เลย',
      ),
    ).toBeTruthy()
  })

  it('offers only manual editing when no menu is available, keeping every selection', async () => {
    fakeShuffleApi({ results: [{ items: [], adjustment: null }] })
    const { user } = renderApp('/meal')

    await user.click(await screen.findByRole('button', { name: 'หาเมนูกัน' }))
    await screen.findByText(
      'ตอนนี้ยังไม่มีเมนูที่พร้อมแนะนำ กลับมาลองใหม่ทีหลังนะ',
    )
    expect(
      screen.queryByRole('button', { name: 'ใช้เงื่อนไขนี้แล้วสับใหม่' }),
    ).toBeNull()

    await user.click(screen.getByRole('button', { name: 'แก้ไขงบประมาณ' }))
    await user.click(screen.getByRole('button', { name: 'ใช้คำตอบนี้' }))

    await screen.findByRole('heading', { name: 'เช็กก่อนหาเมนู' })
    expect(
      screen.getAllByRole('definition').map((value) => value.textContent),
    ).toEqual(['฿50–100', 'เผ็ด', 'อะไรก็ได้', 'ที่ไหนก็ได้'])
  })
})

describe('Session and scope', () => {
  it('shows legacy hidden cards and undo immediately after restoring without a recommendation request', async () => {
    const api = fakeShuffleApi({ results: [] })
    sessionStorage.setItem(
      RECOMMENDATION_STORAGE_KEY,
      JSON.stringify({
        step: 'cards',
        conditions,
        shortlist: {
          slots: [curry, noodles].map((item) => ({
            kind: 'card',
            item,
            revealed: false,
          })),
          rejectedMenuItemIds: [krapao.id],
          undo: {
            slotIndex: 0,
            previous: { kind: 'card', item: krapao, revealed: false },
            rejectedId: krapao.id,
          },
        },
      }),
    )
    const { user } = renderApp('/meal')
    await screen.findByRole('heading', { name: curry.name.th })
    expect(screen.getByRole('heading', { name: noodles.name.th })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /เปิดการ์ด/ })).toBeNull()
    expect(
      storedShortlist()?.slots.every(
        (slot) => slot.kind !== 'card' || slot.revealed,
      ),
    ).toBe(true)
    await user.click(screen.getByRole('button', { name: 'เอาเมนูเดิมกลับมา' }))
    await screen.findByRole('heading', { name: krapao.name.th })
    expect(api.recommendationBodies()).toEqual([])
    expect(
      api.requests.some((request) => request.path.includes('/history')),
    ).toBe(false)
  })

  it('keeps only the allowed shortlist state and restores it after a reload', async () => {
    fakeShuffleApi({
      results: [{ items: [krapao, noodles] }, { items: [curry] }],
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await shownCard(2)
    await user.click(
      screen.getByRole('button', { name: 'ขอดูเมนูอื่นแทน ก๋วยเตี๋ยว' }),
    )
    await shownCard(2)

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
    expect(await shownCard(2)).toBeTruthy()
    expect(within(cards()[1 - 1]!).getByRole('article')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'เอาเมนูเดิมกลับมา' }),
    ).toBeTruthy()
  })

  it('clears the shortlist and rejected IDs when conditions are edited from the cards', async () => {
    fakeShuffleApi({ results: [{ items: [krapao] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)

    await user.click(screen.getByRole('button', { name: 'เปลี่ยนตัวเลือก' }))

    await screen.findByRole('heading', { name: 'เช็กก่อนหาเมนู' })
    expect(storedShortlist()).toBeUndefined()
  })

  it('starts over from the cards with no answers and nothing stored', async () => {
    fakeShuffleApi({ results: [{ items: [krapao] }] })
    const { user } = renderApp('/meal')
    await shuffleCards(user)

    await user.click(screen.getByRole('button', { name: 'เริ่มใหม่' }))

    await screen.findByRole('heading', { name: /มื้อนี้มีงบเท่าไหร่?/ })
    expect(
      screen
        .getAllByRole('radio')
        .some((radio) => (radio as HTMLInputElement).checked),
    ).toBe(false)
    expect(sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)).toBeNull()
  })

  it('calls place details on display and never calls menu detail or history', async () => {
    const api = fakeShuffleApi({
      results: [{ items: [krapao, noodles] }, { items: [curry] }],
    })
    const { user } = renderApp('/meal')
    await shuffleCards(user)
    await user.click(
      screen.getByRole('button', { name: 'ขอดูเมนูอื่นแทน ผัดกะเพรา' }),
    )
    await shownCard(1)
    await user.click(screen.getByRole('button', { name: 'เอาเมนูเดิมกลับมา' }))

    const paths = new Set(api.requests.map((request) => request.path))
    expect([...paths].sort()).toEqual([
      '/api/auth/me',
      '/api/food-types',
      '/api/recommendations',
      '/api/restaurants/r_1/place-details',
      '/api/tastes',
      '/api/zones',
    ])
  })
})
