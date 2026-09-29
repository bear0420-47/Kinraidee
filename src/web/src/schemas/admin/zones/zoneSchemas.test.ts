import { describe, expect, it } from 'vitest'

import {
  getZoneChanges,
  toZoneFormValues,
  zoneFormSchema,
  type Zone,
  type ZoneFormInput,
} from './zoneSchemas'

const zone: Zone = {
  id: 'zone_1',
  name: { th: 'หน้ามอ', en: 'Front Gate' },
  description: null,
  sortOrder: 1,
}

const validInput: ZoneFormInput = {
  nameTh: ' หน้ามอ ',
  nameEn: ' Front Gate ',
  descriptionTh: '',
  descriptionEn: '',
  sortOrder: ' 1 ',
}

function firstIssue(input: Partial<ZoneFormInput>) {
  const result = zoneFormSchema.safeParse({ ...validInput, ...input })
  if (result.success) throw new Error('Expected validation to fail.')
  const [issue] = result.error.issues
  return { field: issue?.path.join('.'), message: issue?.message }
}

describe('zoneFormSchema', () => {
  it('trims values and builds the API body with a null description', () => {
    expect(zoneFormSchema.parse(validInput)).toEqual({
      name: { th: 'หน้ามอ', en: 'Front Gate' },
      description: null,
      sortOrder: 1,
    })
  })

  it('keeps a description when both languages are filled', () => {
    expect(
      zoneFormSchema.parse({
        ...validInput,
        descriptionTh: ' ใกล้ประตู ',
        descriptionEn: ' Near the gate ',
      }).description,
    ).toEqual({ th: 'ใกล้ประตู', en: 'Near the gate' })
  })

  it.each([
    [{ nameTh: '   ' }, 'nameTh', 'กรุณากรอกชื่อภาษาไทย'],
    [{ nameEn: '' }, 'nameEn', 'กรุณากรอกชื่อภาษาอังกฤษ'],
    [{ sortOrder: '' }, 'sortOrder', 'กรุณากรอกลำดับการแสดงผล'],
    [{ sortOrder: '1.5' }, 'sortOrder', 'ลำดับการแสดงผลต้องเป็นจำนวนเต็ม'],
    [{ sortOrder: 'abc' }, 'sortOrder', 'ลำดับการแสดงผลต้องเป็นจำนวนเต็ม'],
    [
      { sortOrder: '2147483648' },
      'sortOrder',
      'ลำดับการแสดงผลต้องอยู่ในช่วงที่ระบบรองรับ',
    ],
  ])('rejects %o on %s', (input, field, message) => {
    expect(firstIssue(input)).toEqual({ field, message })
  })

  it('accepts negative and int32 boundary sort orders', () => {
    expect(
      zoneFormSchema.parse({ ...validInput, sortOrder: '-5' }).sortOrder,
    ).toBe(-5)
    expect(
      zoneFormSchema.parse({ ...validInput, sortOrder: '2147483647' })
        .sortOrder,
    ).toBe(2147483647)
  })

  it.each([
    [{ descriptionTh: 'ใกล้ประตู' }, 'descriptionEn'],
    [{ descriptionEn: 'Near the gate' }, 'descriptionTh'],
  ])(
    'requires both description languages when %o is filled',
    (input, field) => {
      expect(firstIssue(input)).toEqual({
        field,
        message:
          'กรุณากรอกคำอธิบายทั้งภาษาไทยและภาษาอังกฤษ หรือเว้นว่างทั้งสองช่อง',
      })
    },
  )
})

describe('toZoneFormValues', () => {
  it('returns empty values for a new zone', () => {
    expect(toZoneFormValues()).toEqual({
      nameTh: '',
      nameEn: '',
      descriptionTh: '',
      descriptionEn: '',
      sortOrder: '',
    })
  })

  it('pre-fills an existing zone', () => {
    expect(
      toZoneFormValues({
        ...zone,
        description: { th: 'ใกล้ประตู', en: 'Near the gate' },
      }),
    ).toEqual({
      nameTh: 'หน้ามอ',
      nameEn: 'Front Gate',
      descriptionTh: 'ใกล้ประตู',
      descriptionEn: 'Near the gate',
      sortOrder: '1',
    })
  })
})

describe('getZoneChanges', () => {
  const unchanged = zoneFormSchema.parse(toZoneFormValues(zone))

  it('returns null when nothing changed', () => {
    expect(getZoneChanges(zone, unchanged)).toBeNull()
  })

  it('returns only changed fields, sending both name languages together', () => {
    expect(
      getZoneChanges(zone, {
        ...unchanged,
        name: { th: 'หน้ามอ', en: 'Main Gate' },
        sortOrder: 4,
      }),
    ).toEqual({ name: { th: 'หน้ามอ', en: 'Main Gate' }, sortOrder: 4 })
  })

  it('sends null to clear an existing description', () => {
    const described = {
      ...zone,
      description: { th: 'ใกล้ประตู', en: 'Near the gate' },
    }
    expect(getZoneChanges(described, unchanged)).toEqual({ description: null })
  })
})
