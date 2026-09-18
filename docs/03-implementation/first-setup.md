# First Local Setup

Use this checklist when setting up Kinraidee on a new machine or when an AI agent takes over a fresh clone.

## 1. Install Tooling

- Use Node.js compatible with the workspace toolchain.
- Use pnpm `12.4.2` through Corepack:

```sh
corepack prepare pnpm@12.4.2 --activate
pnpm --version
```

Expected pnpm version:

```txt
12.4.2
```

## 2. Install Dependencies

```sh
pnpm install
```

If pnpm asks to approve dependency build scripts, approve only the packages already listed in `pnpm-workspace.yaml` under `allowBuilds`.

## 3. Set Up Local PostgreSQL

Local development needs PostgreSQL. First check whether PostgreSQL is already available on the user's machine. If it is not available, use Docker Compose.

### Check For Existing PostgreSQL

Check whether `psql` exists:

```sh
command -v psql
```

If `psql` exists, test the default local connection:

```sh
psql postgresql://postgres:postgres@localhost:5432/kinraidee -c 'select 1;'
```

If that command succeeds, use this `DATABASE_URL`:

```txt
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kinraidee
```

If PostgreSQL exists but the default connection fails, inspect or ask for the local database credentials instead of starting a second PostgreSQL on the same port.

### Fallback: Docker PostgreSQL

If `psql` is missing or the machine has no usable local PostgreSQL service, start the committed Docker Compose service:

```sh
docker compose up -d postgres
```

Default local database values:

```txt
host: localhost
port: 5432
database: kinraidee
user: postgres
password: postgres
```

These defaults match `docker-compose.yml` and `src/api/.env.example`. Do not ask the human for `DATABASE_URL` when using the committed Docker Compose service.

After Docker starts, verify the container is healthy:

```sh
docker compose ps postgres
```

## 4. Create Local Environment Files

Copy the example files:

```sh
cp src/web/.env.example src/web/.env
cp src/api/.env.example src/api/.env
```

Then edit only values that are truly local to the machine. When the scaffold already defines the local port, use the scaffold default instead of asking the human.

### Web `.env`

```txt
VITE_API_BASE_URL=http://localhost:3000
```

Use the API origin from `src/api/src/config/env.ts`. The scaffold default API port is `3000`, so the default web value is `http://localhost:3000`.

### API `.env`

```txt
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kinraidee
SESSION_SECRET=<generate-local-secret>
ARGON2_MEMORY_COST=19456
ARGON2_TIME_COST=2
ARGON2_PARALLELISM=1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Set these values for the local machine:

- `DATABASE_URL`: local PostgreSQL connection string. Use the existing local PostgreSQL URL if verified. Otherwise use the committed Docker Compose default.
- `SESSION_SECRET`: random local secret with at least 32 characters. Generate it locally; do not ask the human to invent one.
- `ARGON2_MEMORY_COST`, `ARGON2_TIME_COST`, `ARGON2_PARALLELISM`: Argon2id password-hashing cost settings. Use the defaults; they match the OWASP Password Storage Cheat Sheet minimum for Argon2id.
- `CORS_ALLOWED_ORIGINS`: comma-separated web origins allowed to call the API with credentials. The scaffold default web port is `5173`, so the default local value is `http://localhost:5173`.

Generate a local `SESSION_SECRET` with Node.js:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

### Argon2id Settings

`ARGON2_MEMORY_COST` controls memory hardness in KiB. Higher values use more RAM and make password cracking harder. Possible value: a positive integer supported by the `argon2` package. Local default: `19456`, about 19 MiB.

`ARGON2_TIME_COST` controls iteration count. Higher values make hashing slower and harder to brute force. Possible value: a positive integer. Local default: `2`.

`ARGON2_PARALLELISM` controls parallel lanes/threads used by Argon2. Possible value: a positive integer. Local default: `1`.

Use these defaults without asking the human. Do not lower them without security review. Raise them only after measuring login latency and resource use in the target environment.

Only ask the human when a local PostgreSQL installation exists but the repo default connection fails and the correct local credentials cannot be inferred. Do not ask when Docker Compose can provide the repo default database.

## 5. Generate Prisma Client

The Prisma schema lives at `src/api/prisma/schema.prisma`. Generate the client with the explicit schema path:

```sh
pnpm --filter api prisma generate --schema=prisma/schema.prisma
```

Do not create a migration until there is a real approved database schema.

## 6. Run Verification

```sh
pnpm verify
pnpm format
node tests/wireframe-requirements.test.cjs
```

Record exact command results in `docs/verification.md` when implementation work is reported complete.

## 7. Run The Apps

Use separate terminals:

```sh
pnpm dev:api
pnpm dev:web
```

Default local URLs:

- API: `http://localhost:3000`
- Web: `http://localhost:5173`

## AI Agent Rules

- Read `AGENTS.md`, `rule.md`, `docs/plan.md`, the current specification, and `docs/03-implementation/engineering-guidelines.md` before changing implementation files.
- Never commit `.env` files.
- If a required local value is missing and cannot be inferred from `.env.example`, ask the human.
- Do not invent database credentials, production secrets, role rules, or deployment settings.
- Keep local-only setup changes out of committed source files.
