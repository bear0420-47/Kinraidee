import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import type { z } from 'zod'

// Supports flat forms only: each issue maps to its top-level field name.
export function zodFormResolver<
  Schema extends z.ZodType<FieldValues, FieldValues>,
>(schema: Schema): Resolver<z.input<Schema>, unknown, z.output<Schema>> {
  return async (values) => {
    const result = await schema.safeParseAsync(values)

    if (result.success) return { values: result.data, errors: {} }

    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? 'root')
      errors[field] ??= { type: issue.code, message: issue.message }
    }

    return { values: {}, errors: errors as FieldErrors<z.input<Schema>> }
  }
}
