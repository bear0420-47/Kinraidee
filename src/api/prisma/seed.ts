import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { PrismaClient, UserRole, type Prisma } from '@prisma/client'
import argon2 from 'argon2'
import { z } from 'zod'

const seedEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required.'),
  ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(19456),
  ARGON2_TIME_COST: z.coerce.number().int().positive().default(2),
  ARGON2_PARALLELISM: z.coerce.number().int().positive().default(1),
  SEED_ADMIN_EMAIL: z
    .string()
    .trim()
    .toLowerCase()
    .email('SEED_ADMIN_EMAIL must be a valid email address.'),
  SEED_ADMIN_PASSWORD: z
    .string()
    .transform((value) => value.trim())
    .pipe(
      z
        .string()
        .min(8, 'SEED_ADMIN_PASSWORD must contain at least 8 characters.'),
    ),
})

export type SeedEnv = z.infer<typeof seedEnvSchema>
type UpsertAdmin = (args: Prisma.UserUpsertArgs) => Promise<unknown>

export function parseSeedEnv(input: NodeJS.ProcessEnv) {
  return seedEnvSchema.parse(input)
}

export async function seedInitialAdmin(
  upsertAdmin: UpsertAdmin,
  input: NodeJS.ProcessEnv,
  writeSummary: (message: string) => void = console.log,
) {
  const config = parseSeedEnv(input)
  const password = await argon2.hash(config.SEED_ADMIN_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: config.ARGON2_MEMORY_COST,
    timeCost: config.ARGON2_TIME_COST,
    parallelism: config.ARGON2_PARALLELISM,
  })

  await upsertAdmin({
    where: { email: config.SEED_ADMIN_EMAIL },
    create: {
      email: config.SEED_ADMIN_EMAIL,
      password,
      role: UserRole.ADMIN,
    },
    update: {
      password,
      role: UserRole.ADMIN,
    },
  })

  writeSummary('Seeded 1 administrator account.')
}

export function formatSeedError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
  }

  return 'Administrator seed failed.'
}

export async function runSeed(input: NodeJS.ProcessEnv = process.env) {
  const prisma = new PrismaClient()

  try {
    await seedInitialAdmin((args) => prisma.user.upsert(args), input)
  } finally {
    await prisma.$disconnect()
  }
}

const entryPath = process.argv[1]

if (entryPath && import.meta.url === pathToFileURL(resolve(entryPath)).href) {
  runSeed().catch((error: unknown) => {
    console.error(formatSeedError(error))
    process.exitCode = 1
  })
}
