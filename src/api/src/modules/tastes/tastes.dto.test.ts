import type { Taste } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import {
  parseCreateTaste,
  parseTasteId,
  parseUpdateTaste,
  toAdminTaste,
  toTasteCreateData,
  toTasteUpdateData,
  toPublicTaste,
} from './tastes.dto'

const validTaste = {
  name: { th: 'เผ็ด', en: 'Spicy' },
  icon: 'flame',
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

describe('taste request validation', () => {
  it('trims localized names and the icon key', () => {
    expect(
      parseCreateTaste({
        name: { th: ' เผ็ด ', en: ' Spicy ' },
        icon: ' flame ',
        sortOrder: 0,
      }),
    ).toEqual(validTaste)
  })

  it.each([undefined, null, '', '   '])('treats icon %j as no icon', (icon) => {
    const input =
      icon === undefined
        ? { name: validTaste.name, sortOrder: 0 }
        : { ...validTaste, icon }
    expect(parseCreateTaste(input).icon ?? null).toBeNull()
  })

  it.each([
    [{ ...validTaste, name: { th: ' ', en: 'Spicy' } }, 'name.th'],
    [{ ...validTaste, name: { th: 'เผ็ด' } }, 'name.en'],
    [{ ...validTaste, icon: '<svg/>' }, 'icon'],
    [{ ...validTaste, icon: '<b>flame</b>' }, 'icon'],
    [{ ...validTaste, icon: 'https://x.example/a.svg' }, 'icon'],
    [{ ...validTaste, sortOrder: 2147483648 }, 'sortOrder'],
    [{ ...validTaste, sortOrder: 0.5 }, 'sortOrder'],
    [{ ...validTaste, description: null }, 'body'],
  ])('rejects %j at %s', (input, field) => {
    expect(Object.keys(fieldsOf(() => parseCreateTaste(input)))).toContain(
      field,
    )
  })

  it('requires at least one field on update', () => {
    expect(fieldsOf(() => parseUpdateTaste({}))).toEqual({
      body: 'At least one field is required.',
    })
    expect(parseUpdateTaste({ icon: '' })).toEqual({ icon: null })
  })

  it('rejects an empty route id', () => {
    expect(fieldsOf(() => parseTasteId({ id: '' }))).toHaveProperty('id')
  })
})

describe('taste mapping', () => {
  const taste: Taste = {
    id: 'taste_1',
    nameTh: 'เผ็ด',
    nameEn: 'Spicy',
    icon: null,
    sortOrder: 1,
    createdAt: new Date('2026-09-28T00:00:00.000Z'),
    updatedAt: new Date('2026-09-29T00:00:00.000Z'),
  }

  it('maps create input with a missing icon to null', () => {
    expect(toTasteCreateData({ name: validTaste.name, sortOrder: 0 })).toEqual({
      nameTh: 'เผ็ด',
      nameEn: 'Spicy',
      icon: null,
      sortOrder: 0,
    })
  })

  it('maps only supplied update fields', () => {
    expect(toTasteUpdateData({ icon: null })).toEqual({ icon: null })
    expect(toTasteUpdateData({ sortOrder: 2 })).toEqual({ sortOrder: 2 })
  })

  it('omits timestamps from the public shape and includes them for admins', () => {
    expect(toPublicTaste(taste)).toEqual({
      id: 'taste_1',
      name: { th: 'เผ็ด', en: 'Spicy' },
      icon: null,
      sortOrder: 1,
    })
    expect(toAdminTaste(taste)).toMatchObject({
      createdAt: '2026-09-28T00:00:00.000Z',
      updatedAt: '2026-09-29T00:00:00.000Z',
    })
  })
})
