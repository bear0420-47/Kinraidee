import { UserRole } from '@prisma/client'
import { z } from 'zod'

import {
  createPasswordSchema,
  normalizedEmailSchema,
} from '@/config/credentials'
import { HttpError } from '@/shared/httpError'

export const authCredentialsSchema = z
  .object({
    email: normalizedEmailSchema,
    password: createPasswordSchema(),
  })
  .strict()

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
})

export const authUserEnvelopeSchema = z.object({
  data: z.object({ user: authUserSchema }),
})

export const authErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
})

export type AuthCredentials = z.infer<typeof authCredentialsSchema>
export type AuthUser = z.infer<typeof authUserSchema>

export function parseAuthCredentials(input: unknown) {
  const result = authCredentialsSchema.safeParse(input)

  if (!result.success) {
    const fields: Record<string, string> = {}

    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? 'body')
      fields[field] ??= issue.message
    }

    throw new HttpError({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request.',
      fields,
    })
  }

  return result.data
}

export function toAuthUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  }
}
