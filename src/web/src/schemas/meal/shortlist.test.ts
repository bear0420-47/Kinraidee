import { describe, expect, it } from 'vitest'

import {
  applyRelaxation,
  initialRequest,
  rationaleLines,
  replacementRequest,
  storedFlowSchema,
  type RecommendationConditions,
  type RecommendationItem,
  type Relaxation,
} from './recommendationSchemas'
import {
  chooseCard,
  chosenItem,
  clearChoice,
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
  }
}

const [a, b, c, d] = ['a', 'b', 'c', 'd'].map(item) as [
  RecommendationItem,
  RecommendationItem,
  RecommendationItem,
  RecommendationItem,
]

function relaxation(
  field: Relaxation['field'],
  toId: string | null,
): Relaxation {
  return {
    field,
    from: { type: 'ZONE', id: 'x', label: { th: 'x', en: 'x' } },
    to: { type: 'ANY_ZONE', id: toId, label: { th: 'y', en: 'y' } },
    resultCount: 2,
  }
}

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

describe('applyRelaxation', () => {
  it.each([
    ['zone', null, { zoneId: null }],
    ['taste', null, { tasteId: null }],
    ['foodType', null, { foodTypeId: null }],
    ['budget', 'BETWEEN_50_100', { budget: 'BETWEEN_50_100' }],
  ] as const)('changes only %s', (field, toId, change) => {
    expect(applyRelaxation(conditions, relaxation(field, toId))).toEqual({
      ...conditions,
      ...change,
    })
  })

  it('ignores a budget relaxation without a known budget value', () => {
    expect(applyRelaxation(conditions, relaxation('budget', 'FREE'))).toEqual(
      conditions,
    )
  })
})

describe('rationaleLines', () => {
  it('describes unrestricted choices as openness, never as a failed filter', () => {
    expect(rationaleLines(a.rationale)).toEqual([
      'อยู่ในงบที่เลือก',
      'เปิดรับรสชาติได้หลากหลาย',
      'ตรงกับประเภทอาหารที่เลือก',
      'อยู่ในโซนที่เลือก',
    ])
  })
})

describe('shortlist transitions', () => {
  it('starts face-down and reveals one card or all of them', () => {
    const shortlist = startShortlist([a, b])
    expect(hasFaceDownCard(shortlist)).toBe(true)

    const one = revealCard(shortlist, 1)
    expect(
      one.slots.map((slot) => slot.kind === 'card' && slot.revealed),
    ).toEqual([false, true])
    expect(hasFaceDownCard(revealAll(shortlist))).toBe(false)
  })

  it('replaces a rejected card in place and undoes exactly that step', () => {
    const revealed = revealAll(startShortlist([a, b]))
    const replaced = replaceCard(revealed, 0, d)

    expect(replaced.slots[0]).toEqual({
      kind: 'card',
      item: d,
      revealed: false,
    })
    expect(replaced.rejectedMenuItemIds).toEqual(['a'])
    expect(replaced.undo).toEqual({
      slotIndex: 0,
      previous: { kind: 'card', item: a, revealed: true },
      rejectedId: 'a',
    })

    const undone = undoReject(replaced)
    expect(undone).toEqual(revealed)
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
    // A face-down or missing card cannot reopen a dialog.
    expect(chosenItem(chooseCard(revealed, 'b'))).toBeNull()
    expect(chosenItem(chooseCard(revealed, 'x'))).toBeNull()
    // Clearing removes the key, so the stored value matches the one before choosing.
    expect(JSON.stringify(clearChoice(chosen))).toBe(JSON.stringify(revealed))
    expect(
      storedFlowSchema.parse({ step: 'cards', conditions, shortlist: chosen })
        .shortlist,
    ).toEqual(chosen)
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
