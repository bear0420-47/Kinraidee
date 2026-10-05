import { z } from 'zod'

import type { components } from '@/api/openapiTypes'

export type Localization = components['schemas']['Localization']

// Form fields shared by the admin master-data and catalog forms; they mirror the API rules.
export const localizedNameFields = {
  nameTh: z.string().trim().min(1, 'กรุณากรอกชื่อภาษาไทย'),
  nameEn: z.string().trim().min(1, 'กรุณากรอกชื่อภาษาอังกฤษ'),
}

export const sortOrderField = z
  .string()
  .trim()
  .min(1, 'กรุณากรอกลำดับการแสดงผล')
  .regex(/^-?\d+$/, 'ลำดับการแสดงผลต้องเป็นจำนวนเต็ม')
  .transform(Number)
  .pipe(z.int32('ลำดับการแสดงผลต้องอยู่ในช่วงที่ระบบรองรับ'))

export function isSameLocalization(
  a: Localization | null,
  b: Localization | null,
) {
  return a?.th === b?.th && a?.en === b?.en
}

// Optional localized description: both languages or neither, as the API requires.
export const optionalDescriptionFields = {
  descriptionTh: z.string().trim(),
  descriptionEn: z.string().trim(),
}

export function checkDescriptionPair(
  {
    descriptionTh,
    descriptionEn,
  }: { descriptionTh: string; descriptionEn: string },
  context: z.RefinementCtx,
) {
  if (Boolean(descriptionTh) === Boolean(descriptionEn)) return
  context.addIssue({
    code: 'custom',
    path: [descriptionTh ? 'descriptionEn' : 'descriptionTh'],
    message:
      'กรุณากรอกคำอธิบายทั้งภาษาไทยและภาษาอังกฤษ หรือเว้นว่างทั้งสองช่อง',
  })
}

export function toOptionalDescription(
  descriptionTh: string,
  descriptionEn: string,
): Localization | null {
  return descriptionTh ? { th: descriptionTh, en: descriptionEn } : null
}
