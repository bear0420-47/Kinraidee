import type { Zone } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import {
  parseCreateZone,
  parseUpdateZone,
  parseZoneId,
  toAdminZone,
  toPublicZone,
  toZoneCreateData,
  toZoneUpdateData,
} from './zones.dto'

const validZone = {
  name: { th: 'หน้ามอ', en: 'Front Gate' },
  description: {
    th: 'บริเวณหน้ามหาวิทยาลัย',
    en: 'University front gate area',
  },
  sortOrder: 0,
}

function fieldsOf(action: () => unknown) {
  try {
    action()
  } catch (error) {
    return (error as { code: string; fields: Record<string, string> }).fields
  }
  throw new Error('Expected validation to fail')
}

describe('zone request validation', () => {
  it('trims localized text', () => {
    expect(
      parseCreateZone({
        ...validZone,
        name: { th: '  หน้ามอ ', en: ' Front Gate ' },
      }).name,
    ).toEqual({ th: 'หน้ามอ', en: 'Front Gate' })
  })

  it('accepts a missing or null description', () => {
    const { description: _omitted, ...withoutDescription } = validZone
    expect(parseCreateZone(withoutDescription).description).toBeUndefined()
    expect(
      parseCreateZone({ ...validZone, description: null }).description,
    ).toBeNull()
  })

  it.each([
    [{ ...validZone, name: { th: '   ', en: 'Front Gate' } }, 'name.th'],
    [{ ...validZone, name: { th: 'หน้ามอ' } }, 'name.en'],
    [{ ...validZone, description: { th: 'คำอธิบาย' } }, 'description.en'],
    [{ ...validZone, sortOrder: 1.5 }, 'sortOrder'],
    [{ ...validZone, sortOrder: '1' }, 'sortOrder'],
    [{ ...validZone, sortOrder: 2147483648 }, 'sortOrder'],
    [{ name: validZone.name }, 'sortOrder'],
    [{ ...validZone, deletedAt: null }, 'body'],
  ])('rejects %j at %s', (input, field) => {
    expect(Object.keys(fieldsOf(() => parseCreateZone(input)))).toContain(field)
  })

  it.each([-2147483648, 2147483647])(
    'accepts sortOrder boundary %i',
    (sortOrder) => {
      expect(parseCreateZone({ ...validZone, sortOrder }).sortOrder).toBe(
        sortOrder,
      )
    },
  )

  it('requires at least one field on update and accepts partial input', () => {
    expect(fieldsOf(() => parseUpdateZone({}))).toEqual({
      body: 'At least one field is required.',
    })
    expect(parseUpdateZone({ sortOrder: 3 })).toEqual({ sortOrder: 3 })
    expect(parseUpdateZone({ description: null })).toEqual({
      description: null,
    })
  })

  it('rejects an empty route id', () => {
    expect(fieldsOf(() => parseZoneId({ id: '' }))).toHaveProperty('id')
  })
})

describe('zone mapping', () => {
  const zone: Zone = {
    id: 'zone_1',
    nameTh: 'หน้ามอ',
    nameEn: 'Front Gate',
    descriptionTh: null,
    descriptionEn: null,
    sortOrder: 2,
    createdAt: new Date('2026-09-28T00:00:00.000Z'),
    updatedAt: new Date('2026-09-29T00:00:00.000Z'),
  }

  it('maps create input to every column', () => {
    expect(toZoneCreateData({ ...validZone, description: undefined })).toEqual({
      nameTh: 'หน้ามอ',
      nameEn: 'Front Gate',
      descriptionTh: null,
      descriptionEn: null,
      sortOrder: 0,
    })
  })

  it('maps only supplied update fields and clears description with null', () => {
    expect(toZoneUpdateData({ sortOrder: 4 })).toEqual({ sortOrder: 4 })
    expect(toZoneUpdateData({ description: null })).toEqual({
      descriptionTh: null,
      descriptionEn: null,
    })
  })

  it('omits timestamps from the public shape', () => {
    expect(toPublicZone(zone)).toEqual({
      id: 'zone_1',
      name: { th: 'หน้ามอ', en: 'Front Gate' },
      description: null,
      sortOrder: 2,
    })
  })

  it('includes ISO timestamps in the admin shape', () => {
    expect(toAdminZone(zone)).toMatchObject({
      createdAt: '2026-09-28T00:00:00.000Z',
      updatedAt: '2026-09-29T00:00:00.000Z',
    })
  })
})
