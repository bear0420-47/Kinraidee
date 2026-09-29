import type { z } from 'zod'

import { HttpError } from '@/shared/httpError'

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
