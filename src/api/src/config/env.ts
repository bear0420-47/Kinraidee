import { z } from 'zod'

import { argon2EnvSchema } from './argon2'

const corsAllowedOriginsSchema = z.preprocess(
  (value) => value ?? 'http://localhost:5173',
  z.string().transform((value, context) => {
    const origins = new Set<string>()

    for (const candidate of value.split(',')) {
      const origin = candidate.trim()
      if (!origin) continue

      try {
        const url = new URL(origin)
        const isOriginOnly =
          (url.protocol === 'http:' || url.protocol === 'https:') &&
          !url.username &&
          !url.password &&
          url.pathname === '/' &&
          !url.search &&
          !url.hash

        if (!isOriginOnly) throw new Error('Invalid origin')
        origins.add(url.origin)
      } catch {
        context.addIssue({
          code: 'custom',
          message: 'CORS_ALLOWED_ORIGINS contains an invalid origin.',
        })
      }
    }

    if (origins.size === 0) {
      context.addIssue({
        code: 'custom',
        message: 'CORS_ALLOWED_ORIGINS must contain at least one origin.',
      })
    }

    return [...origins]
  }),
)

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  ...argon2EnvSchema.shape,
  CORS_ALLOWED_ORIGINS: corsAllowedOriginsSchema,
})

export function parseEnv(input: NodeJS.ProcessEnv) {
  return envSchema.parse(input)
}

export const env = parseEnv(process.env)

export const corsAllowedOrigins = env.CORS_ALLOWED_ORIGINS
