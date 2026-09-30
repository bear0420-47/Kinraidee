import { describe, expect, it } from 'vitest'

import {
  getTasteChanges,
  tasteFormSchema,
  toTasteFormValues,
  type Taste,
} from './tasteSchemas'

// The shared name, sortOrder, and change rules are covered by foodTypeSchemas.test.ts.
const spicy: Taste = {
  id: 'taste_1',
  name: { th: 'เผ็ด', en: 'Spicy' },
  icon: 'flame',
  sortOrder: 1,
}

describe('tasteFormSchema', () => {
  it('builds the API body with a taste registry key', () => {
    expect(
      tasteFormSchema.parse({
        nameTh: ' เผ็ด ',
        nameEn: ' Spicy ',
        icon: 'flame',
        sortOrder: '1',
      }),
    ).toEqual({
      name: { th: 'เผ็ด', en: 'Spicy' },
      icon: 'flame',
      sortOrder: 1,
    })
  })

  it('normalizes the empty icon choice to null', () => {
    expect(
      tasteFormSchema.parse({ ...toTasteFormValues(spicy), icon: '' }).icon,
    ).toBeNull()
  })

  it('rejects keys from other registries', () => {
    const result = tasteFormSchema.safeParse({
      ...toTasteFormValues(spicy),
      icon: 'rice',
    })
    expect(result.error?.issues[0]?.message).toBe('กรุณาเลือกไอคอนจากรายการ')
  })
})

describe('getTasteChanges', () => {
  it('returns only changed fields and null when nothing changed', () => {
    const unchanged = tasteFormSchema.parse(toTasteFormValues(spicy))
    expect(getTasteChanges(spicy, unchanged)).toBeNull()
    expect(
      getTasteChanges(spicy, {
        ...unchanged,
        name: { th: 'เผ็ดมาก', en: 'Spicy' },
      }),
    ).toEqual({ name: { th: 'เผ็ดมาก', en: 'Spicy' } })
  })

  it('leaves an untouched unknown icon key as stored', () => {
    const unknown = { ...spicy, icon: 'chili' }
    const body = tasteFormSchema.parse(toTasteFormValues(unknown))
    expect(body.icon).toBeNull()
    expect(getTasteChanges(unknown, body)).toBeNull()
  })
})
