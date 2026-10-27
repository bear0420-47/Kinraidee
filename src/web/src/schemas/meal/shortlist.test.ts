import { describe, expect, it } from 'vitest'

import {
  conditionDifferences,
  initialRequest,
  rationaleLines,
  replacementRequest,
  storedFlowSchema,
  type RecommendationConditions,
  type RecommendationItem,
  type Adjustment,
  adjustmentMessage,
} from './recommendationSchemas'
import {
  chooseCard,
  chosenItem,
  clearChoice,
  confirmChoice,
  hasFaceDownCard,
  replaceCard,
  revealAll,
  revealCard,
  startShortlist,
  undoReject,
} from './shortlist'

const conditions: RecommendationConditions = {
  budget: 'UNDER_50',
  tasteId: 'taste_1',
  foodTypeId: 'food_1',
  zoneId: 'zone_1',
}

const adjustment: Adjustment = {
  changes: [
    {
      field: 'zone',
      from: {
        type: 'ZONE',
        id: 'zone_original',
        label: { th: 'หน้ามอ', en: 'Front Gate' },
      },
      to: {
        type: 'ZONE',
        id: conditions.zoneId!,
        label: { th: 'ตลาด', en: 'Market' },
      },
    },
  ],
  conditions,
  resultCount: 2,
}

function item(id: string): RecommendationItem {
  return {
    id,
    name: { th: id, en: id },
    description: null,
    price: 40,
    imageUrl: null,
    restaurant: { id: 'r', name: { th: 'ร้าน', en: 'Shop' } },
    zone: { id: 'z', name: { th: 'โซน', en: 'Zone' } },
    foodType: { id: 'f', name: { th: 'ข้าว', en: 'Rice' }, icon: null },
    tastes: [],
    rationale: {
      matchedBudget: true,
      matchedTaste: false,
      matchedFoodType: true,
      matchedZone: true,
    },
    selection: { source: 'DETERMINISTIC', reasonTh: null },
  }
}

const [a, b, c, d] = ['a', 'b', 'c', 'd'].map(item) as [
  RecommendationItem,
  RecommendationItem,
  RecommendationItem,
  RecommendationItem,
]

describe('closest-menu differences', () => {
  const open = { ...conditions, tasteId: null, foodTypeId: null, zoneId: null }

  it.each([
    ['UNDER_50', 49, []],
    ['UNDER_50', 50, ['ราคา 50 บาท ไม่อยู่ในช่วงต่ำกว่า 50 บาท']],
    ['UNDER_50', 60, ['เกินงบ 10 บาท']],
    ['BETWEEN_50_100', 49, ['ราคาต่ำกว่าช่วงงบที่เลือก 1 บาท']],
    ['BETWEEN_50_100', 50, []],
    ['BETWEEN_50_100', 100, []],
    ['BETWEEN_50_100', 101, ['เกินงบ 1 บาท']],
    ['BETWEEN_101_200', 100, ['ราคาต่ำกว่าช่วงงบที่เลือก 1 บาท']],
    ['BETWEEN_101_200', 101, []],
    ['BETWEEN_101_200', 200, []],
    ['BETWEEN_101_200', 201, ['เกินงบ 1 บาท']],
    ['OVER_200', 200, ['ราคาต่ำกว่าช่วงงบที่เลือก 1 บาท']],
    ['OVER_200', 201, []],
  ] as const)(
    'compares %s against actual price %i',
    (budget, price, expected) => {
      expect(
        conditionDifferences({ ...a, price }, { ...open, budget }),
      ).toEqual(expected)
    },
  )

  it('does not reinterpret false API rationale as an unrestricted original preference', () => {
    expect(conditionDifferences(a, conditions)).toEqual([
      'รสชาติต่างจากที่เลือก: ไม่ระบุรสชาติ',
      'ประเภทอาหารต่างจากที่เลือก: ข้าว',
      'อยู่คนละพื้นที่: โซน',
    ])
    expect(conditionDifferences(a, open)).toEqual([])
  })

  it('requires complete valid adjustment conditions without extra personal fields in session storage', () => {
    const adjustment = {
      changes: [
        {
          field: 'budget',
          from: {
            type: 'BUDGET_RANGE',
            id: 'UNDER_50',
            label: { th: 'ต่ำกว่า ฿50', en: 'Under 50' },
          },
          to: {
            type: 'BUDGET_RANGE',
            id: 'BETWEEN_50_100',
            label: { th: '฿50–100', en: '50–100' },
          },
        },
      ],
      conditions: open,
      resultCount: 1,
    }
    const shortlist = {
      ...revealAll(startShortlist([a])),
      adjustment,
    }
    const flow = { step: 'cards', conditions, shortlist }
    expect(storedFlowSchema.parse(flow)).toEqual(flow)
    expect(
      storedFlowSchema.safeParse({
        ...flow,
        shortlist: {
          ...shortlist,
          adjustment: {
            ...adjustment,
            conditions: { ...open, allergy: 'nuts' },
          },
        },
      }).success,
    ).toBe(false)
    expect(
      storedFlowSchema.safeParse({
        ...flow,
        shortlist: {
          ...shortlist,
          adjustment: { ...adjustment, conditions: { budget: 'UNDER_50' } },
        },
      }).success,
    ).toBe(false)
  })
})

describe('request builders', () => {
  it('asks for three cards with no exclusions first', () => {
    expect(initialRequest(conditions)).toEqual({
      conditions,
      rejectedMenuItemIds: [],
      displayedMenuItemIds: [],
      count: 3,
    })
  })

  it('asks for one replacement, excluding earlier rejections and the other visible cards', () => {
    const shortlist = replaceCard(startShortlist([a, b, c]), 0, null)
    expect(replacementRequest(conditions, shortlist, 1)).toEqual({
      conditions,
      rejectedMenuItemIds: ['a', 'b'],
      displayedMenuItemIds: ['c'],
      count: 1,
    })
  })
})

describe('adjustmentMessage', () => {
  const change = (
    field: Adjustment['changes'][number]['field'],
    from: string,
    to: string,
  ): Adjustment['changes'][number] => ({
    field,
    from: { type: 'ZONE', id: from, label: { th: from, en: from } },
    to: { type: 'ZONE', id: to, label: { th: to, en: to } },
  })

  it('names one change with the result count', () => {
    expect(
      adjustmentMessage({
        changes: [change('zone', 'คชพล', 'ตลาดฟ้าไทย')],
        conditions,
        resultCount: 4,
      }),
    ).toBe(
      'ยังไม่เจอเมนูที่ตรงครบทุกข้อ เลยปรับพื้นที่จาก “คชพล” เป็น “ตลาดฟ้าไทย” ให้แล้ว เจอ 4 เมนูแล้ว ลองดูการ์ดด้านล่างได้เลย',
    )
  })

  it('joins several changes with และ in the order given', () => {
    expect(
      adjustmentMessage({
        changes: [
          change('budget', '฿50–100', '฿101–200'),
          change('foodType', 'ข้าว', 'เส้น'),
        ],
        conditions,
        resultCount: 1,
      }),
    ).toBe(
      'ยังไม่เจอเมนูที่ตรงครบทุกข้อ เลยปรับงบจาก “฿50–100” เป็น “฿101–200” และประเภทอาหารจาก “ข้าว” เป็น “เส้น” ให้แล้ว เจอ 1 เมนูแล้ว ลองดูการ์ดด้านล่างได้เลย',
    )
  })
})

describe('rationaleLines', () => {
  it('describes unrestricted choices as openness, never as a failed filter', () => {
    expect(rationaleLines(a.rationale)).toEqual([
      'อยู่ในงบที่เลือก',
      'รสไหนก็ได้',
      'ตรงกับประเภทอาหารที่เลือก',
      'อยู่ในโซนที่เลือก',
    ])
  })
})

describe('shortlist transitions', () => {
  it('starts with all results visible and can normalize a legacy hidden card', () => {
    const shortlist = startShortlist([a, b])
    expect(hasFaceDownCard(shortlist)).toBe(false)
    const legacy = {
      ...shortlist,
      slots: shortlist.slots.map((slot) => ({ ...slot, revealed: false })),
    }

    const one = revealCard(legacy, 1)
    expect(
      one.slots.map((slot) => slot.kind === 'card' && slot.revealed),
    ).toEqual([false, true])
    expect(hasFaceDownCard(revealAll(legacy))).toBe(false)
  })

  it('replaces a rejected card in place and undoes exactly that step', () => {
    const revealed = revealAll(startShortlist([a, b], adjustment))
    const replaced = replaceCard(revealed, 0, d)

    expect(replaced.slots[0]).toEqual({
      kind: 'card',
      item: d,
      revealed: true,
    })
    expect(replaced.rejectedMenuItemIds).toEqual(['a'])
    expect(replaced.undo).toEqual({
      slotIndex: 0,
      previous: { kind: 'card', item: a, revealed: true },
      rejectedId: 'a',
    })

    const undone = undoReject(replaced)
    expect(undone).toEqual(revealed)
    expect(undone.adjustment).toEqual(adjustment)
    expect(undoReject(undone)).toBe(undone)
  })

  it('marks a slot with no replacement and keeps only the latest undo', () => {
    const shortlist = revealAll(startShortlist([a, b]))
    const exhausted = replaceCard(shortlist, 0, null)
    const second = replaceCard(exhausted, 1, c)

    expect(exhausted.slots[0]).toEqual({ kind: 'exhausted' })
    expect(second.undo?.rejectedId).toBe('b')
    // Undo only restores the latest rejection; the exhausted slot stays.
    expect(undoReject(second).slots[0]).toEqual({ kind: 'exhausted' })
    expect(undoReject(second).rejectedMenuItemIds).toEqual(['a'])
  })

  it('keeps only the chosen card ID and finds it while the card is revealed', () => {
    const revealed = revealCard(startShortlist([a, b]), 0)
    const chosen = chooseCard(revealed, 'a')

    expect(chosen.chosenMenuItemId).toBe('a')
    expect(chosenItem(chosen)).toEqual(a)
    // Every displayed menu can reopen its dialog; a missing item cannot.
    expect(chosenItem(chooseCard(revealed, 'b'))).toEqual(b)
    expect(chosenItem(chooseCard(revealed, 'x'))).toBeNull()
    // Clearing removes the key, so the stored value matches the one before choosing.
    expect(JSON.stringify(clearChoice(chosen))).toBe(JSON.stringify(revealed))
    expect(
      storedFlowSchema.parse({ step: 'cards', conditions, shortlist: chosen })
        .shortlist,
    ).toEqual(chosen)
  })

  it('remembers a confirmed choice, and clearing forgets it too', () => {
    const revealed = revealCard(startShortlist([a, b]), 0)
    const confirmed = confirmChoice(chooseCard(revealed, 'a'))

    expect(confirmed).toMatchObject({ chosenMenuItemId: 'a', confirmed: true })
    expect(chosenItem(confirmed)).toEqual(a)
    expect(JSON.stringify(clearChoice(confirmed))).toBe(
      JSON.stringify(revealed),
    )
    expect(
      storedFlowSchema.parse({
        step: 'cards',
        conditions,
        shortlist: confirmed,
      }).shortlist,
    ).toEqual(confirmed)
    // Only `true` is stored; anything else is malformed.
    expect(
      storedFlowSchema.safeParse({
        step: 'cards',
        conditions,
        shortlist: { ...confirmed, confirmed: false },
      }).success,
    ).toBe(false)
  })

  it('round-trips through the stored-flow schema', () => {
    const flow = {
      step: 'cards',
      conditions,
      shortlist: replaceCard(revealAll(startShortlist([a, b])), 1, null),
    }
    expect(storedFlowSchema.parse(JSON.parse(JSON.stringify(flow)))).toEqual(
      flow,
    )
  })

  it('rejects a stored shortlist with more than three cards or an unknown field', () => {
    const tooMany = startShortlist([a, b, c, d])
    expect(
      storedFlowSchema.safeParse({
        step: 'cards',
        conditions,
        shortlist: tooMany,
      }).success,
    ).toBe(false)
    expect(
      storedFlowSchema.safeParse({
        step: 'cards',
        conditions,
        shortlist: { ...startShortlist([a]), history: ['a'] },
      }).success,
    ).toBe(false)
  })
})
