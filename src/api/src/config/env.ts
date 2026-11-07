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

const booleanEnvSchema = z.preprocess((value) => {
  if (value === undefined || value === false || value === 'false') return false
  if (value === true || value === 'true') return true
  return value
}, z.boolean())

// Example and test values that pass the length check but are public, so anyone could
// forge session tokens if production used them.
const knownPlaceholderSecrets = [
  'replace-with',
  'change-me',
  'changeme',
  'test-secret',
]

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    // Which X-Forwarded-For hops to trust for the client IP used by rate limits:
    // 0 = no proxy (local), a hop count, or `true` to use the left-most address when
    // the proxy chain is managed and changes (Firebase Hosting -> Cloud Run).
    TRUST_PROXY: z
      .preprocess(
        (value) => (value === 'true' ? true : value),
        z.union([z.literal(true), z.coerce.number().int().min(0).max(10)]),
      )
      .default(0),
    ...argon2EnvSchema.shape,
    CORS_ALLOWED_ORIGINS: corsAllowedOriginsSchema,
    LOCAL_UPLOADS_ENABLED: booleanEnvSchema.default(false),
    LOCAL_UPLOADS_DIRECTORY: z.string().trim().min(1).default('.local/uploads'),
    LOCAL_UPLOAD_MAX_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(2_097_152),
    GEMINI_API_KEY: z.string().trim().min(1).optional(),
    GEMINI_MODEL: z.string().trim().min(1).default('gemini-3.5-flash-lite'),
    GOOGLE_PLACES_API_KEY: z.string().trim().min(1).optional(),
    EXTERNAL_PROVIDER_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1_000)
      .max(5_000)
      .default(5_000),
  })
  .superRefine((value, context) => {
    if (
      value.NODE_ENV === 'production' &&
      knownPlaceholderSecrets.some((placeholder) =>
        value.JWT_SECRET.toLowerCase().includes(placeholder),
      )
    ) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message:
          'JWT_SECRET must be a unique random secret in production, not a placeholder.',
      })
    }

    if (value.NODE_ENV === 'production' && value.LOCAL_UPLOADS_ENABLED) {
      context.addIssue({
        code: 'custom',
        path: ['LOCAL_UPLOADS_ENABLED'],
        message: 'LOCAL_UPLOADS_ENABLED must be false in production.',
      })
    }
  })

export function parseEnv(input: NodeJS.ProcessEnv) {
  return envSchema.parse(input)
}

export const env = parseEnv(process.env)

export const corsAllowedOrigins = env.CORS_ALLOWED_ORIGINS
