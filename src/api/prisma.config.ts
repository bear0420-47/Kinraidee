import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

import { defineConfig } from 'prisma/config'

if (existsSync('.env')) loadEnvFile('.env')

// Local PostgreSQL does not need separate pooled and direct connections.
process.env.DIRECT_DATABASE_URL ??= process.env.DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
})
