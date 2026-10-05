import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { PrismaClient, UserRole, type Prisma } from '@prisma/client'
import argon2 from 'argon2'
import { z } from 'zod'

import { argon2EnvSchema } from '../src/config/argon2'
import {
  createPasswordSchema,
  normalizedEmailSchema,
} from '../src/config/credentials'
import {
  formatCatalogSeedSummary,
  loadCatalogSeed,
  seedCatalog,
} from './catalog-seed'

const seedEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required.'),
  ...argon2EnvSchema.shape,
  SEED_ADMIN_EMAIL: normalizedEmailSchema,
  SEED_ADMIN_PASSWORD: createPasswordSchema('SEED_ADMIN_PASSWORD'),
})

export type SeedEnv = z.infer<typeof seedEnvSchema>
type UpsertAdmin = (args: Prisma.UserUpsertArgs) => Promise<unknown>

export function parseSeedEnv(input: NodeJS.ProcessEnv) {
  return seedEnvSchema.parse(input)
}

export async function createInitialAdminUpsertArgs(input: NodeJS.ProcessEnv) {
  const config = parseSeedEnv(input)
  const password = await argon2.hash(config.SEED_ADMIN_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: config.ARGON2_MEMORY_COST,
    timeCost: config.ARGON2_TIME_COST,
    parallelism: config.ARGON2_PARALLELISM,
  })

  return {
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
  } satisfies Prisma.UserUpsertArgs
}

export async function seedInitialAdmin(
  upsertAdmin: UpsertAdmin,
  input: NodeJS.ProcessEnv,
  writeSummary: (message: string) => void = console.log,
) {
  await upsertAdmin(await createInitialAdminUpsertArgs(input))

  writeSummary('Seeded 1 administrator account.')
}

export function formatSeedError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
  }

  return 'Database seed failed.'
}

export async function runSeed(
  input: NodeJS.ProcessEnv = process.env,
  writeSummary: (message: string) => void = console.log,
) {
  const adminUpsertArgs = await createInitialAdminUpsertArgs(input)
  const catalog = await loadCatalogSeed()
  const prisma = new PrismaClient()

  try {
    const counts = await prisma.$transaction(async (transaction) => {
      await transaction.user.upsert(adminUpsertArgs)
      return seedCatalog(transaction, catalog)
    })

    writeSummary('Seeded 1 administrator account.')
    writeSummary(formatCatalogSeedSummary(counts))
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
