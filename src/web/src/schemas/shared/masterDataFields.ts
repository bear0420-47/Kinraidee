import { z } from 'zod'

import type { components } from '@/api/openapiTypes'

export type Localization = components['schemas']['Localization']

// Form fields shared by the Zone, FoodType, and Taste admin forms; they mirror the API rules.
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
