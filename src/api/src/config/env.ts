import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(19456),
  ARGON2_TIME_COST: z.coerce.number().int().positive().default(2),
  ARGON2_PARALLELISM: z.coerce.number().int().positive().default(1),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
})

export const env = envSchema.parse(process.env)

export const corsAllowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0)
