# Kinraidee

Kinraidee is a document-first food decision assistant project. The first release focuses on one workflow: collect short meal conditions and return up to three suitable restaurant or menu choices.

## Repository Layout

- `AGENTS.md` — canonical agent workflow and repository rules for Codex-first collaboration.
- `CLAUDE.md` — Claude entry point that delegates to `AGENTS.md`.
- `rule.md` — legal, PDPA, consent, retention, and compliance rules.
- `docs/` — intent, specification, backlog, design pack, plan, verification, and review evidence.
- `docs/03-implementation/engineering-guidelines.md` — approved stack decisions, project structure, and implementation rules.
- `docs/03-implementation/data-model.md` — locked Prisma models, relations, and API data shapes.
- `docs/03-implementation/github-mcp-codex-setup.md` — Codex setup guide for GitHub MCP access.
- `docs/03-implementation/module-implementation-checklist.md` — required checklist before adding or changing feature modules.
- `evidence/` — survey summary and archived evidence.
- `src/` — pnpm workspace packages for the web and API application boundaries.
- `src/web/` — mobile-first React + TypeScript web client boundary.
- `src/api/` — Express 5 + TypeScript REST API boundary.
- `tests/` — runnable checks for committed prototype/workflow artifacts.
- `assets/` — static food and vendor assets used by the prototype.
- `templates/` — document templates for SDLC artifacts.

## Current Status

Requirements, data model, and `docs/plan.md` are approved for implementation. API/data work and non-visual web foundations may start; final visual web screens wait for explicit approval of the draft design pack. Public production deployment requires separate human approval.

## Live Site

https://kinraidee-512615.web.app (Firebase Hosting; `/api/**` goes to Cloud Run). Deployment notes: `docs/03-implementation/google-cloud-deployment.md`.

Final deliverables index: [`.docs/final/README.md`](.docs/final/README.md).

## Run Locally

Needs Node.js 22, pnpm (version pinned in `package.json`) and Docker (for PostgreSQL). Full details and troubleshooting: `docs/03-implementation/first-setup.md`.

```sh
pnpm install
docker compose up -d
cp src/api/.env.example src/api/.env
cp src/web/.env.example src/web/.env
```

Edit `src/api/.env`:

- `JWT_SECRET`: a random value, for example from `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
- `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`: the local test administrator (see Test Accounts).
- `GEMINI_API_KEY` is optional. Without it the app uses the non-AI shortlist only.

Then create the database and start both apps in separate terminals:

```sh
pnpm --filter api prisma generate
pnpm --filter api prisma migrate deploy
pnpm --filter api prisma db seed
pnpm dev:api
pnpm dev:web
```

Open http://localhost:5173 (the web must use port 5173; the API runs on 3000).

## Test Accounts

| Account | Where | How to get it |
|---|---|---|
| Meal seeker (no account) | Live site or local | The main workflow at `/meal` needs no account. |
| Registered user | Live site or local | Register at `/register` with any test email address and a password of 8–128 characters. |
| Administrator | Local only | Created by `prisma db seed` from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`. Suggested local test values: `admin@kinraidee.test` with a password you choose. Sign in at `/login`, then open `/admin`. |

The production administrator account is not shared, and the production seed never changes it.

## Secrets

`.env` files are git-ignored; only `.env.example` files with empty or local values are committed. Production secrets live in Google Secret Manager.

## Run Checks

```sh
pnpm verify
node tests/wireframe-requirements.test.cjs
```

`pnpm verify` runs typecheck, lint, all API and web tests, and both builds.
