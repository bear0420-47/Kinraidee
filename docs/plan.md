# Implementation Plan

## Status

Approved — full-app build plan updated through 2026-09-28 decisions. Implementation work may begin from this plan; production deployment still requires separate approval.

## Build Boundary

- Build the full application with React, Express, PostgreSQL, and Prisma using the stack locked in `docs/03-implementation/engineering-guidelines.md`.
- The public meal-recommendation workflow remains available without login.
- Registered users and administrators share the `User` model with `USER` and `ADMIN` roles.
- Authentication uses email/password, Argon2id password hashes, and a JWT stored in an HTTP-only cookie with a 7-day lifetime.
- Administrators manage zones, food types, tastes, restaurants, and menu items through protected APIs and admin screens.
- Catalog and account data are stored in PostgreSQL through Prisma.
- The web application deploys to Cloudflare Pages as a static Vite React SPA.
- The Express API deploys to Koyeb as a stateless web service.
- The approved production PostgreSQL provider is Koyeb Serverless Postgres once production deployment is explicitly approved; Prisma migrations remain provider-neutral so the database can move to Neon or another PostgreSQL provider if production quota or reliability requires it.
- Restaurant and menu-item images accept approved external URLs in every environment. Development/test may also use the internal `/uploads` directory; PostgreSQL stores only image keys and delivered URLs, never image blobs. Production internal uploads remain disabled until durable object storage is implemented.
- Recommendation conditions and rejected menu-item IDs remain in web `sessionStorage`; they are not persisted in PostgreSQL.
- The recommendation API is stateless and receives current conditions and rejected menu-item IDs with each request.
- Registered users can save menu-item favorites, one set of default zone, food type, taste, and budget preferences, and selected-menu history.
- Persistent food exclusions and detailed recommendation telemetry remain pending their separate privacy, retention, and schema decisions.
- GPS, latitude/longitude, ordering, payment, delivery fulfillment, public reviews, and external restaurant-provider data remain out of scope.
- Schema decisions in `docs/03-implementation/data-model.md` are the source of truth for Prisma model implementation.

## Proposed Sequence

1. Confirm the requirements, full-app build boundary, and this implementation plan with the human approver.
2. Implement the locked Prisma models and migrations from `docs/03-implementation/data-model.md`.
3. Add database seed support for the initial administrator and approved catalog starter data.
   - Seed data includes the initial administrator, minimum master data, and local/demo sample restaurant/menu data. Admin UI remains the source for maintaining real catalog data.
   - The seeded administrator is the only administrator in the first full-app pass; no admin creation or role-management flow is implemented.
4. Implement authentication with email/password, Argon2id, JWT cookies, and `USER`/`ADMIN` authorization.
5. Implement protected admin modules for zones, food types, tastes, restaurants, and menu items.
6. Implement minimized `AuditLog` records for protected catalog mutations.
7. Implement the public catalog queries required by recommendation filtering and result display.
8. Implement the stateless recommendation API for conditions, shortlist, reject/no-repeat, edit, and new-session flows.
   - Apply F19 restaurant diversity after mandatory filters and rejected-item exclusions: fill distinct restaurant slots first, then allow repeated restaurants only when necessary.
9. Implement the public React meal flow using the approved user journey, design system, typed OpenAPI client, and `sessionStorage` state.
   - Implement against the human-approved user journey and visual baseline in `docs/02-design/`; do not treat exploratory behavior in `wireframe.html` as requirements.
10. Implement registered-user favorites, saved default recommendation preferences, and selected-menu history.
11. Implement React admin screens for catalog CRUD and audit-log review.
12. Add focused unit, integration, authorization, validation, recommendation, accessibility, and verification checks.
13. Run build, test, lint, typecheck, format, and required design/requirement audits; record exact results in `docs/verification.md`.
14. Complete `docs/REVIEW.md`, resolve findings, and request human approval for the pull request.
15. Request production deployment approval separately before creating or exposing public Cloudflare Pages, Koyeb API, Koyeb Postgres, or future production object-storage resources.

## Deferred Work

- Persistent food exclusions or allergy-related profiles.
- Detailed recommendation telemetry, including displayed shortlists, rejected menu-item IDs, and full recommendation-session conditions.
- GPS and distance-based recommendation.
- Group voting.
- Promotions, delivery fees, ratings, and external restaurant integrations. Wait-time data is outside the product scope.
- Consent evidence schemas unless an approved feature activates consent requirements.
- Computer Crime Act traffic-retention schemas unless accountable legal review confirms applicability.
- Self-service password reset, email delivery, and password-reset token flows.
- Registered-user password-change flow.
- Cloudflare R2 or another durable production object-storage integration. Until then, production accepts approved external image URLs and does not enable internal uploads.

## Implementation Decisions

- Issue #27 uses `supertest` as an API test-only development dependency. The human approver accepted this deviation from the initial preference to use existing packages because it removes custom HTTP server lifecycle helpers while leaving production code and runtime dependencies unchanged.
- Issues #29 and #31 use a minimum password length of 8 characters after trimming leading and trailing whitespace. Passwords have no uppercase, lowercase, number, or symbol composition requirement. Seed provisioning, registration, and login must apply the same normalization before hashing or verification.
- Issue #40 uses route-scoped Multer 2 memory storage and `file-type` magic-byte detection for development/test-only JPEG, PNG, and WebP uploads. Production keeps the upload/delete contract registered but returns `503 UPLOAD_STORAGE_UNAVAILABLE` before multipart processing; `/uploads/*` is not served in production.
- Issue #32 adds `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, and `jsdom` as web test-only development dependencies. The human approver accepted this before QA selects the wider component/E2E approach because the issue's required header, route-guard, focus, and keyboard tests need rendered components. Production code and runtime dependencies are unchanged.
- Issue #32 connects React Hook Form to Zod with a small local resolver (`src/web/src/lib/zodFormResolver.ts`) instead of adding `@hookform/resolvers`.
- Issue #32 redirects an authenticated visitor away from both `/login` and `/register`, honoring a validated `returnTo` before the role default. Login and registration complete through the same redirect, so there is one navigation path after authentication.
- Until their own issues add routes, unbuilt `/account/*` and `/admin/*` child paths render their guarded landing page. Anonymous access to those paths still redirects to `/login` with `returnTo`.
- Issues #35 and #37 share one icon-key rule (`src/api/src/shared/iconKey.ts`): a trimmed lowercase kebab-case key of at most 50 characters, and an empty or whitespace-only value normalizes to `null`. The human approver chose #35's empty-to-`null` behavior for both, so #37 deviates from its "reject empty keys" wording; SVG, HTML, URL, JSON, and other non-key input is still rejected.
- Issue #34 adds `@phosphor-icons/react`, the icon set approved by `engineering-guidelines.md`, as the web's first runtime icon dependency. Icons are imported one component at a time and always sit next to visible text.
- Issue #34 adds a small shared modal (`src/web/src/components/Dialog.tsx`) instead of a dialog library. It renders in a portal, marks the rest of the page `inert`, traps Tab, closes on Escape, and returns focus to the opener, or to a fallback control when the opener was removed (for example a deleted row). This implements the design-system dialog rules in a way the jsdom tests can check.
- Admin master-data forms (#34, #36, #38) use flat field names such as `nameTh` and `nameEn`, because the local form resolver maps errors by top-level field. The Zod schema transforms the flat values into the API body. Editing sends only the changed fields, and submitting an unchanged form closes it without a request, because the API rejects an empty `PATCH`.
- Issue #36 maps the approved FoodType icon keys to Phosphor icons in `src/web/src/lib/foodTypeIcons.tsx`, with `ForkKnife` as the suggested `utensils` fallback: `rice` → `BowlFood`, `noodles` → `BowlSteam`, `sandwich` → `Hamburger` (Phosphor has no sandwich icon), `soup` → `CookingPot`, `salad` → `Leaf`, and `sparkles` → `Sparkle`. The icon select offers only these keys. A stored key outside the registry (the API accepts any valid kebab-case key) is shown as the fallback icon with its raw key, and editing other fields leaves it unchanged.
- Issue #36 moves the parts it shares with the zones page into shared code: `ConfirmDeleteDialog`, `QueryListState`, `MasterDataPageShell`, `SelectField`, and `IconKeyLabel` in `components/`; `schemas/shared/masterDataFields.ts`; `lib/iconRegistry.ts`; and the `fakeCollectionApi` and `formQueries` test helpers.
- Issue #38 maps the approved Taste icon keys in `src/web/src/lib/tasteIcons.tsx`, with `ForkKnife` as the `fork-knife` fallback: `flame` → `Flame`, `leaf` → `Leaf`, `sparkles` → `Sparkle`, `heart` → `Heart`, and `bowl` → `BowlFood` (Phosphor has no plain bowl icon). Because FoodType and Taste records have the same shape, #38 moves their form, table, and schema into `components/IconMasterDataForm.tsx`, `components/IconMasterDataTable.tsx`, and `schemas/shared/iconMasterDataSchemas.ts`. The per-issue files (`TasteForm`, `TasteTable`, `tasteSchemas`, and the FoodType equivalents) are thin wrappers that supply the registry, entity label, and API types.
- Restaurant writes now accept development/test uploads, which #41 needs and #39 deliberately left out ("Do not set `imageKey` in this issue"). The human approver asked for this API fix before #41. MenuItem's image rule moves to `src/api/src/modules/uploads/imageReference.ts`, and Restaurant and MenuItem both use it. A record stores either an external HTTP(S) `imageUrl` with `imageKey = null`, or a generated upload `imageKey` with its matching `/uploads/<key>` `imageUrl`. An external URL or `null` always clears the key. MenuItem behavior is unchanged. `imageUrl` is one refined string, so the generated contract for both modules is `string | null` instead of `string | unknown`. The `/uploads` static route also sends `Cross-Origin-Resource-Policy: cross-origin`, overriding helmet's default `same-origin`, because the web app runs on another origin and browsers otherwise refuse to show uploaded images. Every other API response keeps `same-origin`, and uploads remain development/test only.
- Issue #41 keeps the master-data pattern: the form opens in the shared dialog, and the list adds filters and a shared `Pagination` component driven by the API's `meta`. Picking a file uploads it immediately so it can be previewed. `useSaveRestaurant` then owns the cleanup order. A failed create or update removes only the new upload. A successful save removes the replaced local image and any upload the form no longer uses. External URLs are never sent to upload deletion. Cancelling the form, or leaving through the in-app "leave this page?" prompt, removes an unsaved upload. A full page unload (tab close or reload) can only warn, through `beforeunload`, so an upload made just before it can remain on disk. The issue puts automatic orphan cleanup out of scope.
- Issue #41 shows the local-upload option and its control only when `import.meta.env.DEV` is true. Production bundles drop the control, and the API still rejects uploads there.
- Issue #41 generalizes shared web pieces: `ConfirmDialog` (delete and restore confirmations; `ConfirmDeleteDialog` now wraps it), `QueryListState` (takes `items` separately so paged responses work), the description-pair rule in `schemas/shared/masterDataFields.ts` (zones use it too), and `lib/imageUrl.ts` (resolves `/uploads` URLs against the API origin). The audit-log page keeps its own pagination for now and can adopt `Pagination` in its own change.
- Web tests replace jsdom's `FormData`/`File`/`Blob` with Node's implementations (`src/web/src/test/setup.ts`), because jsdom's versions cannot be sent through Node's `Request`. The test `FormData` still accepts a form element, which the audit-log page uses.
- The design-system fonts are self-hosted with Fontsource packages (`@fontsource-variable/nunito`, `@fontsource-variable/noto-sans-thai`, `@fontsource/delius-swash-caps`, `@fontsource/mali`; all SIL Open Font License). Vite bundles them, so no visitor IP address is sent to a font service. This resolves the font-loading limitation recorded for #32. The font stacks are CSS variables defined once in `src/web/src/styles.css`, and Tailwind's `font-body`, `font-display`, and `font-brand` read them. Admin routes set `data-area="admin"` on `<html>` (`components/AdminArea.tsx`), which switches headings, including those of portaled dialogs, to the body font. The wordmark uses `font-brand`, so it keeps Delius Swash Caps everywhere. The page language is now `th`, so browsers pick Thai fonts and line breaking for the Thai-first UI.
- Issue #43 reuses the #41 image flow instead of copying it. The restaurant-named image code moves to shared modules that Restaurant and MenuItem both use: `schemas/shared/imageFields.ts` (image modes, URL rule, form fields, and API body mapping), `hooks/admin/images/useImageUpload.ts` (upload and best-effort delete), `hooks/admin/images/saveWithImageCleanup.ts` (the cleanup order after a save, with `ImageSaveError`), `hooks/admin/images/useFormImageUpload.ts` (form upload state), `components/ImageSourceField.tsx`, `components/ImagePreview.tsx`, and the unsaved-changes guard (`hooks/admin/images/useImageFormGuard.ts` with `components/LeavePageDialog.tsx`). Restaurant behavior is unchanged. The issue's expected `useMenuItemImage.ts` and `MenuItemImageField.tsx` would only re-export these modules, so they are not added.
- Issue #43 loads Restaurant options by walking every page of `GET /api/restaurants` (100 per page, deleted included), so the selects stay complete regardless of catalog size. The filter lists every Restaurant and marks deleted ones; the form lists only active Restaurants.
- Issue #43 limits the price input to whole baht from 1 to 2,147,483,647, the largest value the `MenuItem.price` PostgreSQL `Int` column holds, so an oversized value is a field error instead of a server error.
- Issue #43 bulk selection covers the visible page and is cleared whenever the filters or page change. The 50-item API limit is enforced in the selection helpers, although a 20-row page cannot reach it today. Bulk delete leaves already-deleted items unchanged, as the API does; bulk restore is disabled while any selected item belongs to a deleted Restaurant.

## Evidence Expected

- Requirement decisions: `docs/01-requirements/intent.md`, the current specification under `docs/01-requirements/01-spec/`, and `docs/01-requirements/backlog.md`.
- Schema decisions: `docs/03-implementation/data-model.md`.
- Engineering and stack decisions: `docs/03-implementation/engineering-guidelines.md`.
- Implementation decisions and deviations: this file and the relevant implementation-ready GitHub issue.
- Verification commands and results: `docs/verification.md`.
- Bug, security, PDPA, and requirement review: `docs/REVIEW.md`.

## Issue #30 Implementation Note

```txt
Module: approved catalog starter-data seed and organized source assets
Requirement/backlog ID: F1, F2, F3, F8, F19; B1, B2, B3, B8, B24; OA1
Legal requirement ID: LR1, LR7
Design artifact: N/A — database seed only; no user-facing workflow or screen changes
API routes: N/A
Web pages: N/A
Personal data: no user personal data; one approved public restaurant contact number; source images contain no identifiable people
Authorization: seed execution is an operator-only setup action; no application route is added
Tests: complete fixture validation before writes, references and duplicate IDs, one transaction, idempotent upserts, exact taste relations, no deletion or silent deletedAt changes, and safe created/updated/unchanged counts
```

## Deployment Decisions

- Web hosting: Cloudflare Pages.
- Reason: the web app is a static Vite React SPA, Cloudflare Pages has no runtime cold start for static assets, its free tier is generous for static requests and bandwidth, and it supports team Git workflows.
- Web conditions: configure SPA fallback for React Router, set `VITE_API_BASE_URL` per environment, and do not use Pages Functions in the first full-app pass.
- API hosting: Koyeb.
- API conditions: deploy the Express API from Git or a reproducible container, keep it stateless, expose `/health`, store configuration in environment variables, do not depend on local disk persistence, and accept free-tier sleep/cold-start and resource limits until production requirements justify a paid deployment.
- Database hosting: Koyeb Serverless Postgres for the approved production environment.
- Database conditions: use the standard PostgreSQL connection string through Prisma, do not use Koyeb-specific database features in application code, commit all Prisma migrations, and reassess Neon or another PostgreSQL provider only if production quota, latency, capacity, or reliability becomes insufficient.
- Development/test image storage: internal ignored directory served from `/uploads`; uploads require an authenticated administrator, validate actual image type and size, and use generated filenames.
- Production image storage before the deferred R2 issue: approved external image URLs only. The local upload route and `/uploads` static serving remain disabled because Koyeb local disk is not durable application storage.
- Future durable object-storage integration must preserve the `imageKey`/`imageUrl` contract. Soft deletion keeps the referenced image; replacement removes a superseded internally owned object only after the database safely points to the new object.

## Deployment Boundary

- Development and verification run locally by default.
- Creating or exposing Cloudflare Pages, Koyeb API, Koyeb Postgres, or future production object-storage resources is treated as public production deployment.
- Do not deploy publicly until the human explicitly approves production deployment after verification, privacy review, and deployment review.
- Production deployment is blocked until an accountable human/legal reviewer confirms whether Computer Crime Act Section 26 traffic-log duties apply.
- Do not implement traffic-log storage before that confirmation. `AuditLog` is not a substitute for legal traffic logs.
- If Section 26 applies, approve a separate traffic-log schema, required fields, access rules, security controls, and retention configuration before production deployment.
