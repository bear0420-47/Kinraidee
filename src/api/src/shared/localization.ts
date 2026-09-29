import { z } from 'zod'

const localizedValueSchema = z.string().trim().min(1, 'Must not be empty.')

export const localizationSchema = z
  .object({
    th: localizedValueSchema,
    en: localizedValueSchema,
  })
  .strict()

export type Localization = z.infer<typeof localizationSchema>

export function toLocalization(th: string, en: string): Localization {
  return { th, en }
}

export function toOptionalLocalization(
  th: string | null,
  en: string | null,
): Localization | null {
  return th !== null && en !== null ? { th, en } : null
}
