# Verification Report

## Status

Structural and scaffold verification run after adding the pnpm web/API workspace and updating pnpm to 12.4.2 on 2026-09-18. Security/compliance review remains pending before implementation is reported complete.

## Required checks

| Check | Command | Result | Evidence |
|---|---|---|---|
| Build | `pnpm verify` | Pass: typecheck, lint, Vitest 4.1.11 infra tests, and package builds all exited 0 | Local run on 2026-09-18 after adding API route composition boundary. |
| Test | `node tests/wireframe-requirements.test.cjs` | Pass: 24 tests, 0 fail, duration 21.515084ms | Local run on 2026-09-18 after adding API route composition boundary. |
| Lint | `pnpm format` | Pass: Prettier check exited 0 for both workspace packages | Local run on 2026-09-18 with pnpm 12.4.2 after package-level `.prettierignore` files were added. |
| Security/compliance checks | TBD | Not run | TBD |

## Manual checks

- General discovery works without unnecessary personalization consent.
- Consent is clear, separate, versioned, and timestamped.
- Declined data is not used for personalization.
- Protected APIs reject unauthorized access.
- Data-subject requests follow the documented process.
- Logs do not expose secrets or unnecessary personal data.

## Sign-off

- CodeTest Agent: Pending
- Date: TBD

## Issue #27 — Shared API foundation

### Scope

- Verification date/time: 2026-09-29 00:02 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js and pnpm versions locked by the repository
- Route under test: `GET /health`
- Database: not used; database health checks are outside issue #27

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api test` | 0 | Pass: 4 test files, 24 tests passed. Supertest drives the HTTP integration cases without custom server lifecycle helpers. Covers environment parsing and startup failure, CORS allowlisting, health response, request-ID validation and boundaries, response helpers, error envelopes, and recursive log sanitization. |
| `pnpm --filter api typecheck` | 0 | Pass. |
| `pnpm --filter api lint` | 0 | Pass. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 4 files/24 tests; web: 1 file/1 test. API OpenAPI generation and web production build completed. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Design-prototype gap outside issue #27: 19 passed and 5 failed. Failures require missing Profile/Admin wireframe navigation and admin CRUD/pagination prototype states. No test or prototype file was changed for this API-foundation issue. |

### Security and privacy checks

- HTTP request logs retain request ID, method, and path while omitting query strings, request bodies, cookies, and authorization headers.
- Logger redaction tests cover password, token, email, raw GPS, and nested email/token fields.
- Unknown errors return `INTERNAL_ERROR` without exposing the thrown message or stack trace.
- `CORS_ALLOWED_ORIGINS` rejects wildcard, empty, path-bearing, and malformed origins; configured origins are normalized and deduplicated.
- Generated `dist/` output remains ignored and no `dist/` file is tracked.

### Known unrelated verification gap

The five wireframe failures are in unmodified prototype areas and do not overlap the files or acceptance criteria for issue #27. They remain visible here instead of being hidden or addressed by changing tests outside this issue's scope.

## Issue #28 — Prisma schema and first migration

### Scope

- Verification date/time: 2026-09-29 00:27 ICT (`UTC+07:00`)
- Environment: local macOS workspace, PostgreSQL 17.11 installed through Homebrew, Prisma 6.19.3
- Databases: isolated local databases `kinraidee_issue28_20260929` and `kinraidee_issue28_verify_20260929`
- Cleanup: both temporary databases were removed and the local PostgreSQL server was stopped after verification
- Seed data: none

### Results

| Command | Exit code | Result |
|---|---:|---|
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 pnpm --filter api prisma validate` | 0 | Pass: Prisma schema is valid. |
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 pnpm --filter api prisma generate` | 0 | Pass: Prisma Client 6.19.3 generated successfully. |
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_20260929 pnpm --filter api prisma migrate dev --name init` | 0 | Pass: created and applied migration `20260928172507_init`. |
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 pnpm --filter api prisma migrate deploy` | 0 | Pass: the committed migration applied to a separate empty database. |
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 pnpm --filter api prisma migrate status` | 0 | Pass: database schema is up to date. |
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 pnpm --filter api prisma migrate diff --from-url postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 --to-schema-datamodel prisma/schema.prisma --exit-code` | 0 | Pass: no difference detected between the migrated database and Prisma schema. |
| `pnpm --filter api typecheck` | 0 | Pass after Prisma Client generation. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 4 files/24 tests; web: 1 file/1 test. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #28: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Schema checks

- The migration creates all four approved enums and all eleven approved models.
- Only `Restaurant` and `MenuItem` contain `deletedAt`.
- `Restaurant` physical deletion cascades to `MenuItem`; normal application deletion remains soft deletion through `deletedAt`.
- User deletion cascades favorites, preferences, and recommendation history while setting `AuditLog.actorId` to `null`.
- Preference references use `SetNull`; protected catalog references use the approved `Restrict` rules.
- PostgreSQL metadata inspection confirmed eleven application tables, all four enum definitions, and the expected Cascade/Restrict/SetNull foreign-key actions.
- Forbidden session models and unapproved lifecycle/password/budget fields are absent.
- `AuditLog.before` and `AuditLog.after` use nullable PostgreSQL `JSONB`; no password, JWT, cookie, IP, or user-agent columns were added.

## Issue #29 — Initial administrator seed

### Scope

- Verification date/time: 2026-09-29 02:50 ICT (`UTC+07:00`)
- Environment: local macOS workspace, PostgreSQL 17.11, Prisma 6.19.3, pnpm 12.4.2
- Database: isolated local database `kinraidee_issue29_20260929`
- Cleanup: the temporary database was removed and the local PostgreSQL server was stopped after verification
- Seed data: one test-only administrator; no catalog or regular-user fixture data

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run prisma/seed.test.ts` | 0 | Pass: 1 file/6 tests covering seed validation, normalization, Argon2id hashing, ADMIN assignment, idempotent upsert key, and safe output. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma migrate deploy` | 0 | Pass: committed initial migration applied to an empty isolated database. |
| `DATABASE_URL=<test-db> SEED_ADMIN_EMAIL=<test-email> SEED_ADMIN_PASSWORD=<test-password> pnpm --filter api prisma db seed` run twice | 0 | Pass: both runs completed and emitted only `Seeded 1 administrator account.` |
| Database inspection after repeated seed | 0 | Pass: one normalized user remained with role `ADMIN`; stored value used the Argon2id format and `argon2.verify` succeeded with the trimmed password. Zone, FoodType, Taste, Restaurant, and MenuItem counts remained zero. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma db seed` without seed credentials | 1 | Expected failure: output identified `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` without printing credential values. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma validate` | 0 | Pass: schema valid using `prisma.config.ts`. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma generate` | 0 | Pass: Prisma Client 6.19.3 generated successfully. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma migrate status` | 0 | Pass: database schema up to date. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 5 files/30 tests; web: 1 file/1 test. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #29: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Security and scope checks

- The committed environment example contains empty placeholders only; no administrator credential is committed.
- Password input is trimmed, validated at a minimum of 8 characters, and stored only as an Argon2id hash using the approved environment-backed costs.
- Seed errors and success output omit email, plaintext password, and password hash values.
- Repeated seed execution updates the configured administrator password hash and enforces role `ADMIN` without creating another account.
- No public administrator-creation endpoint, password reset/change flow, regular user, or catalog record was added.

## Issue #31 — Email/password authentication

### Scope

- Verification date/time: 2026-09-29 14:02 ICT (`UTC+07:00`)
- Environment: local macOS workspace, PostgreSQL 17.11, Prisma 6.19.3, pnpm 12.4.2
- Database: isolated local database `kinraidee_issue31_20260929`
- Cleanup: the temporary database was removed and the local PostgreSQL server was stopped after verification
- Routes: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/me`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run src/modules/auth src/lib/authSecurity.test.ts` | 0 | Pass: 6 files/26 tests covering credential validation, Argon2id, JWT claims/expiry/algorithm allowlist, cookie flags, service behavior, HTTP routes, and OpenAPI registration. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma migrate deploy` | 0 | Pass: the committed migration applied to an empty isolated database. |
| `NODE_ENV=test DATABASE_URL=<test-db> JWT_SECRET=<test-secret> CORS_ALLOWED_ORIGINS=http://localhost:5173 pnpm --filter api exec tsx .tmp-issue31-integration.mts` | 0 | Pass: temporary verification script exercised the real Prisma repository and HTTP app. Registration normalized credentials, created one `USER`, stored only an Argon2id hash, omitted password data, and set the approved cookie. Duplicate registration returned 409; unknown-email and wrong-password login returned the same generic 401; login, `/me`, invalid-cookie rejection, and logout passed. The temporary script was removed after the run. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 11 files/56 tests; web: 1 file/1 test. API OpenAPI generation and web production build completed. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #31: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Security and scope checks

- Passwords are trimmed and require at least 8 characters consistently in seed, registration, and login validation; no composition rule was added.
- Registration always creates `USER`; strict request validation rejects supplied role fields.
- Passwords use the approved environment-backed Argon2id parameters and never appear in API responses.
- JWTs use `HS256` with an explicit verification allowlist and contain `sub`, `role`, `iat`, and `exp` claims with a 7-day lifetime.
- The `kinraidee_auth` cookie is `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` in production. Logout clears the same cookie scope.
- Missing, invalid, and expired authentication tokens return the same generic 401 response. Login does not expose whether an email exists and performs a dummy Argon2id verification for unknown emails to reduce timing differences.
- Generated OpenAPI contains all four auth routes, the cookie security scheme, strict credentials, and the 8-character password minimum.
- No session table, refresh token, password reset/change, email verification, OAuth, admin-management flow, or authentication UI was added.

## Issue #40 — Development-only internal image uploads

### Scope

- Verification date/time: 2026-09-29 22:01 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js and pnpm versions locked by the repository
- Routes: `POST /api/uploads/images`, `DELETE /api/uploads/images/:fileName`, and `GET /uploads/:fileName`
- Storage: isolated temporary directories in tests; no uploaded file was committed

### Results

| Command | Exit code | Result |
|---|---:|---|
| `cd src/api && node_modules/.bin/vitest run src/config/env.test.ts src/lib/logger.test.ts src/modules/uploads` | 0 | Pass: 6 files/35 tests covering configuration, startup rejection, log sanitization, DTOs, filesystem storage, MIME detection, route authorization, multipart limits and boundaries, deletion, static serving, and OpenAPI. |
| `src/api/node_modules/.bin/tsc -p src/api/tsconfig.json --noEmit --pretty false` | 0 | Pass. |
| `node_modules/.bin/eslint src/api` | 0 | Pass. |
| `pnpm --filter api openapi:generate` | 0 | Pass: generated OpenAPI contains upload, delete, and static image routes with the multipart binary schema. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 15 files/79 tests; web: 1 file/1 test. API OpenAPI generation and web production build completed. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #40: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Security and scope checks

- Upload and delete require authenticated `ADMIN` access before multipart parsing or filesystem work.
- Multer is route-scoped, uses memory storage, accepts exactly one `image` field, and enforces the configured byte limit before service processing.
- JPEG, PNG, and WebP are accepted only when `file-type` detects matching magic bytes; SVG, arbitrary content, empty files, and spoofed MIME declarations are rejected.
- Stored names use `crypto.randomUUID()` plus the detected extension. Original filenames and client path data are never used for storage.
- Delete and static routes accept only generated UUID image names. Traversal, encoded traversal, unknown formats, and manually named files are rejected.
- Local upload startup is rejected in production, upload/delete return `503 UPLOAD_STORAGE_UNAVAILABLE` when disabled, and production does not register static serving.
- Logger sanitization removes filename, file-buffer, and image-content fields recursively. No image-processing or durable-storage dependency was added.

## Issue #39 — Restaurant CRUD endpoints

### Scope

- Verification date/time: 2026-09-29 23:28 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Database: isolated local database `kinraidee_issue39_20260929`
- Cleanup: the temporary database was removed and the local PostgreSQL service was stopped after verification
- Routes: `GET /api/restaurants`, `GET /api/restaurants/:id`, `POST /api/restaurants`, `PATCH /api/restaurants/:id`, `DELETE /api/restaurants/:id`, and `POST /api/restaurants/:id/restore`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `cd src/api && node_modules/.bin/vitest run src/modules/restaurants` | 0 | Pass: 5 files/52 tests covering DTO validation, HTTP(S)-only image URLs, service behavior, repository transactions and concurrent idempotency claims, ADMIN authorization, HTTP responses, and OpenAPI registration. |
| `NODE_ENV=test DATABASE_URL=<test-db> JWT_SECRET=<test-secret> CORS_ALLOWED_ORIGINS=http://localhost:5173 node_modules/.bin/tsx .tmp-issue39-integration.mts` | 0 | Pass: temporary script exercised the real app and Prisma repository. Verified unknown-Zone rejection, duplicate names, search/Zone filtering/pagination, phone trimming, external-image replacement, transactional Restaurant/MenuItem soft deletion, idempotent delete/restore, minimized audit snapshots, and restore without child restoration. The script was removed after the run. |
| `NODE_OPTIONS=--localstorage-file=/tmp/kinraidee-vitest-localstorage pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 34 files/274 tests; web: 6 files/55 tests. API OpenAPI generation and web production build completed. |
| `pnpm verify` without `NODE_OPTIONS` on Node.js 26.4.0 | 1 | Environment-only failure: all 55 web tests failed during cleanup because Node exposed `localStorage` as unavailable without `--localstorage-file`. API tests still passed 34 files/271 tests. The same command passed after supplying the Node storage file above. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting after formatting the five reported Restaurant files. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #39: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Security and scope checks

- Every route requires authenticated `ADMIN` access; anonymous and `USER` requests are rejected before repository mutation.
- API inputs are strict and boundary-validated. Localized names require Thai and English values, phone input is trimmed, external images require HTTP(S) URLs, non-web schemes are rejected, and referenced Zones must exist.
- Mutations and their audit records share one Prisma transaction. Delete uses one timestamp for the Restaurant and currently active child MenuItems; already deleted children retain their original timestamp.
- Repeated and concurrent delete/restore operations use conditional database claims so only the request that changes state updates timestamps or creates an audit record. Restore affects only the Restaurant and never restores child MenuItems.
- Audit snapshots omit phone contact data. Delete audit metadata records only the number of MenuItems newly soft-deleted.
- Manual external `imageUrl` updates clear `imageKey`, preventing an external URL from retaining ownership metadata for a prior internal upload.
- Duplicate Restaurant names remain allowed. Physical deletion, image upload/deletion, MenuItem CRUD, public Restaurant access, and admin UI remain outside issue #39.

## Issue #32 — Authentication pages and protected route guards

### Scope

- Verification date: 2026-09-29 (ICT, `UTC+07:00`)
- Environment: local Windows 11 workspace, Node.js 24.12.0, pnpm 12.4.2 through Corepack, PostgreSQL 17 through the committed Docker Compose service
- Database: isolated local database `kinraidee_verify` with the committed migration and the #29 administrator seed; removed after verification
- Pages: `/login`, `/register`, `/account`, `/admin`; guarded `/account/*` and `/admin/*`; header navigation
- Test tooling: `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, and `jsdom` (approved deviation recorded in `docs/plan.md`)

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web openapi:generate` | 0 | Pass: `src/web/src/api/openapiTypes.ts` generated from `docs/03-implementation/openapi.json`; all four auth paths are typed. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 15 files/79 tests (re-run after rebasing onto issue #40); web: 6 files/55 tests. API OpenAPI generation and web production build completed. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. `--end-of-line auto` was needed only because this Windows checkout uses `core.autocrlf=true`; committed files keep LF endings. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #32: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

Web test coverage (55 tests): safe `returnTo` accepts internal paths and rejects absolute, `javascript:`, protocol-relative, backslash, control-character, and auth-page targets; form schemas trim and mirror the API's 8-character password rule; header shows `เข้าสู่ระบบ`, `บัญชีของฉัน`, or `จัดการระบบ` by role; anonymous `/account/*` and `/admin/*` redirect to `/login?returnTo=…`; `USER` on `/admin/*` lands on `/account` with `บัญชีนี้ไม่มีสิทธิ์จัดการระบบ`; `ADMIN` opens admin routes; authenticated visitors to `/login` go to `/admin` or `/account`; login/register submit through the typed client with `credentials: 'include'`; registration sends no `confirmPassword` or role; duplicate email focuses the email field; invalid credentials show one generic message; logout clears the current user and returns Home; empty submit focuses the first invalid field with `aria-describedby`; the login form works by keyboard; passwords and tokens never reach browser storage; recommendation `sessionStorage` survives the login/register round trip and logout. Two deliberate breakages (removing the admin role check, removing the `//` check) were tried: the first failed the suite; the second was still blocked by the same-origin check, confirming the second safeguard.

### Manual browser checks

Run against the real API and database at 375px and desktop widths:

- Anonymous Home header shows `เข้าสู่ระบบ` linking to `/login?returnTo=%2F`; anonymous `/admin/zones` lands on `/login?returnTo=%2Fadmin%2Fzones`.
- Empty registration shows an error under every field, focuses email, and shows the design-system focus ring.
- Registering a new account creates a `USER` and lands on `/account`; `document.cookie` is empty (the auth cookie is `HttpOnly`) and local/session storage stay empty.
- The new `USER` visiting `/admin` lands on `/account` with the approved message.
- Logout returns Home, the header switches to `เข้าสู่ระบบ`, and `GET /api/auth/me` returns 401.
- Re-registering the same email with different capitalisation shows the duplicate-email field error with focus on email.
- Seeded `ADMIN` login with a wrong password shows the generic focused alert; the correct password honors `returnTo=/admin/zones` and falls back to `/admin` until that page exists. An authenticated `ADMIN` opening `/login` is redirected to `/admin`.

### Security, privacy, and scope checks

- No JWT is read, stored, or handled in JavaScript; the query cache holds only `id`, `email`, and `role`.
- Route guards are UX only; protected API routes still enforce roles server-side.
- `returnTo` accepts only same-origin internal paths and falls back by role.
- The registration page states the approved account-email purpose from the specification's data inventory (LR1): optional account features only, not used for advertising or unrelated disclosure, and anonymous recommendations need no account.
- No auth modal, `/admin/login`, role selector, email-verification wording, password reset/change, profile fields, or user-management links were added.
- Known limitation: the design-system fonts (Nunito, Delius Swash Caps) are declared as Tailwind font tokens but not loaded, so browsers use the declared fallbacks. Loading them from Google Fonts would send visitor IP addresses to a third party and needs a separate decision.

## Issue #33 — Zone CRUD endpoints

### Scope

- Verification date: 2026-09-29 (ICT, `UTC+07:00`)
- Environment: local Windows 11 workspace, Node.js 24.12.0, pnpm 12.4.2, PostgreSQL 17 through the committed Docker Compose service
- Database: isolated local database `kinraidee_verify` with the committed migration and #29 administrator seed; removed after verification
- Routes: `GET /api/zones` (public), `POST /api/zones`, `PATCH /api/zones/:id`, `DELETE /api/zones/:id` (`ADMIN`)
- Shared additions reused by later catalog modules: `shared/validation.ts` (field-level `VALIDATION_ERROR`), `shared/localization.ts`, `shared/errorEnvelope.ts` (now also used by auth OpenAPI), `shared/auditContext.ts`, `shared/recordChanges.ts`, `lib/prismaErrors.ts`, and `modules/audit-logs/audit-logs.repository.ts` (transactional audit writer). Mutations reuse the `requireAdmin` middleware added by issue #40

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api test` | 0 | Pass: 19 files/126 tests (47 new; re-run after rebasing onto issue #40). Covers DTO trimming, empty/missing localized names, description optional/null/partial, `sortOrder` int32 boundaries, non-integer and string rejection, unknown-field rejection, empty update, empty id; service ordering passthrough, timestamp-free public list, duplicate Thai/English/unknown-column mapping to 409, unknown id 404, unchanged update skipping the write, concurrent delete/update races (P2003 → `ZONE_IN_USE`, P2025 → `ZONE_NOT_FOUND`), blocked delete never calling the repository, unexpected errors rethrown; HTTP routes for public list, anonymous 401 and `USER` 403 on every mutation without reaching the service, `ADMIN` create/update/delete with audit context, field-level 400, and error envelopes; OpenAPI paths, security, and components. |
| `NODE_ENV=test DATABASE_URL=<verify-db> … pnpm exec tsx .tmp-issue33-integration.mts` | 0 | Pass: temporary script drove the real app and Prisma repository. Verified ordering by `sortOrder` then Thai name; `CREATE`/`UPDATE`/`DELETE` audit rows with actor ID, the response `x-request-id`, and before/after snapshots equal to the API responses; duplicate Thai and English names return 409 with the offending field and no audit row; an unchanged update writes no audit row; unknown id returns 404; deleting a zone referenced by a restaurant returns 409 `ZONE_IN_USE` and leaves the zone and audit log unchanged; a successful delete returns 204, sets `UserPreference.zoneId` to `null`, and repeats as 404; anonymous 401 and `USER` 403 on every mutation write no audit row. The script was removed after the run. |
| Deliberate regression checks | — | Removing the admin guard from `POST /api/zones` and removing the in-use check each failed the suite (3 failures), then both were restored. |
| `pnpm verify` | 0 | Pass: API 19 files/126 tests; web 6 files/55 tests; OpenAPI generation and web build completed. Generated OpenAPI adds `/api/zones` and `/api/zones/{id}`; the auth section is unchanged after moving to the shared error-envelope schema. |
| `pnpm --filter web openapi:generate` | 0 | Pass: web types regenerated from the updated contract. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #33: 19 passed and 5 failed. |

### Security and scope checks

- Authorization is server-side: `requireAuth` then `requireAdmin` on every mutation; the audit context also refuses a request without an authenticated user.
- One resource path `/api/zones`; no `/api/admin/zones`.
- Zone stays a hard-delete model without `isActive`, `retiredAt`, or `deletedAt`; restaurants are never reassigned automatically; `ที่ไหนก็ได้` is not stored.
- The mutation and its audit row commit in one transaction; failed mutations and reads write no audit row. Zone snapshots contain no personal data.
- Duplicate-name errors use code `ZONE_NAME_ALREADY_EXISTS` (the issue fixes only the 409 status).

## Issue #35 — FoodType CRUD endpoints

### Scope

- Verification date: 2026-09-29 (ICT, `UTC+07:00`)
- Environment and database: same as issue #33 (`kinraidee_verify`, removed after verification)
- Routes: `GET /api/food-types` (public), `POST /api/food-types`, `PATCH /api/food-types/:id`, `DELETE /api/food-types/:id` (`ADMIN`)
- Shared additions: `shared/iconKey.ts` (icon-key rule shared with #37; decision recorded in `docs/plan.md`) and `shared/duplicateNameError.ts` (now also used by zones, with identical output)

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api test` | 0 | Pass: 25 files/183 tests (57 new; re-run after rebasing onto issue #40). Covers the icon-key rule (valid keys, trimming, 50-character boundary, empty/whitespace/null to `null`, and rejection of SVG, HTML, URL, data URI, JSON, uppercase, underscore, and malformed keys); duplicate-name field mapping; food-type DTO trimming, empty/missing names, icon validation, `sortOrder` boundaries, unknown fields (including `description`), empty update, and empty id; service ordering, timestamp-free public list, duplicate 409, unknown 404, unchanged update skipping the write, clearing the icon, blocked and raced deletes, and audit context; HTTP routes for public list, anonymous 401 and `USER` 403 without reaching the service, `ADMIN` create/update/delete, blank icon stored as `null`, and SVG icon 400; OpenAPI paths and security. |
| `NODE_ENV=test DATABASE_URL=<verify-db> … pnpm exec tsx .tmp-issue35-integration.mts` | 0 | Pass: temporary script drove the real app and Prisma repository. Verified ordering by `sortOrder` then Thai name; a whitespace icon stored as SQL `NULL`; `CREATE`/`UPDATE`/`DELETE` audit snapshots equal to the API responses; SVG icon 400 and duplicate Thai name 409 with no audit row; clearing the icon with `""`; deleting a food type referenced by a menu item returns 409 `FOOD_TYPE_IN_USE` and changes nothing; a successful delete returns 204 and sets `UserPreference.foodTypeId` to `null`; anonymous 401 and `USER` 403 on every mutation. The script was removed after the run. |
| Deliberate regression checks | — | Removing the admin guard from `PATCH /api/food-types/:id` and removing the in-use check each failed the suite (3 failures), then both were restored. |
| `pnpm verify` | 0 | Pass: API 25 files/183 tests; web 6 files/55 tests; OpenAPI generation and web build completed with `/api/food-types` and `/api/food-types/{id}`. |
| `pnpm --filter web openapi:generate` | 0 | Pass. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #35: 19 passed and 5 failed. |

### Security and scope checks

- Mutations require `ADMIN` server-side; one resource path `/api/food-types`.
- FoodType stays a hard-delete model without `description`, `isActive`, `retiredAt`, or `deletedAt`; menu items are never reassigned automatically; `อะไรก็ได้` is not stored.
- `icon` stores only a validated key; no icon assets or components were added to the API.
- Duplicate-name errors use code `FOOD_TYPE_NAME_ALREADY_EXISTS`.

## Issue #37 — Taste CRUD endpoints

### Scope

- Verification date: 2026-09-29 (ICT, `UTC+07:00`)
- Environment and database: same as issue #33 (`kinraidee_verify`, removed after verification)
- Routes: `GET /api/tastes` (public), `POST /api/tastes`, `PATCH /api/tastes/:id`, `DELETE /api/tastes/:id` (`ADMIN`)
- Icon rule: shared with #35; an empty icon key normalizes to `null` instead of being rejected (approved deviation recorded in `docs/plan.md`)

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api test` | 0 | Pass: 29 files/222 tests (39 new; re-run after rebasing onto issue #40). Covers taste DTO trimming, empty/missing names, SVG/HTML/URL icon rejection, empty icon to `null`, `sortOrder` boundaries, unknown fields, empty update, and empty id; service ordering, timestamp-free public list, duplicate 409, unknown 404, unchanged update skipping the write, clearing the icon, delete blocked by `MenuItemTaste` links, raced delete (P2003 → `TASTE_IN_USE`), and audit context; HTTP routes for public list, anonymous 401 and `USER` 403 without reaching the service, and `ADMIN` create/update/delete; OpenAPI paths and security. |
| `NODE_ENV=test DATABASE_URL=<verify-db> … pnpm exec tsx .tmp-issue37-integration.mts` | 0 | Pass: temporary script drove the real app and Prisma repository. Verified ordering by `sortOrder` then Thai name; empty icon stored as SQL `NULL`; `CREATE`/`UPDATE`/`DELETE` audit snapshots equal to the API responses; SVG, HTML, and URL icons return 400 on `icon`; duplicate English name 409 with no audit row; deleting a taste linked through `MenuItemTaste` returns 409 `TASTE_IN_USE` with the approved message and leaves the taste, both links, and the audit log unchanged; a successful delete returns 204 and sets `UserPreference.tasteId` to `null`; anonymous 401 and `USER` 403 on every mutation; `/api/zones`, `/api/food-types`, and `/api/tastes` all respond through `createApp()`. The script was removed after the run. |
| Deliberate regression checks | — | Removing the admin guard from `DELETE /api/tastes/:id` and removing the in-use check each failed the suite (3 failures), then both were restored. |
| `pnpm verify` | 0 | Pass: API 29 files/222 tests; web 6 files/55 tests; OpenAPI generation and web build completed with `/api/tastes` and `/api/tastes/{id}`. |
| `pnpm --filter web openapi:generate` | 0 | Pass. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #37: 19 passed and 5 failed. |

### Security and scope checks

- Mutations require `ADMIN` server-side; one resource path `/api/tastes`.
- Taste stays a hard-delete model; `MenuItemTaste` links are never removed automatically; `อะไรก็ได้` is not stored.
- The API stores only validated icon keys and has no knowledge of React or Phosphor components.
- Duplicate-name errors use code `TASTE_NAME_ALREADY_EXISTS`.

## Issue #34 — Zone management screen

### Scope

- Verification date: 2026-09-30 (ICT, `UTC+07:00`)
- Environment: local Windows 11 workspace, Node.js 24.12.0, pnpm 12.4.2, PostgreSQL 17 through the committed Docker Compose service
- Database: isolated local database `kinraidee_verify` with the committed migrations and the #29 administrator seed; removed after verification
- Route: `/admin/zones` under the `/admin/*` guard from #32, using `GET`, `POST`, `PATCH`, and `DELETE` on `/api/zones` through the typed client
- Shared additions reused by #36 and #38: `components/Dialog.tsx` (modal focus rules), `lib/duplicateNameFields.ts`, a `wide` width for `PageShell`, a `ref` prop on `Button`, and `@phosphor-icons/react` (decisions recorded in `docs/plan.md`)

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 8 files/85 tests (30 new). Schema tests cover trimming, the flat-to-API body transform, required Thai/English names, empty/decimal/text/out-of-range `sortOrder`, negative and int32 boundary values, the all-or-nothing description pair, form pre-fill, and changed-field detection (including clearing a description to `null`). Page tests cover the ADMIN list with every field, the `ที่ไหนก็ได้` note absent from the table, the empty state, load error with retry, no GPS/coordinate fields, create validation with focus on the first invalid field and `aria-describedby` errors, create through the typed client with list refresh, duplicate-name field errors with focus, a generic save alert, edit pre-fill sending only the changed fields, unchanged edit sending no request, delete confirmation before the request, cancel returning focus to the row action, `ZONE_IN_USE` showing the approved message, and dialog focus, Tab trapping, inert background, and Escape. Anonymous and `USER` access reuse the existing #32 guard tests for `/admin/zones`. |
| Deliberate regression checks | — | Removing list invalidation after mutations failed 3 tests, and removing the Shift+Tab wrap in the dialog failed the keyboard test. Both were restored. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 34 files/274 tests; web 8 files/85 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #34: 19 passed and 5 failed. |

### Manual browser checks

Run against the real API and database at desktop and 375px widths:

- Anonymous `/admin/zones` redirects to login with `returnTo`; the seeded `ADMIN` returns to `/admin/zones` after login and sees the empty state and the `ที่ไหนก็ได้` note.
- Pressing Enter on an empty create form shows errors under both names and `sortOrder` and focuses the Thai name.
- Creating a zone with both descriptions adds the row to the table.
- Creating a second zone with the same Thai name shows the duplicate-name error from the real API's 409 on the Thai name field.
- Escape closes the dialog, returns focus to `เพิ่มโซน`, and removes `inert` from the page.
- Clearing only one description shows the pair error. Clearing both saves `description: null`, and the table shows `ไม่มี`.
- Deleting a zone used by a restaurant shows the approved `ZONE_IN_USE` message inside the dialog and keeps the row.
- Deleting an unused zone at 375px removes the row, announces the result, and moves focus to `เพิ่มโซน`.
- At 375px the page does not scroll horizontally; only the table scrolls inside its frame, and the dialog opens as a bottom sheet.

### Security and scope checks

- The guard is UX only; every mutation is still authorized by the API's `requireAdmin`.
- Endpoint strings exist only in `hooks/admin/zones/useZones.ts`; components never call the API client.
- No bulk reorder, `ที่ไหนก็ได้` record, GPS/coordinate field, restaurant reassignment UI, or API change was added. Zone data contains no personal data.

## Issue #36 — FoodType management screen

### Scope

- Verification date: 2026-09-30 (ICT, `UTC+07:00`)
- Environment and database: same as issue #34 (`kinraidee_verify`, removed after verification). A test menu item was inserted directly in that database to check `FOOD_TYPE_IN_USE`, because MenuItem CRUD (#42) does not exist yet
- Route: `/admin/food-types` under the `/admin/*` guard from #32, using `GET`, `POST`, `PATCH`, and `DELETE` on `/api/food-types` through the typed client
- Icons: `src/web/src/lib/foodTypeIcons.tsx` registry on the shared `lib/iconRegistry.ts` (key mapping recorded in `docs/plan.md`)
- Shared refactor: the zones page now uses the extracted shared components, schema fields, and test helpers; its behavior and tests are unchanged

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 12 files/122 tests (37 new). Schema tests cover trimming, the empty icon choice becoming `null`, rejection of keys outside the registry (including SVG markup), the shared name and `sortOrder` rules, pre-fill of known, null, and unknown icon keys, and changed-field detection that leaves an untouched unknown key alone. Icon tests check the exact registry keys, the Phosphor component for each key, and the `ForkKnife` fallback for null, unknown, prototype-property, and SVG keys. A source scan finds no handwritten `<svg>`, `<path>`, `<symbol>`, or `<use>` markup and no namespace import from Phosphor in application code. Page tests cover the ADMIN list with icon labels, the fallback icon and label for null and unknown keys, the `อะไรก็ได้` note absent from the table, the empty state, no description field, a select offering only the registry keys with text labels and the helper connected by `aria-describedby`, create validation and focus, creating without an icon as `null` and with a chosen key, duplicate-name errors, edit pre-fill sending only the changed icon, an unknown key kept on edit, delete confirmation with list refresh and focus fallback, `FOOD_TYPE_IN_USE` with the approved message, and Tab/Escape behavior. |
| Deliberate regression checks | — | Replacing the registry's own-key check with `in`, and comparing the edited icon with the raw stored key, failed 3 tests; both were restored. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 34 files/274 tests; web 12 files/122 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |

### Manual browser checks

Run against the real API and database at desktop and 375px widths:

- Keyboard-only create: Tab reaches the icon select, ArrowDown changes it, and the preview icon beside the select updates. Saving shows `เส้น` with the steaming-bowl icon in the table.
- Creating without an icon stores `icon: null` (confirmed through `GET /api/food-types`), and the table shows `ไอคอนเริ่มต้น` with the fork-and-knife icon.
- Deleting a food type used by a menu item shows the approved `FOOD_TYPE_IN_USE` message inside the dialog and moves focus to it.
- A key set directly in the database outside the registry (`dumpling`) shows as `ไอคอนเริ่มต้น (ไม่รู้จัก dumpling)`. Editing only `sortOrder` saves `sortOrder: 5`, and the stored `icon` stays `dumpling`.
- Deleting an unused food type removes the row, announces the result, and moves focus to `เพิ่มประเภทอาหาร`.
- At 375px the page does not scroll horizontally.
- After the shared refactor, `/admin/zones` still loads and lists zones.

### Security and scope checks

- Database icon values resolve only through the fixed registry map, and unknown values fall back. No component is imported dynamically from a stored string.
- Endpoint strings exist only in `hooks/admin/food-types/useFoodTypes.ts`. There is no description field, bulk reorder, `อะไรก็ได้` record, MenuItem reassignment UI, icon asset picker, or API change.

## Issue #38 — Taste management screen

### Scope

- Verification date: 2026-09-30 (ICT, `UTC+07:00`)
- Environment and database: same as issue #34 (`kinraidee_verify`, removed after verification). A `MenuItemTaste` link to the test menu item was inserted directly in that database to check `TASTE_IN_USE`, because MenuItem CRUD (#42) does not exist yet
- Route: `/admin/tastes` under the `/admin/*` guard from #32, using `GET`, `POST`, `PATCH`, and `DELETE` on `/api/tastes` through the typed client
- Icons: `src/web/src/lib/tasteIcons.tsx` registry (key mapping recorded in `docs/plan.md`)
- Shared refactor: FoodType and Taste now use the shared icon master-data form, table, and schema; the FoodType tests pass unchanged

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 15 files/149 tests (27 new). Taste icon tests check the exact registry keys, the Phosphor component for each key, and the `ForkKnife` fallback for null, a food-type key, a prototype property, and SVG markup. Schema tests cover the body transform, the empty icon choice becoming `null`, rejection of keys from another registry, changed-field detection, and an untouched unknown key. Page tests cover the ADMIN list with icon labels, the fallback icon and label for null and unknown keys, the `อะไรก็ได้` note absent from the table, the empty state, no description field, only the taste registry keys offered with the helper connected by `aria-describedby`, create validation and focus, create with a chosen icon and with `null`, list refresh, duplicate-name errors on both names when the API names no field, edit pre-fill sending only the changed icon, delete confirmation with list refresh, `TASTE_IN_USE` with the approved message, and Tab/Escape behavior. The #32 guard tests cover anonymous and `USER` access to `/admin/*`, and the icon-policy scan now includes `tasteIcons.tsx`. |
| Deliberate regression checks | — | Mapping `TASTE_IN_USE` to the wrong code and giving `bowl` the wrong icon each failed a test (2 failures), then both were restored. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 34 files/274 tests; web 15 files/149 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issues #34, #36, and #38: 19 passed and 5 failed. |

### Manual browser checks

Run against the real API and database at desktop and 375px widths:

- Keyboard-only create: ArrowDown on the icon select picks `flame`, and the table shows `เปลวไฟ` with the flame icon.
- A second taste with the same Thai name shows the duplicate-name error from the real API's 409, with focus on the Thai name.
- Deleting a taste linked to a menu item shows the approved `TASTE_IN_USE` message inside the dialog and moves focus to it.
- Changing the icon to `heart` by keyboard sends only the icon, and `GET /api/tastes` returns `icon: "heart"` with the other fields unchanged.
- Deleting an unlinked taste removes the row, announces the result, and moves focus to `เพิ่มรสชาติ`.
- At 375px neither `/admin/tastes` nor `/admin/food-types` scrolls horizontally, and the food-types page still lists its records after the shared refactor.

### Security and scope checks

- Stored icon values resolve only through the fixed registry map, and unknown values fall back.
- Endpoint strings exist only in `hooks/admin/tastes/useTastes.ts`. There is no description field, bulk reorder, `อะไรก็ได้` record, MenuItem taste-assignment UI, icon asset picker, or API change.

## Issue #42 — MenuItem admin CRUD and bulk actions

### Scope

- Verification date/time: 2026-09-30 17:32 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Database: isolated local database `kinraidee_issue42_20260930`; removed after verification and PostgreSQL stopped
- Routes: administrator list/detail/create/update/soft-delete/restore plus explicit-ID bulk delete/restore under `/api/menu-items`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run src/modules/menu-items` | 0 | Pass: 5 files/65 tests covering DTO boundaries, image key/URL pairing, taste deduplication, service relation rules, transactional Restaurant row locking for create/update, concurrent idempotency claims, authorization on all eight routes, bulk limits, and OpenAPI. |
| `NODE_ENV=test DATABASE_URL=<test-db> JWT_SECRET=<test-secret> CORS_ALLOWED_ORIGINS=http://localhost:5173 node_modules/.bin/tsx .tmp-issue42-integration.mts` | 0 | Pass: temporary script drove the real app and Prisma repository. Verified deleted-Restaurant rejection, create with deduplicated tastes, full taste replacement, filtered pagination, concurrent delete with one audit, repeated restore without duplicate audit, unknown bulk-ID rollback, bulk delete, deleted-Restaurant bulk-restore rejection, successful bulk restore, and one summary audit per bulk mutation. The script was removed after the run. |
| `NODE_OPTIONS=--localstorage-file=/tmp/kinraidee-vitest-localstorage pnpm verify` | 0 | Pass after merging current `main` and resolving review findings: workspace typecheck, lint, tests, and builds completed. API: 39 files/339 tests; web: 15 files/149 tests. OpenAPI generation and the web production build completed. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #42: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Security and scope checks

- All eight endpoints require authenticated `ADMIN` access; anonymous and `USER` requests are rejected before service execution.
- Default listing excludes deleted MenuItems and items under deleted Restaurants. `includeDeleted=true` intentionally includes both.
- Create/update validates an active Restaurant, existing FoodType and Tastes, positive integer price, localized fields, and matching generated local-upload key/URL pairs. External images accept HTTP(S) only and persist `imageKey = null`.
- MenuItem and taste-assignment writes share one transaction with the audit row. Taste updates replace the complete assignment; duplicate taste IDs are normalized before persistence.
- Single and bulk soft-delete/restore operations keep image references and `MenuItemTaste` rows. Conditional database claims prevent repeated or concurrent requests from changing timestamps or writing duplicate audit events.
- Bulk requests accept at most 50 explicit IDs, reject the whole request when any ID is unknown, and reject bulk restore when any owning Restaurant is deleted. One minimized IDs/count audit summary is written per changed bulk operation.
- MenuItem responses and audit snapshots exclude Restaurant phone and image binary data. No public MenuItem endpoint, UI, upload processing, R2 integration, recommendation behavior, price history, or availability model was added.

## Issue #49 — AuditLog review API, admin screen, and retention command

### Scope

- Verification date: 2026-10-01 (ICT, `UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Database: isolated local database `kinraidee_issue49_20260930` with the committed migration
- Route: ADMIN-only `GET /api/audit-logs` and `/admin/audit-logs`
- Retention command: `pnpm --filter api audit-logs:prune`

### Results

| Command                                                                           | Exit code | Result                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | --------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused AuditLog API and web tests                                                |         0 | Pass: 23 tests cover DTO boundaries, recursive unsafe-key redaction, repository filters/order/pagination, authorization, OpenAPI, exact 180-day threshold, idempotency, command logging/disconnect, admin guard, approved copy, empty/list states, filters, pagination, and keyboard-native expandable snapshots. |
| `NODE_OPTIONS=--localstorage-file=/tmp/kinraidee-vitest-localstorage pnpm verify` |         0 | Pass: typecheck, lint, tests, and builds completed. API: 46 files/358 tests; web: 16 files/153 tests. OpenAPI generation and the web production build completed.                                                                                                                                                  |
| `pnpm format`                                                                     |         0 | Pass: API and web files matched Prettier formatting.                                                                                                                                                                                                                                                              |
| `git diff --check`                                                                |         0 | Pass.                                                                                                                                                                                                                                                                                                             |
| `node tests/wireframe-requirements.test.cjs`                                      |         1 | Existing design-prototype gap outside issue #49: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified.                                                                                                                                                  |
| Real PostgreSQL prune verification                                                |         0 | Pass: a 181-day row was deleted; rows newer than the 180-day cutoff were retained; a second run logged `deletedCount: 0`. The repository uses strict `createdAt < threshold`, with the exact-threshold boundary covered by unit tests.                                                                            |

### Security and scope checks

- The endpoint requires authenticated `ADMIN` access. Anonymous and `USER` requests are rejected before the service reads AuditLog rows.
- The response selects no User relation or actor email. Recursive case-insensitive sanitization removes IP address and user-agent fields, and replaces values under `password`, `token`, `jwt`, `cookie`, `secret`, or `authorization` keys with `[REDACTED]` before snapshots leave the service.
- Reads do not create audit events. Results sort by `createdAt DESC`, then `id DESC`, and support every approved filter plus pagination metadata.
- The page is read-only, uses the typed OpenAPI client through a TanStack Query hook, and renders snapshots as native keyboard-operable `<details>` elements.
- The prune command deletes only rows strictly older than 180 days, logs only the deleted count as application data, is idempotent, and disconnects Prisma.

### Production deployment blocker

The repository provides the retention command but no production scheduler. Production deployment remains blocked until an approved deployment environment configures and verifies a recurring job that runs `pnpm --filter api audit-logs:prune`. The application audit log is not a Computer Crime Act traffic log and does not satisfy any future LR10 traffic-log duty.

## Issue #30 — Approved catalog starter-data seed

### Scope

- Verification date: 2026-10-05 (ICT, `UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Database: isolated local database `kinraidee_issue30_verify` with the committed migration; removed after verification
- Fixture: 3 zones, 4 food types, 6 tastes, 3 restaurants, 9 menu items, and 22 approved menu-taste links
- Source assets: 3 restaurant logos and 9 menu images supplied and approved by the project owner, organized under `assets/catalog/`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run prisma/seed.test.ts prisma/catalog-seed.test.ts` | 0 | Pass: 2 files/19 tests covering the existing administrator seed, full-fixture validation before database access, stable IDs, localized values, relation integrity, prices, sort orders, HTTP(S)-only URL validation, idempotency, exact taste-link synchronization, external image behavior, soft-delete preservation, safe summaries, and credential/PII scans. |
| First `pnpm --filter api prisma db seed` against the isolated database | 0 | Pass: logged one administrator and `47 created, 0 updated, 0 unchanged`; database inspection found 3 Zones, 4 FoodTypes, 6 Tastes, 3 Restaurants, 9 MenuItems, 22 MenuItemTaste rows, and 1 administrator. |
| Second identical `pnpm --filter api prisma db seed` | 0 | Pass: logged `0 created, 0 updated, 47 unchanged`; no duplicate rows were created. |
| Seed after adding one out-of-fixture Zone, one stale taste link, and a `deletedAt` value | 0 | Pass: removed exactly 1 stale link from a fixture-managed menu item, retained 22 approved links, preserved the out-of-fixture Zone, and left the existing Restaurant `deletedAt` non-null. |
| `NODE_OPTIONS=--no-experimental-webstorage pnpm verify` | 0 | Pass after resolving review findings: typecheck, lint, tests, and builds completed. API: 47 files/371 tests; web: 16 files/153 tests. OpenAPI generation and the web production build completed. Node 26's experimental global Web Storage was disabled so jsdom supplies the test storage implementation. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #30: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |
| Post-merge `NODE_OPTIONS=--no-experimental-webstorage pnpm verify` after pulling `main` at `df07b81` | 0 | Pass: typecheck, lint, tests, and builds completed with the merged Restaurant management and font changes. API: 48 files/392 tests; web: 19 files/204 tests. Prisma Client was regenerated after installing the merged lockfile. |
| Post-merge `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #30: 20 passed and 4 failed for the untranslated header expectation and missing Admin prototype states. No wireframe test was modified. |

### Safety and scope checks

- The complete localized fixture is parsed by Zod before Prisma is instantiated or the transaction begins. Invalid IDs, duplicate IDs, missing localized names, invalid relations, non-positive prices, invalid image URLs, and non-integer sort orders fail before database access.
- The administrator and catalog write in one Prisma transaction. Records are processed in dependency order and upserted by stable CUID-shaped IDs; identical records are skipped so their timestamps remain unchanged.
- Seed-managed Restaurant and MenuItem updates never set `deletedAt`. Catalog records absent from the fixture are not deleted. Only stale `MenuItemTaste` links belonging to fixture-managed menu items are removed to synchronize approved `tasteIds`.
- Every seeded `imageUrl` and `imageKey` is `null`. No network request, upload, R2 integration, image blob, plaintext credential, account email, GPS coordinate, or unnecessary personal data is included.
- Seed output contains aggregate record counts only. The fixture's one phone number is the explicitly approved public restaurant contact used by the catalog schema.

## Restaurant local images (API prerequisite for #41)

### Scope

- Verification date: 2026-10-05 (ICT, `UTC+07:00`)
- Environment: local Windows 11 workspace, Node.js 24.12.0, pnpm 12.4.2, PostgreSQL 17 through the committed Docker Compose service
- Database: isolated local database `kinraidee_verify` with the committed migrations and the #29 administrator seed; removed after verification. Uploads were written to a temporary directory and deleted afterwards
- Change: Restaurant create/update accept `imageKey` with its matching `/uploads/<key>` `imageUrl`, using the image rule shared with MenuItem (`modules/uploads/imageReference.ts`). Decision recorded in `docs/plan.md`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run src/modules/uploads src/modules/restaurants src/modules/menu-items` | 0 | Pass: 157 tests. New shared-rule tests cover empty, null, trimmed external, and local values; rejection of non-HTTP schemes, non-generated keys, a key without a URL, a key with a different or external URL, and a local URL without its key; and the create/update column mapping, including clearing the key for an external URL or `null`. Restaurant DTO tests now accept a local key with its matching URL and reject a keyless local URL, a mismatched URL, and a non-generated key. The MenuItem tests pass unchanged. |
| `pnpm --filter api exec vitest run src/modules/uploads` | 0 | Pass: 36 tests; the served-image test now also requires `Cross-Origin-Resource-Policy: cross-origin` on `/uploads/<key>`. |
| Deliberate regression checks | — | Removing the image rule from Restaurant create failed 2 tests, and removing the `/uploads` header override failed the served-image test; both were restored. |
| `node image-fix-check.mjs` (temporary script against the real app and database) | 0 | Pass, 8/8: upload returns its key and `/uploads` URL; create stores the key and URL; the stored URL is served; a mismatched key/URL and a keyless local URL return 400 on the right field; an external URL clears the key; `imageUrl: null` clears both columns; and the upload can then be deleted. The script was removed after the run. |
| `curl -D -` against the real app | 0 | Pass: `/uploads/<key>` returns `Cross-Origin-Resource-Policy: cross-origin`; `/api/zones` still returns `same-origin`. Before the fix, the #41 browser check showed the uploaded preview as broken because the browser blocked the image from the web origin. |
| `pnpm --filter api openapi:generate` and `pnpm --filter web openapi:generate` | 0 | Pass: `CreateRestaurantRequest`/`UpdateRestaurantRequest` gain `imageKey`; `imageUrl` is `string \| null` for both Restaurant and MenuItem (previously `string \| unknown`). |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 47 files/379 tests; web 16 files/153 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |

### Security and scope checks

- Only generated upload file names are accepted as keys, and a key must match its `/uploads/<key>` URL exactly, so a record cannot point at another upload or an arbitrary path.
- External images still require HTTP(S); `javascript:` and other schemes are rejected.
- Soft delete still keeps image references. The API does not delete files on update; #41 owns best-effort cleanup after a successful save.
- Production behavior is unchanged: uploads stay disabled there, and external URLs keep working.
- Only the `/uploads` static route relaxes `Cross-Origin-Resource-Policy`, so other pages can embed those public catalog images; it serves only generated file names and adds no CORS read access. All API responses keep helmet's `same-origin`.

## Issue #41 — Restaurant management screen

### Scope

- Verification date: 2026-10-05 (ICT, `UTC+07:00`)
- Environment and database: same as the Restaurant local-images fix (`kinraidee_verify` with development uploads enabled into a temporary directory; both removed after verification)
- Route: `/admin/restaurants` under the `/admin/*` guard from #32, using the typed client for list/create/update/delete/restore and for image upload/delete
- Depends on the API fix above (Restaurant `imageKey`/`/uploads` support and the `/uploads` resource policy); decisions recorded in `docs/plan.md`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 19 files/196 tests (43 new). Schema tests cover trimming, empty phone to `null`, required Zone and names, the description pair, each image mode's API body (none to nulls, URL with `imageKey: null`, upload as key and URL), URL validation (empty, non-URL, `javascript:`, `ftp:`), a required file in upload mode, pre-fill for each stored image source, changed-field detection with the image key and URL sent together, and list query building. File checks cover JPEG/PNG/WebP, rejected types, and the 2 MiB boundary. Page tests cover the list with zone, phone, image, and status; uploaded images resolved against the API origin; pagination from API metadata; search, Zone, and deleted filters in the query with reset to page 1; deleted rows with a text status, restore, and no edit; create validation with focus; external URL submit with `imageKey: null` and preview only after validation; a broken-image fallback; edit pre-fill sending only changes; no upload control in production; the `accept` list and client rejection of GIF and oversized files before any request; upload preview and the saved key/URL with no browser storage or `data:`/`blob:` values; a missing file focusing the file input; cleanup after a failed create; old-image deletion only after a successful update (request order checked); a failed update removing only the new upload and keeping the old preview; external images never sent to deletion; cleanup on cancel and on replacing an unsaved upload; the leave prompt with cleanup, and no prompt without unsaved changes; and delete/restore confirmations with the approved warnings and no image deletion on soft delete. |
| Deliberate regression checks | — | Deleting the old image before saving (2 failures), skipping cleanup after a failed save (2 failures), and showing the upload option in production (1 failure) were each caught, then restored. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 47 files/379 tests; web 19 files/196 tests), API build with OpenAPI generation, and web production build. Re-run after the review fixes below: web 19 files/202 tests. |
| Production bundle check | — | `src/web/dist` contains the external-URL option but not the local-upload control. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside #41: 19 passed and 5 failed. |

### Manual browser checks

Run against the real API and database at desktop and 375px widths. The browser pane cannot open the OS file picker, so a generated PNG was placed into the file input with a script; everything after that ran through the app.

- Login with `returnTo` lands on `/admin/restaurants`; the list shows zone, phone, image, status, and pagination.
- Upload mode uploads immediately and announces `อัปโหลดรูปแล้ว`. Before the API fix, the preview was blocked by `Cross-Origin-Resource-Policy: same-origin`; after it, the image loads. Saving stores the generated key and `/uploads/<key>` URL.
- Switching that restaurant to an external URL shows the broken-image fallback for an unreachable URL, saves `imageKey: null`, and deletes the replaced file from disk only after the update.
- Delete shows the menu warning. "Show deleted" lists the restaurant with `ลบแล้ว` and a restore button only, and restore shows the warning that menu items are not restored.
- With an unsaved upload, the browser Back button inside the app shows `ออกจากหน้านี้?`. Leaving deletes the upload. Two full-document unloads during testing left their uploads on disk, as documented in `docs/plan.md`.
- At 375px, the filters first overflowed their card; after the fix every control fits. The page does not scroll horizontally, and the form dialog fits the screen.

### Review follow-up

A review against issues #39, #40, #41, and #42 found three bugs and two weaknesses, all fixed in `fix(web): guard restaurant form closing and paging edge cases (#41)`:

- Closing the form (Cancel or Escape) or leaving through the prompt while a save was in flight discarded the new upload, even if the save then succeeded. The form now reports when it is busy: closing is ignored while busy, and the leave prompt leaves cleanup to the save itself.
- An upload that finished after the user left the page was never discarded. The form now discards an upload that resolves after it unmounts.
- Removing the last row of a later page left the list past its end, showing "ยังไม่มีร้านอาหาร" with "หน้า 2 จาก 1". The page now moves back to the last page and shows loading meanwhile.
- A Zone load failure left an empty Zone select with no explanation. The form now shows an alert and disables saving.
- An unparseable image URL threw while rendering a preview. URL resolution now returns `null`, and the preview shows its fallback.

| Check | Result |
|---|---|
| `pnpm --filter web exec vitest run src/pages/admin/restaurants` | Pass: 27 tests (6 new). Covers Escape and a disabled Cancel during a pending save with no upload deleted, leaving during a pending save without deleting the upload, discarding an upload that resolves after leaving, moving back to page 1 after deleting the only row on page 2, the Zone load alert with saving disabled, and the malformed-URL fallback. |
| Deliberate regression checks | Removing the busy guard, the save-aware leave cleanup, the unmount discard, the page clamp, the Zone alert, and the safe URL resolution each failed its test (1 failure each); all were restored. |
| Browser check (21 restaurants) | Deleting the only restaurant on page 2 returned to page 1 with all 20 rows. The Escape-during-save and Zone-failure cases could not be reproduced against the local API (saves finish too quickly, and stopping the API also stops the session check), so they rely on the automated tests. |

### Security, privacy, and scope checks

- Endpoint strings live only in `hooks/admin/restaurants/`; components never call the API client.
- Images are never converted to base64 or stored in browser storage, external images are never proxied or downloaded, and cleanup messages never show file paths.
- Restaurant phone numbers are business contact data shown only to `ADMIN` users. Soft delete keeps image references, and restore does not restore menu items.
- No R2/production upload, MenuItem CRUD, public Restaurant page, image processing, or background orphan cleanup was added.

## Design-system fonts

### Scope

- Verification date: 2026-10-05 (ICT, `UTC+07:00`)
- Change: Nunito with Noto Sans Thai fallback for body text, buttons, and forms; Delius Swash Caps with Mali fallback for main headings; Nunito for admin headings and record names. Fonts are self-hosted, and the stacks are defined once in `src/web/src/styles.css` (decision recorded in `docs/plan.md`; design rules in `docs/02-design/design-system.md`)

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 2 new router tests. The `<html>` admin marker is set only while an admin route is shown, is removed after leaving, and is never set for a `USER` redirected away from `/admin`. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 47 files/379 tests; web 19 files/204 tests, after rebasing onto #41), API build with OpenAPI generation, and web production build. The build emits the font files split by script (Latin, Thai, Vietnamese, Cyrillic), and browsers download only the subsets a page uses. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |

### Manual browser checks (Chrome)

- `/login`: the `Kinraidee` wordmark renders in Delius Swash Caps, the Thai heading `เข้าสู่ระบบ` in Mali, and labels and buttons in Noto Sans Thai.
- `/admin` and `/admin/zones`: page headings and the portaled `เพิ่มโซน` dialog heading render in the body font, while the wordmark keeps Delius Swash Caps.
- No request goes to a third-party font host; font files load from the web app's own origin.

## Issue #43 — MenuItem management screen

### Scope

- Verification date: 2026-10-05 (ICT, `UTC+07:00`)
- Change: `/admin/menu-items` with search, Restaurant/FoodType/Taste/deleted filters, pagination, create and edit with a taste checkbox group and whole-baht price, external URL or development-only local images, single delete and restore, and explicit-ID bulk delete and restore for up to 50 selected items. The #41 image flow moved to shared modules that both screens use (decisions recorded in `docs/plan.md`; design rules in `docs/02-design/design-system.md`). No API change.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 23 files/263 tests. New: `MenuItemsPage.test.tsx` (29 tests covering the list, filters, validation, active-Restaurant select, edit blocking, image upload and cleanup order, production build without upload controls, single and bulk delete/restore, selection clearing, and blocked restore), `menuItemSchemas.test.ts` (14), `saveWithImageCleanup.test.ts` (5), `imageFields.test.ts`, and router guard cases for `/admin/menu-items` (anonymous to login with `returnTo`; `USER` to `/account`). Every existing Restaurant test passes unchanged against the shared image modules. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 48 files/392 tests, after rebasing onto #30; web 23 files/263 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| Production bundle search for `image-file` | — | No match: the local-upload control is not in the production build. |

### Manual browser checks (Chrome, local API and database)

- Signed in as the local test administrator; throwaway Zone, FoodType, Taste, Restaurant, and 23 MenuItem records were created through the API for the check.
- Created a MenuItem with a real PNG upload: the preview loaded from the API origin and the row showed the thumbnail, tastes, and `฿1,250`.
- Replaced that image while editing: both files existed until saving, and the old file was removed from the upload directory right after the update succeeded.
- Deleted a Restaurant through the API: the filter marked it `(ลบแล้ว)`, its items showed `ลบแล้ว` and `ร้านถูกลบ`, single restore opened a dialog with the blocked warning and a disabled confirm button, and selecting one of its items disabled bulk restore with the warning text.
- Bulk delete of three selected items (two already deleted) reported `ลบเมนูแล้ว 1 รายการ`; bulk restore of that item reported `กู้คืนเมนูแล้ว 1 รายการ`. Selection cleared after each action, and the header checkbox showed a partial state for a partial selection.
- Escape closed a dialog and returned focus to its trigger; no console errors.
- Admin font rule held: the page heading, dialog heading, and item names computed to `Nunito Variable`.
- Follow-up UI change requested by the human reviewer: the MenuItem page uses a `1240px` extra-wide card (other admin pages keep `1120px`), and the image is now the first table column at 80 px, with a same-size `ไม่มีรูป` placeholder. Rechecked in Chrome: the table fits the card without horizontal scrolling, including rows for deleted items.
- Follow-up: clicking a table image opens the full, uncropped image in a lightbox dialog (`components/ImageLightbox.tsx`); a new page test covers opening it, closing with Escape and with `ปิด`, and focus returning to the image. Checked in Chrome with an uploaded image.
- Follow-up: the selection checkbox is now the first column, before the image. Fixed-content columns (image, food type, price, status, actions) shrink to fit and tastes wrap within `11rem`, so spare width goes to the menu and Restaurant names. Row actions use a compact `40px` button size, and `กู้คืน` uses a new faint orange `soft` variant. Rechecked in Chrome: no horizontal scrolling, including deleted rows.
- The first manual pass found the table too wide (the action buttons were cut off). Thai and English names now share one column and short cells no longer wrap, so the table fits the admin shell without horizontal scrolling; at 390 px wide the page has no horizontal overflow and the table scrolls inside its frame.

## Issue #44 — Stateless meal recommendation endpoint

### Scope

- Verification date/time: 2026-10-06 01:09 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Route: public `POST /api/recommendations`
- Database: isolated temporary PostgreSQL database `kinraidee_issue44_verify` with 2 Zones, 6 FoodTypes, 2 Tastes, 500 active plus 1 deleted Restaurant, 514 active plus 1 deleted MenuItem, and 504 MenuItemTaste links. Of the 514 non-deleted MenuItems, 513 belong to active Restaurants.
- Cleanup: the verification script is retained in the repository; its uniquely prefixed fixtures are removed in `finally`. The temporary database, PostgreSQL cluster, and log used for this run were removed after verification.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run src/modules/recommendations --reporter verbose` | 0 | Pass: 7 files/35 tests covering strict DTO validation, all budget boundaries, 0/1/2/3/more-than-3 result behavior, count and 500-ID limits, exclusion normalization, master-data validation, Prisma filter shape, soft-delete filters, public response minimization, rationale flags, Restaurant-first diversity, randomization invariants, no-match priority, replacement exhaustion, public route behavior, OpenAPI, and performance. Warm service p95 was 0.15 ms over 30 samples with 500 distinct Restaurants. |
| `NODE_ENV=test DATABASE_URL=<test-db> JWT_SECRET=<test-secret> CORS_ALLOWED_ORIGINS=http://localhost:5173 pnpm --filter api recommendations:verify` | 0 | Pass against real PostgreSQL and HTTP with 500 active Restaurants. Verified every budget boundary, deleted MenuItem exclusion, MenuItems under a deleted Restaurant exclusion, a selected Taste when the MenuItem has additional Taste relations, distinct-Restaurant diversity, rejected/displayed exclusion, unknown master ID rejection, exhausted replacement with `relaxation: null`, Zone-first relaxation, and response redaction. Local first request was 47.1 ms; warm HTTP p95 was 26.21 ms over 30 samples. Deployed-host cold-start timing remains unavailable until a test deployment exists. |
| `NODE_OPTIONS=--localstorage-file=/private/tmp/kinraidee-vitest-localstorage pnpm verify` | 0 | Pass after merging current `origin/main`: workspace typecheck, lint, tests, and builds completed. API: 55 files/427 tests; web: 23 files/264 tests. API build regenerated OpenAPI and web production build completed. |
| `pnpm verify` inside the filesystem sandbox | 1 | Environment-only failure: Supertest could not open `127.0.0.1` (`listen EPERM`). The API suite passed after running the same verification outside the sandbox. |
| `pnpm verify` outside the sandbox without `NODE_OPTIONS` | 1 | Environment-only failure: API passed 55 files/426 tests, while Node.js 26 exposed unavailable experimental Web Storage and all web tests failed during `localStorage.clear()`. The controlled command above passed with the temporary storage file. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `pnpm --filter api openapi:generate` and `pnpm --filter web openapi:generate` | 0 | Pass: generated contract and typed web client contain the recommendation request, response, rationale, and relaxation types. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing prototype gap outside #44: 20 passed and 4 failed for the untranslated header expectation and missing Admin prototype states. No prototype or wireframe test was modified. |

### Security, privacy, and scope checks

- The endpoint is public and stateless. It creates no RecommendationSession or history row and performs no database write.
- Conditions and rejected/displayed MenuItem IDs are used only for the current request and are not logged by the module.
- Strict Zod validation rejects unknown selected master IDs, malformed exclusions, invalid counts, extra fields, and exclusion arrays above 500 entries.
- Active MenuItems under active Restaurants are the only candidates. Supplied mandatory filters and normalized exclusions are applied in Prisma before randomization.
- Responses include only card/detail/confirmation fields. They omit image ownership keys, soft-delete fields, timestamps, Restaurant phone, and audit metadata.
- Replacement requests never suggest relaxation. Initial no-match requests change only one condition in the approved Zone, Budget, Taste, FoodType priority.

## Issue #53 — Recommendation condition flow shell

### Scope

- Verification date: 2026-10-06 (ICT, `UTC+07:00`)
- Change:
  - Home becomes the landing hero, using the approved prototype copy.
  - The public `/meal` flow covers budget, taste, food type, and zone, then a condition summary with `สับการ์ดเมนู` disabled until #54.
  - Step and conditions are kept in `sessionStorage` and validated on read.
  - The approved session notice is shown.
  - No recommendation API call.
  - Decisions are recorded in `docs/plan.md`; design rules are in `docs/02-design/design-system.md`.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 25 files/290 tests. New: `MealPage.test.tsx` (17) and `recommendationSchemas.test.ts` (9). Coverage is listed below the table. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 55 files/427 tests; web 25 files/290 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |

`MealPage.test.tsx` covers:
- Anonymous entry from Home.
- Field-level errors on all four steps, linked with `aria-describedby` and focused.
- Approved budget labels with no default.
- Master data from `/api/tastes`, `/api/food-types`, and `/api/zones` in API order, with the fallback icon for an unknown key.
- `อะไรก็ได้` / `ที่ไหนก็ได้` stored as `null`.
- Summary labels, editing an answer from the summary, back navigation, and retry after a load failure.
- State kept across route changes and through the header login round trip.
- Storage limited to the one key `{ step, conditions }`, with malformed or extra-key storage reset.
- A deleted stored choice sends the user back to that step.
- No `/api/recommendations` request.
- No GPS, allergy, voting, wait-time, card, favorite, or history controls.
- Arrow-key radio selection, and focus moving to each new step heading.

Deliberate regression checks confirmed that the page and schema tests fail when:
- "any" is not mapped to `null`.
- The field-level error is removed.
- The storage whitelist (`.strict()`) is removed.
- The stored flow is not restored.

### Manual browser checks (Chrome, local API with the approved #30 catalog seed)

- **Anonymous run from Home through the summary:**
  - Steps load the seeded tastes (with icons), food types, and zones.
  - Pressing `ถัดไป` with nothing chosen shows `กรุณาเลือกงบประมาณ`.
  - The selected chip uses the yellow fill.
  - The summary lists `฿50–100`, `เผ็ด`, `อะไรก็ได้`, and `ตลาดฟ้าไทย`, with `สับการ์ดเมนู` disabled.
- **Storage:** `sessionStorage` held only `kinraidee:recommendation`, with `{ step, conditions }` and `foodTypeId: null`. The app wrote nothing to `localStorage`.
- **Login round trip:** the header `เข้าสู่ระบบ` went to `/login?returnTo=%2Fmeal`, and after login the page returned to `/meal` at the summary with every answer intact.
- **Keyboard:** Tab and Enter reach `แก้ไข`; arrow keys move the radio selection; the chip focus ring is visible; focus moves to each new step heading.
- **Fonts:** headings use `Delius Swash Caps` (Mali for Thai) and choices use `Nunito Variable`.
- **Width:** at 390 px there is no horizontal overflow on `/` or `/meal`.
- **Console:** no errors.
- **Fixed during the check:** the first pass found the Home heading's Thai tone mark touching the line above, caused by `leading-none`. It now uses `leading-tight`.
- **Follow-up UI changes requested by the human reviewer:**
  - The Home heading has more room above it (`leading-snug` plus top padding), so its tone marks clear the eyebrow text.
  - Every step now uses one shared footer (`StepFooter`), with a divider and more space above `ย้อนกลับ` / `ถัดไป`.
  - The choices area has a shared minimum height. Rechecked in Chrome: the `ถัดไป` button sits at the same position on all four steps. The summary uses the same footer layout, lower down because its answer list is taller.
  - No horizontal overflow at 390 px.
