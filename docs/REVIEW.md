# Review Report

## Status

Issue #27 review complete on 2026-09-29. Human pull-request approval remains pending.

## Findings

| ID | Severity | Category | Finding | Status |
|---|---|---|---|---|
| R-001 | High | Privacy / logging | Nested and array-contained sensitive fields could bypass one-level Pino redaction. Added cyclic-safe recursive log sanitization and deep-object/array tests. | Resolved |
| R-002 | Low | API composition | Review confirmed that `GET /health` is the documented exception kept in `app.ts`; feature handlers remain prohibited from `routes.ts`, which stays the feature-router composition point. | Resolved |
| R-003 | Medium | Verification | Environment tests exercised `parseEnv` directly but did not prove invalid configuration stops process startup. Added an isolated invalid-startup process test. | Resolved |
| R-004 | Medium | Plan deviation | Supertest was added although Node APIs could perform the HTTP tests. The human approved the test-only dependency because it removes custom server lifecycle code; the decision is recorded in `docs/plan.md`. | Accepted |
| R-005 | Low | Design verification | Five historical wireframe tests fail because Profile/Admin prototype states are absent. These files are unmodified and outside issue #27; exact failures are recorded in `docs/verification.md`. | Deferred |

## Review scope

- Functional requirements in `docs/01-requirements/01-spec/`
- Implementation deviations in `docs/plan.md`
- Bugs and edge cases
- Authentication and authorization
- Input validation and secrets handling
- PDPA purpose, consent, minimization, rights, retention, and disclosure
- Computer Crime Act traffic-log handling where applicable
- Electronic agreement and consent evidence where applicable

## Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #29 — Initial administrator seed

### Status

Automated two-axis review complete on 2026-09-29. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain. Review identified a possible duplicated-code risk because the seed and API environment parser separately defined Argon2 cost defaults. The defaults now live in `src/api/src/config/argon2.ts` and are consumed by both paths.

### Specification review

No findings. The environment-backed seed validates and normalizes credentials, trims passwords according to the approved policy, writes only an Argon2id hash, enforces `ADMIN`, updates the configured account idempotently, emits safe output, and creates no regular-user or catalog fixture data. `prisma.config.ts` provides the supported Prisma seed hook and was verified through `prisma db seed`.

### Review scope

- Diff: `git diff origin/main...HEAD`
- Commit: `6a8787c feat(api): add initial admin seed (#29)`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #29 and the human-approved password policy
- Credential validation, normalization, hashing, idempotency, role enforcement, safe output, and fixture scope

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #28 — Prisma schema and first migration

### Status

Automated two-axis review complete on 2026-09-29. Human pull-request approval remains pending.

### Standards review

No findings. The schema, generated migration, package script, and verification evidence follow `AGENTS.md`, `rule.md`, the engineering guidelines, the locked data model, and the module implementation checklist. No applicable baseline code smells were found.

### Specification review

No findings. The schema and migration implement the enums, models, relations, delete actions, indexes, constraints, and scope required by issue #28. `src/api/src/lib/prisma.ts` already exists unchanged from `main`, so it is present in the resulting branch without appearing in this issue's diff.

### Review scope

- Diff: `git diff main...HEAD`
- Commit: `c07cef3 feat(api): add Prisma schema and initial migration (#28)`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #28
- Personal-data schema, deletion behavior, audit snapshots, credentials, and forbidden fields
- Migration parity with the approved Prisma schema

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #31 — Email/password authentication

### Status

Automated two-axis review complete on 2026-09-29. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain. Review initially found that non-pure Argon2/JWT operations lived in `auth.helpers.ts` and that `auth.openapi.ts` owned a response schema. Security operations now live in `src/api/src/lib/authSecurity.ts`, pure cookie/error helpers remain module-local, and the error response schema is owned by `auth.dto.ts`. Security tests were separated from cookie-helper tests. Repeated local environment fixtures remain an accepted judgement call because extracting them now would add a test-only abstraction without meaningful reuse beyond this module.

### Specification review

No findings remain. Review initially identified an account-enumeration timing signal for unknown emails and missing HTTP-level coverage for successful login cookies and expired `/me` cookies. Unknown-email login now performs a dummy Argon2id verification, and the route tests cover both cases. All issue #31 routes, cookie/JWT requirements, validation, role restrictions, response shapes, OpenAPI definitions, and scope exclusions are implemented.

### Review scope

- Diff: `git diff origin/main...HEAD`
- Commits: `26c2164 feat(api): implement email password authentication`; `d0b74bb fix(api): address authentication review findings`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #31 and its approved implementation note
- Credential normalization, password hashing, account-enumeration resistance, JWT verification, cookie security, authorization, response/log secret exclusion, OpenAPI, database behavior, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #40 — Development-only internal image uploads

### Status

Automated two-axis review complete on 2026-09-29. No unresolved findings remain. Human pull-request approval remains pending.

### Standards review

No findings remain. The initial review found missing anonymous/`USER` authorization coverage for the protected delete route and no HTTP boundary test for an image exactly at the configured byte limit. Both are now covered. The duplicated `UPLOAD_TOO_LARGE` mapping now uses a module-local helper. Error-envelope schemas remain module-owned by their DTO files, consistent with the module checklist and the prior authentication review.

### Specification review

No findings remain. The initial review found that key-name redaction alone could expose a `Buffer` stored under a generic log key. Binary values are now redacted by type, including `Buffer`, `ArrayBuffer`, and typed-array views, with emitted-log coverage. Upload environment controls, ADMIN authorization, multipart limits, magic-byte validation, generated names, traversal protection, deletion, static serving, production behavior, OpenAPI, and scope exclusions match issue #40.

### Review scope

- Diff: `git diff origin/main...HEAD`
- Commits: `3b617ed feat(api): add development-only image uploads`; `a5c7b4d fix(api): address upload review findings`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #40 and its approved implementation note
- Environment safety, authorization, multipart boundaries, file signatures, MIME matching, filename generation, path traversal, filesystem behavior, production disablement, logging, OpenAPI, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #32 — Authentication pages and protected route guards

### Status

Automated two-axis review complete on 2026-09-29. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain. Screens use only design-system tokens (Tailwind colours are restricted to the token palette), no raw colours, custom SVG, or icon imports; API calls go through generated OpenAPI types and TanStack Query hooks only; components never call `fetch` or the API client; nothing is written to browser storage; forms use React Hook Form with Zod. Judgement calls accepted: `SiteHeader`, `RequireAuth`, `RedirectIfAuthenticated`, and `RouteStatus` live in root `components/` although each is mounted once, because they wrap every page rather than belonging to one; `lib/authRedirects.ts` takes a type-only import of `UserRole` from `hooks/auth`; the scaffold Home placeholder moved to `pages/home/HomePage.tsx` because `App.tsx` became the layout. The web test dependencies and the local Zod resolver are recorded deviations in `docs/plan.md`.

### Specification review

No blocking findings. All #32 routes, header labels, guard redirects, safe `returnTo` rules, login/register/logout behavior, cookie-only authentication, accessibility requirements, and listed tests are implemented; manual browser checks ran against the real API. Notes: authenticated visitors are also redirected away from `/register`, and unbuilt `/account/*` and `/admin/*` children fall back to their landing pages (both recorded in `docs/plan.md`); logout was also placed on the admin landing so administrators can sign out; the `บัญชีนี้ไม่มีสิทธิ์จัดการระบบ` notice is carried in router history state, so it reappears if that history entry is reloaded (low impact, accepted); the keyboard test covers the login form, and the register form uses the same field component. The Thai purpose notice on `/register` is adapted from the specification's account-email data-inventory row and needs human confirmation of the wording (LR1).

### Review scope

- Diff: `git diff origin/main...feat/32-auth-pages`
- Commit: `feat(web): add authentication pages and route guards (#32)`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/03-implementation/engineering-guidelines.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #32, `docs/02-design/user-journey.md`, and `docs/02-design/prototype.md`
- Token handling, `returnTo` open-redirect resistance, route guards versus server-side authorization, browser-storage use, personal-data display, accessibility, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #33 — Zone CRUD endpoints

### Status

Automated two-axis review complete on 2026-09-29. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain. The module follows the routes/controller/dto/service/repository/helpers/openapi layering; controllers only parse, call the service, and use response helpers; Prisma access stays in the repository; routes register in `routes.ts` and OpenAPI through `registerZonesOpenApi`. Code reused by the next catalog modules was placed in specifically named shared files (`shared/validation.ts`, `shared/localization.ts`, `shared/errorEnvelope.ts`, `shared/auditContext.ts`, `shared/recordChanges.ts`, `lib/prismaErrors.ts`, `modules/audit-logs/audit-logs.repository.ts`). Mutations reuse issue #40's `requireAdmin` middleware instead of adding a second role guard, and auth OpenAPI now uses the shared error-envelope schema with byte-identical generated output. Judgement calls accepted: the repository calls the pure `toAdminZone` mapper because audit snapshots must be built inside the mutation transaction; `shared/auditContext.ts` imports the auth module's `unauthenticatedError`, following the existing `requireAuth` precedent.

### Specification review

No findings. Routes, public/admin response shapes, sorting, validation, 404/409 behavior, hard delete with in-use protection, `UserPreference.zoneId` set-null, transactional audit snapshots, and all required tests are implemented and were verified against a real database. Notes: `sortOrder` is limited to the PostgreSQL 32-bit integer range so out-of-range values return 400 instead of a database error; the duplicate-name code is `ZONE_NAME_ALREADY_EXISTS` because the issue fixes only the status. The in-use check counts soft-deleted restaurants too, which is correct because they still reference the zone; the future zone admin screen (#34) should explain that soft-deleted restaurants also block deletion.

### Review scope

- Diff: `git diff feat/32-auth-pages...feat/33-zone-crud`
- Commit: `feat(api): implement Zone CRUD endpoints (#33)`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #33
- Server-side authorization, input validation, audit transaction and snapshot content, delete restrictions, error envelopes, log content, OpenAPI, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #35 — FoodType CRUD endpoints

### Status

Automated two-axis review complete on 2026-09-29. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain. The `food-types` module mirrors the zones layering and reuses the shared validation, localization, audit, role, and Prisma-error helpers. Two new shared files have real reuse: `shared/iconKey.ts` (food types and tastes) and `shared/duplicateNameError.ts` (zones, food types, and tastes); zones moved onto the shared duplicate-name error with unchanged behavior, confirmed by its existing tests. The same repository-mapper and shared-auth-import judgement calls recorded for #33 apply.

### Specification review

No findings. Routes, public/admin shapes, sorting, validation, 404/409 behavior, hard delete blocked while menu items reference the food type, `UserPreference.foodTypeId` set-null, transactional audit snapshots, and all required tests are implemented and were verified against a real database. The icon is stored only as a validated lowercase key; empty input normalizes to `null` as the issue requires, and SVG, HTML, URL, and other non-key input returns 400. As with zones, the in-use count includes soft-deleted menu items because they still reference the food type; the admin screen (#36) should explain this. The duplicate-name code is `FOOD_TYPE_NAME_ALREADY_EXISTS`.

### Review scope

- Diff: `git diff feat/33-zone-crud...feat/35-food-type-crud`
- Commit: `feat(api): implement FoodType CRUD endpoints (#35)`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #35
- Server-side authorization, input and icon-key validation, audit transaction and snapshot content, delete restrictions, error envelopes, OpenAPI, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD
