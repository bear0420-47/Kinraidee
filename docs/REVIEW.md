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

No documented-standard violations remain. Instead of copying MenuItem's image validation into Restaurant, the rule moves to the uploads module, which already owns the upload key and `/uploads` URL contract. Both DTOs now spread `imageReferenceFields` and use the same refinement and column mapping. The change stays inside the DTO layer: controllers, services, repositories, and audit snapshots are untouched. Judgement call accepted: `imageUrl` is written as one refined nullable string instead of a union, so the generated OpenAPI type is `string | null` rather than `string | unknown`. Validation behavior is the same, and only the error message for an invalid URL is more general.

### Specification review

No blocking findings. #41 requires saving an uploaded `imageKey`/`imageUrl` on a Restaurant, which #39 explicitly scoped out. This change adds exactly that, using the data-model rule already applied to MenuItem in #42: an external URL keeps `imageKey = null`, and a local upload stores its generated key with the matching URL. The #39 behaviors its tests still check are unchanged: HTTP(S)-only external URLs, and an external URL clearing an earlier key.

### Review scope

- Diff: `git diff origin/main...fix/39-restaurant-local-images`
- Commit: `fix(api): accept uploaded images on restaurants`
- Standards sources: `AGENTS.md`, `rule.md`, `docs/plan.md`, `docs/03-implementation/data-model.md`, and `docs/03-implementation/engineering-guidelines.md`
- Specification sources: GitHub issues #39, #40, and #41
- Image key/URL integrity, external URL scheme validation, MenuItem regression risk, and the OpenAPI contract

### Approval

Human reviewer: Pending pull-request review
Decision: Pending
Date: TBD
