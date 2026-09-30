import { z } from 'zod'

import { HttpError } from '@/shared/httpError'

export function emptyTrimmedStringToNull(value: unknown) {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed || null
}

export const optionalTrimmedStringSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed || undefined
}, z.string().optional())

export function parseWithSchema<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): z.output<Schema> {
  const result = schema.safeParse(input)
  if (result.success) return result.data

  const fields: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const field = issue.path.length > 0 ? issue.path.join('.') : 'body'
    fields[field] ??= issue.message
  }

  throw new HttpError({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid request.',
    fields,
  })
}
