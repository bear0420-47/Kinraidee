import type { FoodType } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import {
  parseCreateFoodType,
  parseFoodTypeId,
  parseUpdateFoodType,
  toAdminFoodType,
  toFoodTypeCreateData,
  toFoodTypeUpdateData,
  toPublicFoodType,
} from './food-types.dto'

const validFoodType = {
  name: { th: 'ข้าว', en: 'Rice' },
  icon: 'rice',
  sortOrder: 0,
}

function fieldsOf(action: () => unknown) {
  try {
    action()
  } catch (error) {
    return (error as { fields: Record<string, string> }).fields
  }
  throw new Error('Expected validation to fail')
}

describe('food type request validation', () => {
  it('trims localized names and the icon key', () => {
    expect(
      parseCreateFoodType({
        name: { th: ' ข้าว ', en: ' Rice ' },
        icon: ' rice ',
        sortOrder: 0,
      }),
    ).toEqual(validFoodType)
  })

  it.each([undefined, null, '', '   '])('treats icon %j as no icon', (icon) => {
    const input =
      icon === undefined
        ? { name: validFoodType.name, sortOrder: 0 }
        : { ...validFoodType, icon }
    expect(parseCreateFoodType(input).icon ?? null).toBeNull()
  })

  it.each([
    [{ ...validFoodType, name: { th: ' ', en: 'Rice' } }, 'name.th'],
    [{ ...validFoodType, name: { th: 'ข้าว' } }, 'name.en'],
    [{ ...validFoodType, icon: '<svg/>' }, 'icon'],
    [{ ...validFoodType, icon: 'https://x.example/a.svg' }, 'icon'],
    [{ ...validFoodType, sortOrder: 2147483648 }, 'sortOrder'],
    [{ ...validFoodType, sortOrder: 0.5 }, 'sortOrder'],
    [{ ...validFoodType, description: null }, 'body'],
  ])('rejects %j at %s', (input, field) => {
    expect(Object.keys(fieldsOf(() => parseCreateFoodType(input)))).toContain(
      field,
    )
  })

  it('requires at least one field on update', () => {
    expect(fieldsOf(() => parseUpdateFoodType({}))).toEqual({
      body: 'At least one field is required.',
    })
    expect(parseUpdateFoodType({ icon: '' })).toEqual({ icon: null })
  })

  it('rejects an empty route id', () => {
    expect(fieldsOf(() => parseFoodTypeId({ id: '' }))).toHaveProperty('id')
  })
})

describe('food type mapping', () => {
  const foodType: FoodType = {
    id: 'food_type_1',
    nameTh: 'ข้าว',
    nameEn: 'Rice',
    icon: null,
    sortOrder: 1,
    createdAt: new Date('2026-09-28T00:00:00.000Z'),
    updatedAt: new Date('2026-09-29T00:00:00.000Z'),
  }

  it('maps create input with a missing icon to null', () => {
    expect(
      toFoodTypeCreateData({ name: validFoodType.name, sortOrder: 0 }),
    ).toEqual({ nameTh: 'ข้าว', nameEn: 'Rice', icon: null, sortOrder: 0 })
  })

  it('maps only supplied update fields', () => {
    expect(toFoodTypeUpdateData({ icon: null })).toEqual({ icon: null })
    expect(toFoodTypeUpdateData({ sortOrder: 2 })).toEqual({ sortOrder: 2 })
  })

  it('omits timestamps from the public shape and includes them for admins', () => {
    expect(toPublicFoodType(foodType)).toEqual({
      id: 'food_type_1',
      name: { th: 'ข้าว', en: 'Rice' },
      icon: null,
      sortOrder: 1,
    })
    expect(toAdminFoodType(foodType)).toMatchObject({
      createdAt: '2026-09-28T00:00:00.000Z',
      updatedAt: '2026-09-29T00:00:00.000Z',
    })
  })
})
