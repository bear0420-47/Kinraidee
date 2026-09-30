import { describe, expect, it } from 'vitest'

import {
  foodTypeFormSchema,
  getFoodTypeChanges,
  toFoodTypeFormValues,
  type FoodType,
  type FoodTypeFormInput,
} from './foodTypeSchemas'

const noodles: FoodType = {
  id: 'food_type_1',
  name: { th: 'ก๋วยเตี๋ยว', en: 'Noodles' },
  icon: 'noodles',
  sortOrder: 1,
}

const validInput: FoodTypeFormInput = {
  nameTh: ' ก๋วยเตี๋ยว ',
  nameEn: ' Noodles ',
  icon: 'noodles',
  sortOrder: '1',
}

describe('foodTypeFormSchema', () => {
  it('trims names and builds the API body', () => {
    expect(foodTypeFormSchema.parse(validInput)).toEqual({
      name: { th: 'ก๋วยเตี๋ยว', en: 'Noodles' },
      icon: 'noodles',
      sortOrder: 1,
    })
  })

  it('normalizes the empty icon choice to null', () => {
    expect(
      foodTypeFormSchema.parse({ ...validInput, icon: '' }).icon,
    ).toBeNull()
  })

  it('rejects icon keys outside the registry', () => {
    const result = foodTypeFormSchema.safeParse({
      ...validInput,
      icon: '<svg></svg>',
    })
    expect(result.error?.issues[0]?.message).toBe('กรุณาเลือกไอคอนจากรายการ')
  })

  it('applies the shared name and sortOrder rules', () => {
    const result = foodTypeFormSchema.safeParse({
      nameTh: '',
      nameEn: ' ',
      icon: '',
      sortOrder: '1.5',
    })
    expect(
      result.error?.issues.map((issue) => [issue.path[0], issue.message]),
    ).toEqual([
      ['nameTh', 'กรุณากรอกชื่อภาษาไทย'],
      ['nameEn', 'กรุณากรอกชื่อภาษาอังกฤษ'],
      ['sortOrder', 'ลำดับการแสดงผลต้องเป็นจำนวนเต็ม'],
    ])
  })
})

describe('toFoodTypeFormValues', () => {
  it('returns empty values for a new food type', () => {
    expect(toFoodTypeFormValues()).toEqual({
      nameTh: '',
      nameEn: '',
      icon: '',
      sortOrder: '',
    })
  })

  it('pre-fills a known icon and shows null or unknown keys as the fallback choice', () => {
    expect(toFoodTypeFormValues(noodles).icon).toBe('noodles')
    expect(toFoodTypeFormValues({ ...noodles, icon: null }).icon).toBe('')
    expect(toFoodTypeFormValues({ ...noodles, icon: 'dumpling' }).icon).toBe('')
  })
})

describe('getFoodTypeChanges', () => {
  it('returns null when nothing changed', () => {
    const body = foodTypeFormSchema.parse(toFoodTypeFormValues(noodles))
    expect(getFoodTypeChanges(noodles, body)).toBeNull()
  })

  it('returns only changed fields', () => {
    const body = foodTypeFormSchema.parse({
      ...toFoodTypeFormValues(noodles),
      icon: '',
      sortOrder: '7',
    })
    expect(getFoodTypeChanges(noodles, body)).toEqual({
      icon: null,
      sortOrder: 7,
    })
  })

  it('leaves an untouched unknown icon key as stored', () => {
    const unknown = { ...noodles, icon: 'dumpling' }
    const body = foodTypeFormSchema.parse(toFoodTypeFormValues(unknown))
    expect(getFoodTypeChanges(unknown, body)).toBeNull()
  })
})
