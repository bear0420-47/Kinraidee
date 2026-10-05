import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'
import type { Taste } from '@/schemas/admin/tastes/tasteSchemas'
import type { Zone } from '@/schemas/admin/zones/zoneSchemas'
import { RECOMMENDATION_STORAGE_KEY } from '@/schemas/meal/recommendationSchemas'
import { errorFor } from '@/test/formQueries'
import {
  currentPath,
  errorResponse,
  fakeAuthApi,
  jsonResponse,
  renderApp,
} from '@/test/renderApp'

// Listed in API (sortOrder) order, which the steps must keep.
const tastes: Taste[] = [
  {
    id: 'taste_2',
    name: { th: 'เผ็ด', en: 'Spicy' },
    icon: 'flame',
    sortOrder: 1,
  },
  {
    id: 'taste_1',
    name: { th: 'หวาน', en: 'Sweet' },
    icon: 'heart',
    sortOrder: 2,
  },
]

const foodTypes: FoodType[] = [
  {
    id: 'food_1',
    name: { th: 'ข้าว', en: 'Rice' },
    icon: 'rice',
    sortOrder: 1,
  },
  {
    id: 'food_2',
    name: { th: 'เส้น', en: 'Noodles' },
    icon: 'unknown-key',
    sortOrder: 2,
  },
]

const zones: Zone[] = [
  {
    id: 'zone_1',
    name: { th: 'หน้ามอ', en: 'Front Gate' },
    description: null,
    sortOrder: 1,
  },
  {
    id: 'zone_2',
    name: { th: 'หลังมอ', en: 'Back Gate' },
    description: null,
    sortOrder: 2,
  },
]

function fakeMealApi({
  overrides = {},
}: {
  overrides?: Record<string, (body: unknown) => Response | Promise<Response>>
} = {}) {
  return fakeAuthApi({
    responses: {
      'GET /api/tastes': () => jsonResponse(200, { data: { items: tastes } }),
      'GET /api/food-types': () =>
        jsonResponse(200, { data: { items: foodTypes } }),
      'GET /api/zones': () => jsonResponse(200, { data: { items: zones } }),
      ...overrides,
    },
  })
}

function storedFlow() {
  const raw = sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)
  return raw ? (JSON.parse(raw) as unknown) : null
}

function choiceLabels(groupName: string) {
  return within(screen.getByRole('group', { name: groupName }))
    .getAllByRole('radio')
    .map((radio) => radio.closest('label')!.textContent)
}

type User = ReturnType<typeof renderApp>['user']

async function next(user: User) {
  await user.click(screen.getByRole('button', { name: 'ถัดไป' }))
}

// Answers every step: budget ฿50–100, taste "any", food type "any", zone "anywhere".
async function answerAll(user: User) {
  await user.click(screen.getByRole('radio', { name: '฿50–100' }))
  await next(user)
  await user.click(await screen.findByRole('radio', { name: 'อะไรก็ได้' }))
  await next(user)
  await user.click(await screen.findByRole('radio', { name: 'อะไรก็ได้' }))
  await next(user)
  await user.click(await screen.findByRole('radio', { name: 'ที่ไหนก็ได้' }))
  await next(user)
  await screen.findByRole('heading', { name: 'สรุปมื้อที่ต้องการ' })
}

describe('MealPage entry', () => {
  it('lets an anonymous visitor start from Home without signing in', async () => {
    fakeMealApi()
    const { router, user } = renderApp('/')

    expect(
      await screen.findByRole('heading', { name: 'วันนี้กินอะไรดี?' }),
    ).toBeTruthy()
    await user.click(screen.getByRole('link', { name: 'ช่วยเลือกมื้อให้ฉัน' }))

    expect(currentPath(router)).toBe('/meal')
    expect(
      await screen.findByRole('heading', { name: /เลือกงบประมาณ/ }),
    ).toBeTruthy()
    expect(screen.getByText('ข้อ 1 จาก 4')).toBeTruthy()
    expect(
      screen.getByText(
        'ไม่ต้องเข้าสู่ระบบ คำตอบและเมนูที่ปฏิเสธจะอยู่เฉพาะในหน้าที่เปิดอยู่นี้',
      ),
    ).toBeTruthy()
  })

  it('offers the four approved budgets with nothing selected', async () => {
    fakeMealApi()
    renderApp('/meal')

    await screen.findByRole('heading', { name: /เลือกงบประมาณ/ })
    expect(choiceLabels('เลือกงบประมาณ')).toEqual([
      'ไม่เกิน ฿50',
      '฿50–100',
      '฿101–200',
      'มากกว่า ฿200',
    ])
    expect(
      screen
        .getAllByRole<HTMLInputElement>('radio')
        .some((radio) => radio.checked),
    ).toBe(false)
  })
})

describe('MealPage condition steps', () => {
  it('shows a field-level error on each step until a choice is made', async () => {
    fakeMealApi()
    const { user } = renderApp('/meal')

    const steps = [
      ['เลือกงบประมาณ', 'กรุณาเลือกงบประมาณ', 'ไม่เกิน ฿50'],
      ['วันนี้อยากได้รสชาติแบบไหน', 'กรุณาเลือกรสชาติ', 'เผ็ด'],
      ['เลือกประเภทอาหาร', 'กรุณาเลือกประเภทอาหาร', 'ข้าว'],
      ['เลือกพื้นที่', 'กรุณาเลือกพื้นที่', 'หน้ามอ'],
    ] as const

    for (const [title, message, choice] of steps) {
      await screen.findByRole('heading', { name: new RegExp(title) })
      await waitFor(() =>
        expect(screen.getAllByRole('radio').length).toBeGreaterThan(0),
      )
      await next(user)

      const first = screen.getAllByRole('radio')[0]!
      expect(errorFor(first)).toBe(message)
      expect(document.activeElement).toBe(first)
      await user.click(screen.getByRole('radio', { name: choice }))
      expect(screen.queryByText(message)).toBeNull()
      await next(user)
    }

    await screen.findByRole('heading', { name: 'สรุปมื้อที่ต้องการ' })
  })

  it('loads tastes, food types, and zones from the public endpoints in API order', async () => {
    const api = fakeMealApi()
    const { user } = renderApp('/meal')

    await user.click(await screen.findByRole('radio', { name: 'ไม่เกิน ฿50' }))
    await next(user)
    await screen.findByRole('radio', { name: 'เผ็ด' })
    expect(choiceLabels('วันนี้อยากได้รสชาติแบบไหน')).toEqual([
      'เผ็ด',
      'หวาน',
      'อะไรก็ได้',
    ])
    await user.click(screen.getByRole('radio', { name: 'หวาน' }))
    await next(user)
    // An unknown icon key still renders, with the approved fallback icon.
    expect(choiceLabels('เลือกประเภทอาหาร')).toEqual([
      'ข้าว',
      'เส้น',
      'อะไรก็ได้',
    ])
    await user.click(screen.getByRole('radio', { name: 'เส้น' }))
    await next(user)
    expect(choiceLabels('เลือกพื้นที่')).toEqual([
      'หน้ามอ',
      'หลังมอ',
      'ที่ไหนก็ได้',
    ])

    const listPaths = api.requests
      .filter((request) => request.method === 'GET')
      .map((request) => request.path)
    expect(listPaths).toEqual(
      expect.arrayContaining(['/api/tastes', '/api/food-types', '/api/zones']),
    )
  })

  it('maps the "any" choices to null and summarises the selected labels', async () => {
    const api = fakeMealApi()
    const { user } = renderApp('/meal')

    await answerAll(user)

    expect(storedFlow()).toEqual({
      step: 'summary',
      conditions: {
        budget: 'BETWEEN_50_100',
        tasteId: null,
        foodTypeId: null,
        zoneId: null,
      },
    })
    expect(
      screen.getAllByRole('definition').map((value) => value.textContent),
    ).toEqual(['฿50–100', 'อะไรก็ได้', 'อะไรก็ได้', 'ที่ไหนก็ได้'])

    // Summarising makes no recommendation request; only `สับการ์ดเมนู` does (#54).
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'สับการ์ดเมนู' })
        .disabled,
    ).toBe(false)
    expect(
      api.requests.some((request) =>
        request.path.startsWith('/api/recommendations'),
      ),
    ).toBe(false)
  })

  it('stores specific choices by ID and lets each answer be edited from the summary', async () => {
    fakeMealApi()
    const { user } = renderApp('/meal')

    await user.click(screen.getByRole('radio', { name: 'มากกว่า ฿200' }))
    await next(user)
    await user.click(await screen.findByRole('radio', { name: 'เผ็ด' }))
    await next(user)
    await user.click(await screen.findByRole('radio', { name: 'ข้าว' }))
    await next(user)
    await user.click(await screen.findByRole('radio', { name: 'หลังมอ' }))
    await next(user)

    expect(
      screen.getAllByRole('definition').map((value) => value.textContent),
    ).toEqual(['มากกว่า ฿200', 'เผ็ด', 'ข้าว', 'หลังมอ'])

    await user.click(screen.getByRole('button', { name: 'แก้ไขรสชาติ' }))
    const spicy = screen.getByRole<HTMLInputElement>('radio', { name: 'เผ็ด' })
    expect(spicy.checked).toBe(true)
    await user.click(screen.getByRole('radio', { name: 'หวาน' }))
    await next(user)
    await next(user)
    await next(user)

    expect(storedFlow()).toEqual({
      step: 'summary',
      conditions: {
        budget: 'OVER_200',
        tasteId: 'taste_1',
        foodTypeId: 'food_1',
        zoneId: 'zone_2',
      },
    })
    expect(screen.getAllByRole('definition')[1]?.textContent).toBe('หวาน')
  })

  it('goes back a step without losing the earlier answer', async () => {
    fakeMealApi()
    const { user } = renderApp('/meal')

    await user.click(screen.getByRole('radio', { name: '฿101–200' }))
    await next(user)
    await screen.findByRole('radio', { name: 'เผ็ด' })
    await user.click(screen.getByRole('button', { name: 'ย้อนกลับ' }))

    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: '฿101–200' }).checked,
    ).toBe(true)
  })

  it('explains a master-data load failure and retries', async () => {
    let failures = 1
    fakeMealApi({
      overrides: {
        'GET /api/tastes': () =>
          failures-- > 0
            ? errorResponse(500, 'INTERNAL_SERVER_ERROR')
            : jsonResponse(200, { data: { items: tastes } }),
      },
    })
    const { user } = renderApp('/meal')

    await user.click(screen.getByRole('radio', { name: 'ไม่เกิน ฿50' }))
    await next(user)

    expect(
      await screen.findByText('โหลดตัวเลือกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'),
    ).toBeTruthy()
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'ถัดไป' }).disabled,
    ).toBe(true)
    await user.click(screen.getByRole('button', { name: 'ลองใหม่' }))
    expect(await screen.findByRole('radio', { name: 'เผ็ด' })).toBeTruthy()
  })
})

describe('MealPage session state', () => {
  it('keeps the step and answers across route changes', async () => {
    fakeMealApi()
    const { router, user } = renderApp('/meal')

    await user.click(screen.getByRole('radio', { name: 'ไม่เกิน ฿50' }))
    await next(user)
    await user.click(await screen.findByRole('radio', { name: 'หวาน' }))
    await user.click(screen.getByRole('link', { name: 'Kinraidee' }))
    await screen.findByRole('heading', { name: 'วันนี้กินอะไรดี?' })
    await router.navigate('/meal')

    expect(
      (await screen.findByRole<HTMLInputElement>('radio', { name: 'หวาน' }))
        .checked,
    ).toBe(true)
    expect(screen.getByText('ข้อ 2 จาก 4')).toBeTruthy()
  })

  it('returns to the same step after signing in from the header', async () => {
    fakeMealApi()
    const { router, user } = renderApp('/meal')

    await user.click(screen.getByRole('radio', { name: '฿50–100' }))
    await next(user)
    await user.click(await screen.findByRole('radio', { name: 'เผ็ด' }))

    await user.click(screen.getByRole('link', { name: 'เข้าสู่ระบบ' }))
    expect(currentPath(router)).toBe('/login?returnTo=%2Fmeal')
    await user.type(await screen.findByLabelText('อีเมล'), 'user@example.com')
    await user.type(screen.getByLabelText('รหัสผ่าน'), 'password1')
    await user.click(
      within(screen.getByRole('main')).getByRole('button', {
        name: 'เข้าสู่ระบบ',
      }),
    )

    await waitFor(() => expect(currentPath(router)).toBe('/meal'))
    expect(
      (await screen.findByRole<HTMLInputElement>('radio', { name: 'เผ็ด' }))
        .checked,
    ).toBe(true)
    expect(screen.getByRole('link', { name: 'บัญชีของฉัน' })).toBeTruthy()
  })

  it('stores only the step and conditions', async () => {
    fakeMealApi()
    const { user } = renderApp('/meal')

    await answerAll(user)

    expect(Object.keys(sessionStorage)).toEqual([RECOMMENDATION_STORAGE_KEY])
    expect(localStorage.length).toBe(0)
    expect(Object.keys(storedFlow() as object).sort()).toEqual([
      'conditions',
      'step',
    ])
  })

  it.each([
    ['malformed JSON', '{not json'],
    ['an unknown key', '{"step":"taste","conditions":{},"token":"x"}'],
    ['an unknown budget', '{"step":"taste","conditions":{"budget":"FREE"}}'],
  ])('starts fresh from %s in storage', async (_, raw) => {
    fakeMealApi()
    sessionStorage.setItem(RECOMMENDATION_STORAGE_KEY, raw)
    renderApp('/meal')

    expect(
      await screen.findByRole('heading', { name: /เลือกงบประมาณ/ }),
    ).toBeTruthy()
    await waitFor(() =>
      expect(storedFlow()).toEqual({ step: 'budget', conditions: {} }),
    )
  })

  it('sends the user back to a step whose stored choice no longer exists', async () => {
    fakeMealApi()
    sessionStorage.setItem(
      RECOMMENDATION_STORAGE_KEY,
      JSON.stringify({
        step: 'summary',
        conditions: {
          budget: 'UNDER_50',
          tasteId: 'taste_deleted',
          foodTypeId: null,
          zoneId: null,
        },
      }),
    )
    renderApp('/meal')

    expect(
      await screen.findByRole('heading', {
        name: /วันนี้อยากได้รสชาติแบบไหน/,
      }),
    ).toBeTruthy()
    expect(
      screen
        .getAllByRole<HTMLInputElement>('radio')
        .some((radio) => radio.checked),
    ).toBe(false)
  })
})

describe('MealPage scope and accessibility', () => {
  it('has no GPS, allergy, voting, wait-time, card, favorite, or history controls', async () => {
    fakeMealApi()
    const { user } = renderApp('/meal')

    await answerAll(user)

    const text = document.body.textContent ?? ''
    for (const word of [
      'ตำแหน่ง',
      'พื้นที่ปัจจุบัน',
      'แพ้',
      'โหวต',
      'รอคิว',
      'เวลารอ',
      'เปิดทั้งหมด',
      'เมนูโปรด',
      'ประวัติ',
    ]) {
      expect(text).not.toContain(word)
    }
  })

  it('moves the radio selection with arrow keys and focuses each new step heading', async () => {
    fakeMealApi()
    const { user } = renderApp('/meal')

    await screen.findByRole('heading', { name: /เลือกงบประมาณ/ })
    // Tab past the header links into the unselected radio group.
    const firstBudget = screen.getByRole('radio', { name: 'ไม่เกิน ฿50' })
    for (let i = 0; i < 5 && document.activeElement !== firstBudget; i++) {
      await user.tab()
    }
    expect(document.activeElement).toBe(firstBudget)
    await user.keyboard('{ArrowRight}')
    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: '฿50–100' }).checked,
    ).toBe(true)

    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'ถัดไป' }),
    )
    await user.keyboard('{Enter}')

    const heading = await screen.findByRole('heading', {
      name: /วันนี้อยากได้รสชาติแบบไหน/,
    })
    await waitFor(() => expect(document.activeElement).toBe(heading))
  })
})
