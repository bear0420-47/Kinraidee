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

## Issue #44 — Stateless meal recommendation endpoint

### Status

Automated two-axis review complete on 2026-10-06. No unresolved findings remain. Human pull-request approval remains pending.

### Standards review

No documented-standard violations or unresolved code-smell findings remain. The module follows the existing controller/service/repository structure, validates the public boundary with strict Zod schemas, performs no writes or request-data logging, and keeps response fields minimized. The initial Middle Man judgement call was resolved by removing `countRelaxed` and calling the repository directly. Verification evidence now exactly describes the retained fixture and reproducible command.

### Specification review

No findings remain. The endpoint implements the Issue #44 filters, exclusions, Restaurant-first diversity, replacement behavior, minimized response, and Zone → Budget → Taste → FoodType relaxation order. The retained real PostgreSQL and HTTP harness covers all price boundaries, soft-deleted MenuItems and Restaurants, multi-Taste matching, exclusions, exhaustion, redaction, master-data validation, and diversity. It reports the local first request separately from the 30-sample warm p95. Deployed-host cold-start latency remains unmeasured until a test deployment exists and is recorded as a verification limitation.

### Review scope

- Diff: working tree against `HEAD`, including new Issue #44 files
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #44 and its approved implementation note
- Validation, authorization scope, statelessness, database filtering, soft-delete handling, diversity, replacement, no-match relaxation, response minimization, OpenAPI, reproducible integration verification, and performance evidence

### Approval

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

## Issue #37 — Taste CRUD endpoints

### Status

Automated two-axis review complete on 2026-09-29. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain. The `tastes` module has the same structure as `food-types` (the two models share a shape) and reuses the same shared helpers; only the in-use query (`MenuItemTaste` links), error codes, and messages differ. The same repository-mapper and shared-auth-import judgement calls recorded for #33 apply.

### Specification review

One accepted deviation. Issue #37 says the API rejects empty icon keys; the human approver chose #35's rule for both modules, so an empty or whitespace-only key normalizes to `null` (recorded in `docs/plan.md`). Every other requirement is implemented and was verified against a real database: routes, public/admin shapes, sorting, validation including SVG/HTML/URL icon rejection, 404/409 behavior, hard delete blocked while any `MenuItemTaste` link exists with the approved "remove or change this taste" message, links never removed automatically, `UserPreference.tasteId` set-null, transactional audit snapshots, and all required tests. The duplicate-name code is `TASTE_NAME_ALREADY_EXISTS`.

### Review scope

- Diff: `git diff feat/35-food-type-crud...feat/37-taste-crud`
- Commit: `feat(api): implement Taste CRUD endpoints (#37)`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #37
- Server-side authorization, input and icon-key validation, audit transaction and snapshot content, delete restrictions including join-table links, error envelopes, OpenAPI, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #39 — Restaurant CRUD endpoints

### Status

Automated two-axis review complete on 2026-09-29. No unresolved findings remain. Human pull-request approval remains pending.

### Standards review

The review found that the initial response omitted `zoneId` and `imageKey` from the locked data-model API contract; both are now included while retaining the issue-required localized `zone` object. It also found that `z.string().url()` accepted non-web schemes; Restaurant write inputs now accept only HTTP(S) external image URLs, with regression coverage. Transactional mutation and audit composition remains in the repository, matching the already reviewed Zone/FoodType/Taste module convention: Prisma access and the transaction boundary stay together while the service owns validation, not-found decisions, unchanged-write handling, and error mapping. The possible duplicated transaction/audit shape remains a judgement call; extracting a Restaurant-specific abstraction would add indirection without reuse beyond this module.

### Specification review

No findings remain. The initial review found that concurrent delete or restore requests could both observe the old state and create duplicate timestamp/audit changes. Both operations now use a conditional `updateMany` claim inside the transaction; only the request that changes state updates child records or writes the audit event, and race-loser tests cover both paths. ADMIN authorization, pagination/filtering/search/sort, Zone validation, localized input, phone trimming, HTTP(S) image replacement, duplicate names, transactional child soft deletion, Restaurant-only restore, minimized audit snapshots, OpenAPI, and scope exclusions match issue #39.

### Review scope

- Diff: `git diff origin/main...HEAD`
- Commits: `ebe7584 feat(api): implement Restaurant CRUD endpoints (#39)` plus the review-fix commit
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #39 and its approved implementation note
- Authorization, validation, response contract, transaction boundaries, concurrent idempotency, child soft deletion, restore behavior, audit minimization, OpenAPI, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #34 — Zone management screen

### Status

Automated two-axis review complete on 2026-09-30. Human approval recorded after PR #67 merged into `main`.

### Standards review

No documented-standard violations remain. The page uses design-system tokens and Phosphor icons only, with no custom SVG. Each icon is imported by name and paired with visible text. API calls go through the generated OpenAPI types in TanStack Query hooks, and mutations invalidate the shared `['zones']` list. Forms use React Hook Form with Zod through the local resolver, and nothing is written to browser storage. Judgement calls accepted:
- `components/Dialog.tsx` lives in root `components/` although only the zones page uses it in this change, because #36 and #38 reuse it next.
- Arbitrary Tailwind sizes (`min-w-[48rem]` for the scrollable table, `max-h-[90vh]` for the dialog) are layout values, not colours.

### Specification review

No blocking findings. All #34 fields, copy, behaviors, accessibility items, and required tests are implemented. Manual browser checks ran against the real API. Notes:
- Editing sends only the changed fields, and an unchanged form closes without a request (recorded in `docs/plan.md`).
- Duplicate-name errors mark whichever name fields the API reports, or both when it does not say.
- The in-use message is shown inside the delete dialog so the admin keeps context.
- After a server failure, the form alert stays visible until the next successful submit attempt, even if a later attempt fails client validation (low impact, accepted).

### Review scope

- Diff: `git diff origin/main...feat/34-zone-admin`
- Commit: `feat(web): add zone management screen (#34)`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/03-implementation/engineering-guidelines.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #34
- Admin-only access versus server-side authorization, typed-client use, dialog focus and inert behavior, error-message mapping, mobile layout, and out-of-scope boundaries

### Approval

Human reviewer: `aboutblank0000000`
Decision: Approved
Date: 2026-09-30

## Issue #30 — Approved catalog starter-data seed

### Status

Automated two-axis review complete on 2026-10-05. No unresolved findings remain. Human pull-request approval remains pending.

### Standards review

No documented-standard violations were found. The review identified a possible duplicated-code judgement call in the five entity-specific mapping/upsert loops in `prisma/catalog-seed.ts`. The repetition is retained because each Prisma model has a distinct validated fixture-to-column mapping, and a generic delegate abstraction would hide the required dependency order and weaken type readability for only five bounded seed entities.

### Specification review

The initial review found that plain `z.url()` accepted non-HTTP schemes even though issue #30 permits only approved external image URLs or `null`. The fixture schema now requires HTTP(S) for Restaurant and MenuItem external images, and a regression test rejects a syntactically valid `javascript:` URL. No other missing requirement or scope creep was found.

The approved fixture contains 3 zones, 4 food types, 6 tastes, 3 restaurants, 9 menu items, and 22 exact taste links. It validates before the transaction, writes the administrator and catalog transactionally in dependency order, preserves primary records outside the fixture and all existing `deletedAt` values, synchronizes fixture-managed taste links, emits safe counts, and performs no network or R2 work.

### Review scope

- Diff: `git diff origin/main...HEAD` plus the HTTP(S) review-fix working-tree diff
- Commit: `6b4edda feat(api): seed approved catalog dataset (#30)`; review fix committed separately
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #30 and the human-approved dataset/taxonomy decisions in this work session
- Full-fixture validation, stable IDs, dependency order, transactionality, idempotency, image handling, soft-delete preservation, taste-link synchronization, personal-data minimization, source evidence, and safe output

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #49 — AuditLog review API, admin screen, and retention command

### Status

Automated two-axis review complete on 2026-10-01. No unresolved findings remain. Human pull-request approval remains pending.

### Standards review

No findings remain. The initial review found that response mapping lived in the service instead of the DTO layer and that completed filter/page changes had no persistent live-region announcement. Response mapping now lives in `audit-logs.dto.ts`; the service owns only defensive sanitization and use-case flow. The page-count summary is a polite status region. Module composition, ADMIN middleware, typed-client hook, Prisma-only repository, native `<details>`, and design tokens follow the documented repository rules.

### Specification review

No findings remain. The initial review found incomplete coverage for alternate IP field names and for the complete web filter/keyboard contract. Recursive sanitization now removes IP address and user-agent fields, including common proxy/source key variants, while secret-bearing keys retain their names with `[REDACTED]` values. Tests cover every filter, page size, pagination, keyboard focus, expansion, actor-email absence, no audit-on-read, exact retention boundary, idempotency, safe command logging, and Prisma disconnect.

The API is ADMIN-only, sorts by `createdAt DESC` then `id DESC`, returns pagination metadata, and never joins actor email. Audit reads do not write audit events. The verified prune command deletes only rows strictly older than 180 days. Production retention remains blocked until an approved scheduler runs the command; application audit logs remain separate from Computer Crime Act traffic logs.

### Review scope

- Diff: `git diff origin/main...HEAD`
- Commits: `d8cfc07`, `165a0e9`, `c1b49e2`, and `b7fc129`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #49 and its approved implementation note
- Authorization, filtering, stable sorting, pagination, response sanitization, read-only UI, accessibility, retention boundary, command lifecycle, scheduler blocker, OpenAPI, and scope exclusions

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #36 — FoodType management screen

### Status

Automated two-axis review complete on 2026-09-30. Human approval recorded after the stacked PR #68 changes reached `main` through PR #69.

### Standards review

No documented-standard violations remain. Icons come only from `@phosphor-icons/react`, imported by name, and a test enforces no handwritten SVG and no namespace import. Stored icon keys resolve through a controlled registry with a fallback, never by dynamic import, and every icon sits next to a text label. Shared components moved to root `components/`, and shared schema fields to `schemas/shared/`, only now that the zones and food-types pages both use them, as `engineering-guidelines.md` requires. Judgement calls accepted:
- `lib/foodTypeIcons.tsx` exports both the registry and a `FoodTypeIcon` component, so later recommendation screens reuse the same map.
- The icon select is a native `<select>` with a decorative preview icon, not a custom listbox, so keyboard behavior is the browser's own.

### Specification review

No blocking findings. All #36 fields, copy, icon rules, behaviors, accessibility items, and required tests are implemented. Manual browser checks ran against the real API; `FOOD_TYPE_IN_USE` was triggered with a menu item inserted directly in the verify database, because the MenuItem API does not exist yet. Notes:
- `sandwich` uses Phosphor's `Hamburger`, the closest available icon (recorded in `docs/plan.md`).
- A stored key outside the registry is shown as the fallback with its raw key and is left unchanged when other fields are edited, so opening and saving a record never erases data silently.
- Option labels include the key, for example `ข้าว (rice)`, so admins can match what the API stores.

### Review scope

- Diff: `git diff feat/34-zone-admin...feat/36-food-type-admin`
- Commit: `feat(web): add food type management screen (#36)`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/03-implementation/engineering-guidelines.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #36
- Icon registry safety, SVG and namespace-import policy, admin-only access versus server-side authorization, shared-component extraction, and out-of-scope boundaries

### Approval

Human reviewer: `aboutblank0000000`
Decision: Approved
Date: 2026-09-30

## Issue #38 — Taste management screen

### Status

Automated two-axis review complete on 2026-09-30. Human approval recorded after PR #69 merged into `main`.

### Standards review

No documented-standard violations remain. The page uses the same shared frame, list states, dialogs, and icon-registry rules as #34 and #36, with Phosphor icons imported by name and no handwritten SVG, which the icon-policy test enforces. Typed hooks own the endpoint strings. Judgement call accepted: FoodType and Taste share one form, table, and schema implementation (`IconMasterData*`) because the two records have identical fields and rules. The per-issue files the issue lists remain as thin wrappers, so each screen can still diverge later without touching the other.

### Specification review

No blocking findings. All #38 fields, copy, icon rules, behaviors, accessibility items, and required tests are implemented. Manual browser checks ran against the real API; `TASTE_IN_USE` was triggered with a `MenuItemTaste` link inserted directly in the verify database. Notes:
- `bowl` uses Phosphor's `BowlFood`, because there is no plain bowl icon (recorded in `docs/plan.md`).
- The in-use message follows the issue: remove or change the taste on those menu items first.
- As on the other screens, an unchanged edit closes without a request.

### Review scope

- Diff: `git diff feat/36-food-type-admin...feat/38-taste-admin`
- Commit: `feat(web): add taste management screen (#38)`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/03-implementation/engineering-guidelines.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #38
- Icon registry safety, shared-form refactor regressions for FoodType, admin-only access versus server-side authorization, and out-of-scope boundaries

### Approval

Human reviewer: `aboutblank0000000`
Decision: Approved
Date: 2026-09-30

## Issue #42 — MenuItem admin CRUD and bulk actions

### Status

Automated two-axis review complete on 2026-09-30. No unresolved findings remain. Human approval recorded after PR #71 merged into `main`.

### Standards review

No documented-standard violations remain. The module follows the existing controller/service/repository composition, validates every boundary with Zod, protects every route with `ADMIN`, and keeps MenuItem, taste-assignment, and audit writes in one transaction. The review's duplicated-code judgement call was resolved by moving the reused empty-string and optional-search normalization into `shared/validation.ts`. Raw SQL is limited to a parameterized `SELECT ... FOR UPDATE` because Prisma cannot express the Restaurant row lock needed to prevent create/update races with Restaurant soft deletion.

### Specification review

No findings remain. The initial review found that `PATCH` could update a MenuItem under an already deleted Restaurant and that create/update validated the Restaurant outside the write transaction. Create and update now lock and validate the effective Restaurant within the same transaction as the MenuItem and audit writes; unchanged updates also perform this check without writing audit noise. Repository and service regressions cover deleted effective Restaurants and transactional rejection. The remaining low test risk is that the row-lock tests mock `$queryRaw` rather than orchestrating a real concurrent Restaurant deletion; the parameterized `FOR UPDATE` lock closes the identified time-of-check/time-of-use path.

All eight routes, filtering and pagination, localized response mapping, Restaurant phone redaction, taste replacement, image key/URL rules, idempotent single and bulk actions, minimized audit summaries, OpenAPI registration, and scope exclusions match issue #42.

### Review scope

- Diff: `git diff origin/main...HEAD` plus the review-fix working-tree diff
- Commits: `9a07de4 feat(api): implement MenuItem admin CRUD (#42)` and the merge from current `origin/main`; review fixes are committed separately
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #42 and its approved implementation note
- Authorization, validation, response redaction, relation integrity, transaction boundaries, concurrent Restaurant deletion, idempotency, audit minimization, OpenAPI, and out-of-scope boundaries

### Approval

Human reviewer: `aboutblank0000000`
Decision: Approved
Date: 2026-09-30

## Restaurant local images (API prerequisite for #41)

### Status

Automated two-axis review complete on 2026-10-05. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain. Instead of copying MenuItem's image validation into Restaurant, the rule moves to the uploads module, which already owns the upload key and `/uploads` URL contract. Both DTOs now spread `imageReferenceFields` and use the same refinement and column mapping. The change stays inside the DTO layer: controllers, services, repositories, and audit snapshots are untouched. Judgement call accepted: `imageUrl` is written as one refined nullable string instead of a union, so the generated OpenAPI type is `string | null` rather than `string | unknown`. Validation behavior is the same, and only the error message for an invalid URL is more general. The `/uploads` static route overrides helmet's `Cross-Origin-Resource-Policy` to `cross-origin`. Without this, the web app (another origin) cannot display uploaded images at all, a gap #40's tests could not show because they fetch files directly. The override is scoped to that route and does not grant cross-origin reads.

### Specification review

No blocking findings. #41 requires saving an uploaded `imageKey`/`imageUrl` on a Restaurant, which #39 explicitly scoped out. This change adds exactly that, using the data-model rule already applied to MenuItem in #42: an external URL keeps `imageKey = null`, and a local upload stores its generated key with the matching URL. The #39 behaviors its tests still check are unchanged: HTTP(S)-only external URLs, and an external URL clearing an earlier key.

### Review scope

- Diff: `git diff origin/main...fix/39-restaurant-local-images`
- Commits: `fix(api): accept uploaded images on restaurants`, `fix(api): let the web app display uploaded images`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/engineering-guidelines.md`
- Specification sources: GitHub issues #39, #40, and #41
- Image key/URL integrity, external URL scheme validation, MenuItem regression risk, the OpenAPI contract, and the scope of the relaxed resource policy

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #41 — Restaurant management screen

### Status

Automated two-axis review complete on 2026-10-05. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain. The page follows the master-data structure (shell, filters, `QueryListState`, table with `RowActions`, shared dialogs) and the issue's file layout. Typed hooks own every endpoint; React Hook Form and Zod validate input; icons are Phosphor components next to text; nothing is persisted in browser storage. Shared pieces were generalized rather than copied: `ConfirmDialog`, `Pagination`, `QueryListState`, the description-pair rule, and image URL resolution. Judgement calls accepted:
- The save/cleanup orchestration lives in `useSaveRestaurant`, not the form, so cleanup still runs after the dialog closes.
- The test setup swaps in Node's `FormData`/`File`/`Blob`, because jsdom's cannot be sent through Node's `Request`. The swap is limited to tests and documented in `docs/plan.md`.
- The audit-log page was not refactored onto `Pagination`, to keep this change scoped.

### Specification review

No blocking findings. All #41 list, filter, form, image-mode, upload-transaction, delete/restore, copy, accessibility, and required-test items are implemented. Manual browser checks ran against the real API, and they surfaced two API gaps (Restaurant upload keys and the `/uploads` resource policy) fixed in the prerequisite change. Notes:
- Uploads start as soon as a file is picked, which the preview requires.
- An upload made just before a full page unload can remain on disk. The page warns through `beforeunload`, and automatic orphan cleanup is out of scope for the issue.
- When a save fails after a new upload, the form returns to the restaurant's saved image, or asks for the file again on create.
- Search applies on submit; the Zone and deleted filters apply immediately.

### Follow-up review

A second review against issues #39, #40, #41, and #42 found the change in scope. It fixed three bugs and two weaknesses: closing or leaving during a save could delete an upload the saved restaurant references; an upload finishing after the user left was orphaned; an emptied last page showed the empty state; a Zone load failure was silent; and a malformed image URL could crash a preview. Details and tests are in `docs/verification.md`. Left unchanged by design:
- Restaurant and MenuItem writes still accept a generated upload key in production. MenuItem (#42) already did, and production cannot create uploads, so changing it belongs with the teammate's module.
- A failed save still deletes its new upload, as the issue requires, even in the rare case where the server committed but the response was lost.

### Review scope

- Diff: `git diff fix/39-restaurant-local-images...feat/41-restaurant-admin`
- Commits: `feat(web): add restaurant management screen (#41)`, `fix(web): guard restaurant form closing and paging edge cases (#41)`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/03-implementation/engineering-guidelines.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #41
- Upload ordering and orphan cleanup, development-only upload gating, image URL handling, browser-storage use, admin-only access versus server-side authorization, mobile layout, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #43 — MenuItem management screen

### Status

Automated two-axis review complete on 2026-10-05. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain. The page follows the Restaurant screen's structure (shell, filters, `QueryListState`, table with `RowActions`, shared dialogs, `Pagination`). Typed hooks own every endpoint; React Hook Form and Zod validate input; icons are Phosphor components next to text; nothing is persisted in browser storage. The #41 image flow was moved to shared modules instead of being copied, and the Restaurant suite passing unchanged shows its behavior is preserved. Judgement calls accepted:
- `useMenuItemImage.ts` and `MenuItemImageField.tsx`, listed in the issue's expected files, are not added because they would only re-export the shared image modules.
- Restaurant, FoodType, and Taste mutations also refresh the MenuItem list, because MenuItem rows embed their names and Restaurant deletion cascades to MenuItems.
- `RowActions` gained an optional blocked-edit reason and `ConfirmDialog` an optional disabled confirm; existing callers are unchanged.

### Specification review

No blocking findings. All #43 list, filter, form, image, bulk-selection, delete/restore, copy, accessibility, and required-test items are implemented. Notes:
- The price accepts whole baht from 1 to 2,147,483,647, the `Int` column's limit, so an oversized value is a field error rather than a server error.
- The 50-item limit is enforced in the selection helpers and unit-tested; a 20-row page cannot reach it today.
- Bulk counts come from the API's `updatedCount`, so already-deleted or already-active items are reported honestly.
- An active item under a deleted Restaurant (possible only if the Restaurant is deleted mid-session) keeps delete but has edit disabled with visible guidance.

### Review scope

- Diff: `git diff main...feat/43-menu-item-admin`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/03-implementation/engineering-guidelines.md`, and `docs/03-implementation/module-implementation-checklist.md`
- Specification source: GitHub issue #43
- Upload ordering and orphan cleanup, development-only upload gating, bulk ID handling, Restaurant-deleted blocking, admin-only access versus server-side authorization, mobile layout, and out-of-scope boundaries (no API, recommendation, R2, or public detail changes)

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #53 — Recommendation condition flow shell

### Status

Automated two-axis review complete on 2026-10-06. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain:
- The flow follows the issue's file layout (`pages/meal`, `hooks/meal`, `schemas/meal`).
- It uses the typed client through the existing Zone, FoodType, and Taste hooks.
- Icons are Phosphor only, through the controlled registries.
- Choice chips are native radios, as the design system now records.
- `sessionStorage` writes are wrapped so the flow still works when storage is blocked.

Judgement calls accepted:
- The four step components wrap one shared `ChoiceStep`, so validation, focus, and chip styling stay identical across steps.
- `PageShell` gained a `medium` width for single-column flows.
- The condition type comes from the recommendation API contract, so #54 can send it without mapping.

### Specification review

No blocking findings. Every #53 scope rule, budget/taste/food-type/zone rule, session-storage rule, required test, and acceptance item is implemented. Notes:
- The human approver approved the session notice wording and the Home copy, and chose to show `สับการ์ดเมนู` disabled. All three are recorded in `docs/plan.md`.
- A stored ID whose record was deleted counts as unanswered, so the summary never shows a stale label.
- Login started from `/meal` returns to `/meal` through the existing safe `returnTo` handling. The stored flow survives because it lives in `sessionStorage`.

### Review scope

- Diff: `git diff main...feat/53-recommendation-conditions`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/02-design/user-journey.md`, `docs/02-design/prototype.md`, and `docs/03-implementation/engineering-guidelines.md`
- Specification sources: GitHub issues #53 and #45
- Checked: session-storage contents and validation, absence of personal and sensitive data, absence of recommendation API calls, auth round-trip safety, keyboard and focus behaviour, mobile layout, and out-of-scope controls

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #54 — Shuffle cards and recommendation interaction

### Status

Automated two-axis review complete on 2026-10-06. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain:
- Requests go through the typed client in a TanStack mutation, which throws `ApiError`, like the other hooks.
- The shortlist logic is pure (`schemas/meal/shortlist.ts`) and unit-tested, and the components only render and dispatch.
- Icons are Phosphor only.
- Every card state is named in text, and motion is `motion-safe:` only.
- `formatPrice` moved to `lib/`, so public code does not import admin code.

Judgement calls accepted:
- The shortlist is stored with the full returned items, the issue's "displayed shortlist", so a reload restores the cards without another request. It is validated on read.
- No-match results are not stored, so a reload returns to the summary.
- Card actions are disabled while a replacement is in flight, so two replacements cannot race over the same exclusions.

### Specification review

No blocking findings. All #54 scope, shuffle, reject/replacement/undo, no-match, session-storage, rationale, required-test, and acceptance items are implemented. Notes:
- `เลือกเมนูนี้` uses the same disabled-with-note pattern the human approver chose for #53, and `MenuCard` exposes the typed `onChoose` seam for #55.
- A failed replacement does not add the card to the rejected IDs.
- Leaving the cards through `แก้เงื่อนไข` clears the shortlist and the rejected IDs, starting a new session (F7).
- A rationale flag that is false reads as openness, such as `เปิดรับได้ทุกโซน`, never as a failed filter.

### Review scope

- Diff: `git diff feat/53-recommendation-conditions...feat/54-shuffle-cards`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/02-design/user-journey.md`, `docs/02-design/prototype.md`, and `docs/03-implementation/engineering-guidelines.md`
- Specification sources: GitHub issues #54 and #45, and the #44 recommendation contract
- Checked: request bodies, exclusion correctness, undo semantics, session-storage contents and validation, absence of personal data, no history or detail endpoints, focus and live-region behaviour, reduced motion, mobile layout, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #55 — Recommendation confirmation and success

### Status

Automated two-axis review complete on 2026-10-06. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain:
- The dialog reuses the shared `Dialog` (inert background, focus trap, Escape, focus return) instead of a new modal.
- The card photo and rationale list are shared components, so the card and the dialog cannot drift apart.
- Icons are Phosphor only, and no new animation was added.
- The recommendation test fixtures are shared through `src/test/fakeRecommendationApi.ts`, like `fakeCollectionApi.ts`.

Judgement calls accepted:
- The chosen card is held in page memory, not in `sessionStorage`, so a reload during confirmation returns to the unchanged cards.
- Escape on the success state acts as `กลับหน้าหลัก`, because the flow is complete and there is no earlier state to return to.
- `finish` clears storage directly as well as resetting the flow, so the clean-up never depends on a render before navigation.

### Specification review

No blocking findings. All #55 scope, dialog, success, accessibility, required-test, and acceptance items are implemented. Notes:
- No history is written for anonymous or signed-in users; #48 adds it at `เอาเมนูนี้แหละ`.
- The dialog titles (`เลือกเมนูนี้ใช่ไหม?`, `ได้มื้อนี้แล้ว!`) and the success message are AI-proposed; the design pack fixes only the action labels. Human wording approval is pending.

### Review scope

- Diff: `git diff feat/54-shuffle-cards...feat/55-recommendation-confirmation`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/02-design/user-journey.md`, `docs/02-design/prototype.md`, and `docs/03-implementation/engineering-guidelines.md`
- Specification sources: GitHub issues #55 and #45
- Checked: dialog content against the response, request log, storage clean-up, focus and live-region behaviour, keyboard-only completion, mobile layout, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #46 — MenuItem favorites

### Status

Automated two-axis review complete on 2026-10-07. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain:
- The API module follows the existing layering (dto, repository, service, controller, routes, OpenAPI) and reuses `menuItemNotFoundError`, `parseWithSchema`, the `ok()` envelope, and `requireAuth`.
- The web uses the generated client and TanStack Query, keeps favorites only in the query cache (keyed by user and removed on logout), and uses Phosphor icons only.
- State is carried by shape, text, and `aria-pressed`, never colour alone.

Corrections made during the plan-mode review of the first pass:
- The `useLogout` clean-up line was restored after an interrupted check.
- Upserts were replaced with `createMany({ skipDuplicates: true })`, because Prisma's upsert can fail on a simultaneous insert.
- A foreign-key failure is mapped to `404`.
- Post-removal focus moved from the list (which unmounts when emptied) to a stable area.
- The favorites visual rules were added to the design system.

Judgement calls accepted:
- The web sends `PUT`/`DELETE` from the known state instead of `toggle`, which a retry could reverse.
- The availability check is not locked against a concurrent soft delete; such a favorite simply lists as unavailable.
- After login (or a reload), an open confirmation dialog reopens, as the human approver chose, because the shortlist stores the chosen card's ID. It reopens only while that card is still revealed, and focus returns to its `เลือกเมนูนี้` on close.

### Specification review

No blocking findings. All #46 routes, rules, response shapes, web scope, anonymous behaviour, accessibility, required tests, and acceptance criteria are implemented. Notes:
- Only MenuItems are favoritable; no Restaurant favorites, folders, sharing, analytics, or ranking were added.
- No route accepts a client-supplied `userId`.

### Review scope

- Diff: `git diff main...feat/46-menu-item-favorites`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/engineering-guidelines.md`
- Specification source: GitHub issue #46
- Checked: authorization and user scoping, idempotency and races, unavailable handling, response field exposure, cache scoping, the login round trip, focus and live regions, keyboard use, mobile layout, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #47 — Saved default recommendation preferences

### Status

Automated two-axis review complete on 2026-10-07. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain:
- The API module follows the existing layering and reuses `budgetRangeSchema`, `parseWithSchema`, the envelopes, and `requireAuth`. Unknown IDs use the same `400 VALIDATION_ERROR` field shape as recommendations.
- The web uses the generated client, TanStack Query (keyed by user, removed on logout), React Hook Form with `zodFormResolver`, and the shared `SelectField`, `ConfirmDialog`, `FormAlert`, and `PageShell`.
- `markSignedOut` and `isUnauthenticated` are now shared from `useCurrentUser` instead of living in the favorites hook.

Judgement calls accepted:
- A saved `null` means "not set" (`ไม่ตั้งค่า`), and that step stays unanswered in the flow. A saved `"ANY"` is a real "any" choice that the flow pre-selects. This extends the issue's contract and the data model (three `*Any` flags with check constraints), as the human approver chose after seeing the first pass label "not set" as `อะไรก็ได้`. Budget has no "any", because the flow always asks for a range.
- Prefill is display-then-commit: a default is shown as selected but enters the flow's session state only on `ถัดไป`, so the preference itself is never copied into browser storage.
- The upsert relies on Prisma's native database upsert for a single unique `where`, so first saves cannot collide.
- The all-empty error sits on the first field, so it is linked to a field and receives focus, as the issue requires.

### Specification review

No blocking findings. All #47 routes, field rules, contract, web scope, behaviour, copy, accessibility, required tests, and acceptance criteria are implemented. Notes:
- The `ไม่ตั้งค่า` / "any" split and showing no note on prefilled steps are the human approver's choices. The earlier budget label `งบเท่าไหร่ก็ได้` was retired with the split.
- The account link text now matches the page title `ค่าเริ่มต้นการสุ่มเมนู`.
- No multiple profiles, sensitive data, ranking, auto-save, or import/export was added.

### Review scope

- Diff: `git diff feat/46-menu-item-favorites...feat/47-saved-preferences`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/engineering-guidelines.md`
- Specification source: GitHub issue #47
- Checked: authorization and user scoping, strict field allowlist, master-data validation, idempotency, cache and storage scoping, prefill semantics, focus and live regions, keyboard use, mobile layout, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Issue #48 — Selected MenuItem history

### Status

Automated two-axis review complete on 2026-10-07. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain:
- The API module follows the existing layering, reuses `requireAuth`, `parseWithSchema`, the paged envelope pattern, and `menuItemNotFoundError`. It shares the MenuItem summary and availability rule with favorites through `menu-items.summary.ts`, instead of importing across feature modules.
- The web uses the generated client and TanStack Query (keyed by user and page, removed on logout), the shared `Pagination`, `QueryListState`, and `ConfirmDialog`, and a shared `MenuSummaryRow` for favorites and history.
- Focus is moved explicitly after clearing, avoiding the #47 issue where a dialog returns focus to a control that is about to change.

Judgement calls accepted:
- The success stage never waits for the history write; a failure is only a warning.
- The confirmation is remembered with the shortlist (`confirmed`), so a reload shows success instead of asking again and never records the same decision twice (human approver's choice). A new flow still records a repeat selection, as the issue requires.
- The unavailable badge uses the approved history wording on both account pages (human approver's choice).

### Specification review

No blocking findings. All #48 routes, contracts, rules, web scope, confirmation integration, copy, accessibility, required tests, and acceptance criteria are implemented. Notes:
- Only the selected MenuItem ID is sent and stored; no conditions, rejected IDs, or shortlists.
- Account deletion cascades history through the existing schema relation.
- There is no per-item delete, analytics, export, or administrator access.

### Review scope

- Diff: `git diff feat/47-saved-preferences...feat/48-selected-history`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/engineering-guidelines.md`
- Specification source: GitHub issue #48
- Checked: authorization and user scoping, write timing and duplicates, unavailable handling, response field exposure, pagination, cache scoping, focus and live regions, keyboard use, and out-of-scope boundaries

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## MVP browser-test fixes

### Status

Automated two-axis review complete on 2026-10-06. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain:
- **Reuse:**
  - The fixes use existing tokens (`--surface`) and the shared button styles.
  - The new URL-filter logic is a pure, tested module (`lib/urlFilters.ts`) behind a hook with the same shape as `useState`, so both admin pages swap one line and keep their page clamping and selection reset.
- **Search box:** the draft follows the applied search by adjusting state during render, as React recommends, rather than in an effect.
- **Design system:**
  - The MenuItem table again meets the rule that the extra-wide card fits it without horizontal scrolling.
  - The header, dialog, image-ratio, and admin-table rules were updated before the code.

Judgement calls accepted:
- **Header width:** two header links lose some side padding on phones only (`max-sm:px-3`), so the admin header stays one row at 375 px. A single link is unchanged.
- **MenuItem columns:** the menu and Restaurant name minimum widths dropped one step (`min-w-40`, `min-w-28`). Those names already wrap, and the change makes room for the actions column.
- **Filter history:** URL filter changes replace the history entry, so Back leaves the page rather than stepping through filters.

### Specification review

No blocking findings. Every item from the MVP browser-test report is addressed with the human approver's choices:
- Both header links for ADMIN.
- The session note only for anonymous visitors.
- Audit-log Thai labels only.

The audit log still never shows an actor's email (#49). The audit-log page's own filters are not in the URL; that is out of scope.

### Review scope

- Diff: `git diff main...fix/mvp-ui-polish`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/design-system.md`, and `docs/03-implementation/engineering-guidelines.md`
- Checked: table layout at three desktop widths, the header at 320 and 375 px, dialog surfaces, the dialog height on short screens, role-based header links, session-note visibility, audit-label mapping with unchanged filter values, URL parsing of invalid input, page clamping, and search-box focus

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD

## Guaranteed no-match suggestion

### Status

Automated two-axis review complete on 2026-10-06. Human pull-request approval remains pending.

### Standards review

No documented-standard violations remain:
- **Pure logic:** the suggestion rules are a pure module (`recommendations.suggestion.ts`) with a written correctness argument, so they can be tested without a database. `priceInBudget` mirrors `budgetWhere`, which is documented next to both.
- **Repository:** it keeps all Prisma access. `availableWhere` is shared by the candidate query and the new pool query, so "available" means the same thing in both.
- **Contract:** the API returns structured values only, and the web owns the Thai sentence (`suggestionMessage`), as before.
- **Docs:** they changed before the code. The journey priority, prototype copy, activity diagram, and contract examples all describe the new behaviour.

Judgement calls accepted:
- **In-memory search:** the suggestion is computed in memory from one narrow query of every available item, instead of up to 15 count queries per request. The worst case (500 items, four fields changed) measured under 1 ms. The pool grows with the catalog, which is a few hundred campus menus.
- **Rename:** `relaxation` was renamed to `suggestion` rather than kept alongside it, because the web is the only client.
- **Repository test:** the "unrestricted filters" test now checks `findCandidates`, since `countCandidates` was removed with its only caller.

### Specification review

No blocking findings. The approved decisions are all implemented and covered by tests:
- Multi-change `suggestion` with complete `conditions`.
- Budget nearest in either direction, up first.
- Zone, taste, and food type move to the specific option with the most results.

The guarantee (a suggestion whenever an available item exists) is argued in code, checked by a 300-case property test, and confirmed against every combination in the live catalog. Rejected and displayed IDs stay excluded, mandatory filters are never broken silently, and the one-card replacement still never suggests a change.

### Review scope

- Diff: `git diff main...feat/no-match-suggestion`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/02-design/user-journey.md`, and `docs/03-implementation/engineering-guidelines.md`
- Checked: guarantee and minimality, field priority, budget direction, tie-breaks, unchanged "any" fields, exclusions, the replacement path, response shape and OpenAPI, the performance worst case, web copy and apply behaviour, and the phone layout

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD
