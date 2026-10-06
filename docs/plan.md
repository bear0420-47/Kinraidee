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
- Issue #53 serves the condition flow at `/meal`, and Home's start action links there. The flow keeps `{ step, conditions }` in `sessionStorage` under `kinraidee:recommendation` and nothing else. The stored value is validated on every read, and anything malformed or from another version resets to a fresh flow. `conditions` uses the recommendation API's own `conditions` type, so #54 can send it unchanged. An unanswered field is absent, and `อะไรก็ได้` / `ที่ไหนก็ได้` is stored as `null`. A stored master-data ID that no longer exists counts as unanswered.
- Issue #53 reuses the existing Zone, FoodType, and Taste query hooks. They call the public list endpoints and share their cache with the admin pages.
- The human approver approved the session notice wording for the conditions screen on 2026-10-06: `ไม่ต้องเข้าสู่ระบบ คำตอบและเมนูที่ปฏิเสธจะอยู่เฉพาะในหน้าที่เปิดอยู่นี้` (from `wireframe.html`). This closes the specification's "confirm notice wording before implementation" item for browser session state. The human approver also approved the prototype's Home hero copy, without food photos.
- Until #54 connects the recommendation API, the condition summary shows `สับการ์ดเมนู` disabled, with the note `การสับการ์ดเมนูจะเปิดใช้งานเร็ว ๆ นี้`. This was the human approver's choice, so the summary layout is final now.
- Issue #54 connects `สับการ์ดเมนู` to `POST /api/recommendations` through a TanStack mutation, not a cached query, so every shuffle draws fresh. The flow's `sessionStorage` value adds an optional `shortlist`, which is the issue's allowlist:
  - The displayed card slots, each a returned item with its reveal state, or a `ไม่มีตัวเลือกเพิ่มแล้ว` slot.
  - `rejectedMenuItemIds`.
  - The one-step undo record.

  It is validated on read like the conditions. A no-match result is not stored, so a reload shows the summary again. Leaving the cards through `แก้เงื่อนไข` clears the shortlist and the rejected IDs, which starts a new recommendation session (F7).
- Issue #54 turns the structured rationale into Thai copy that never reads as a failed filter: `matchedBudget` → `อยู่ในงบที่เลือก`; a matched taste, food type, or zone → `ตรงกับรสชาติที่เลือก` / `ตรงกับประเภทอาหารที่เลือก` / `อยู่ในโซนที่เลือก`; an unrestricted one → `เปิดรับรสชาติได้หลากหลาย` / `เปิดรับอาหารได้ทุกประเภท` / `เปิดรับได้ทุกโซน`.
- Until #55 adds confirmation, a revealed card's `เลือกเมนูนี้` is shown disabled with `การยืนยันเมนูจะเปิดใช้งานเร็ว ๆ นี้`, the same pattern the human approver chose for #53. The card component already exposes a typed `onChoose` callback for #55.
- Issue #55 enables `เลือกเมนูนี้` (its accessible name is `เลือกเมนู {menu}`) and opens one two-stage dialog:
  - Stage 1, titled `เลือกเมนูนี้ใช่ไหม?`, shows the menu photo (or the card's fallback panel), the Thai and English names, restaurant, zone, price, and rationale. It reads only the item already returned by `POST /api/recommendations`, so opening it makes no request, and it shows no wait time.
  - `ขอคิดอีกที`, or Escape, closes the dialog. The chosen card is held only in page memory and the shortlist is never touched while the dialog is open, so the cards, reveal state, rejected IDs, and undo record are exactly as before, and focus returns to that card's `เลือกเมนูนี้`. (Issue #46 later stores the chosen card's ID; see below.)
  - `เอาเมนูนี้แหละ` switches the same dialog to the success stage, titled `ได้มื้อนี้แล้ว!`, with `ขอให้อร่อยกับ{menu} ที่{restaurant}` announced in a status region. `กลับหน้าหลัก` is its only action and receives focus. Escape on this stage does the same as `กลับหน้าหลัก`, since there is no earlier state to return to.
  - `กลับหน้าหลัก` removes the `kinraidee:recommendation` key (conditions, step, shortlist, reveal state, rejected IDs, and undo) and navigates to `/`, so the next flow starts at step 1. A fresh flow is never written to storage; the key is removed instead.
  - No history request is made in #55, for anonymous or signed-in users; #48 adds the signed-in history write at `เอาเมนูนี้แหละ`.
  - The two dialog titles and the success message are AI-proposed wording; the design pack fixes only the three action labels.
- `formatPrice` moves from the admin MenuItem schemas to `src/web/src/lib/formatPrice.ts`, so public cards do not import admin code.
- Issue #46 favorites API (`/api/favorites`) sits behind `requireAuth` for any role and always uses the token's user ID; no route reads a user ID from the request.
  - An unknown MenuItem returns `404 MENU_ITEM_NOT_FOUND` on every route. A MenuItem is unavailable when it, or its Restaurant, is soft-deleted; adding one (`PUT`, or a `toggle` that would add) returns `409 MENU_ITEM_UNAVAILABLE`, while removing it always works.
  - `PUT` is an upsert that keeps the original `createdAt`, `DELETE` removes any matching row, and `toggle` runs its read and write in one transaction. The availability check does not lock the MenuItem: a favorite saved at the same moment as a soft delete simply lists as unavailable, a state the list already supports.
  - The list is newest first (ties by MenuItem ID) and includes unavailable favorites with `available: false`. It returns only the MenuItem summary (names, price, image URL, and Restaurant names), never `imageKey`, `deletedAt`, or the Restaurant phone.
- Issue #46 web favorites:
  - The web always knows the current state from the favorites query, so it sends the deterministic `PUT` or `DELETE` rather than `toggle`, which a retry could reverse.
  - Revealed cards and the confirmation dialog show a round heart button in the photo's top corner: an outline heart when not saved and a filled heart on the `--ice` accent when saved, with `aria-pressed` and the labels `บันทึกเป็นเมนูโปรด` / `นำออกจากเมนูโปรด`, so the state is carried by shape and text, not colour.
  - An anonymous click goes to `/login?returnTo=/meal`, and the login page announces `เข้าสู่ระบบเพื่อบันทึกเมนูโปรด`. The recommendation flow stays in `sessionStorage`, so login returns to the same cards. Nothing is favorited automatically.
  - The human approver chose on 2026-10-07 to reopen the confirmation dialog after that login round trip, so a user who pressed the heart inside the dialog continues where they left off. The shortlist therefore also stores `chosenMenuItemId` (the ID only; the item comes from its slot).
    - The dialog reopens only while that card is still revealed in the shortlist, and only at the confirmation stage, never the success stage. A reload during confirmation reopens it the same way.
    - `ขอคิดอีกที` or Escape removes the ID, so the stored value matches the one before choosing; `แก้เงื่อนไข` and `กลับหน้าหลัก` clear it with the rest of the flow.
    - A reopened dialog has no opener, so closing it returns focus to that card's `เลือกเมนูนี้`. `Dialog` now treats `<body>` as no opener and uses its fallback.
    - For #48: a reload after `เอาเมนูนี้แหละ` but before `กลับหน้าหลัก` reopens the confirmation stage, so the history write must not depend on the dialog being shown only once.
  - The favorites query is keyed by the user ID and removed on logout. A `401` from it, or from a favorite request, is treated as signed out rather than as a flow error.
  - `/account/favorites` lists favorites newest first with photo, names, Restaurant, and price. An unavailable favorite shows a `ไม่พร้อมให้บริการ` badge with an icon and can still be removed.
- Issue #47 preferences API (`/api/preferences`) sits behind `requireAuth` for any role and always uses the token's user ID.
  - `PUT` is a full replacement: all four fields (`budget`, `zoneId`, `foodTypeId`, `tasteId`) are required, and at least one must be set. Any other field, such as `userId` or allergy data, is a `400`.
  - Each field is `null` for "not set". `tasteId`, `foodTypeId`, and `zoneId` also accept `"ANY"`, a saved "any" choice. `budget` has no "any", because the meal flow always asks for a budget range. This extends the issue's contract, as the human approver chose on 2026-10-07. The database keeps the ID columns and their foreign keys, and adds `tasteAny`, `foodTypeAny`, and `zoneAny` flags (see `docs/03-implementation/data-model.md`).
  - An unknown master-data ID is a `400 VALIDATION_ERROR` naming the field; `"ANY"` needs no record.
  - It upserts on the unique `userId` with no nested writes, so Prisma issues a native `INSERT … ON CONFLICT` and two first saves cannot collide. `DELETE` removes the row and is idempotent (`204`).
- Issue #47 web preferences:
  - Every select on `/account/preferences` starts with `ไม่ตั้งค่า` (not set, saved as `null`). Taste, food type, and zone then offer `อะไรก็ได้` / `ที่ไหนก็ได้`, saved as `"ANY"`, before their records. This replaces the first pass, where the "any" labels meant "not set" and an all-"any" save was refused; the human approver chose the split on 2026-10-07, and the earlier budget label `งบเท่าไหร่ก็ได้` is no longer used.
  - The page title and the account link read `ค่าเริ่มต้นการสุ่มเมนู`. A save with all four fields `ไม่ตั้งค่า` never calls `PUT`: it shows `เลือกอย่างน้อยหนึ่งค่า หรือกดล้างค่าเริ่มต้น` on the first field and focuses it. Choosing "any" everywhere is a valid save. Clearing asks for confirmation first.
  - The preference is cached only in the query cache, keyed by user and removed on logout, and is never written to `localStorage` or `sessionStorage`.
  - Prefill is display-then-commit. For a signed-in user with a preference, an unanswered step shows the saved default as selected (a saved "any" selects `อะไรก็ได้` / `ที่ไหนก็ได้`), and `ถัดไป` commits it to the flow like any other answer. The user can choose differently on every step, and an answer the user already gave, including "any", always wins. A `ไม่ตั้งค่า` field stays unanswered, and a default whose record no longer exists is dropped. Prefilled steps show no extra note (human approver's choice). Anonymous users get no preference request and no defaults.

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

## Issue #44 Implementation Note

```txt
Module: stateless meal recommendations
Requirement/backlog ID: F1, F2, F3, F4, F5, F6, F7, F12, F19; B1, B2, B3, B4, B5, B6, B7, B14, B24
Legal requirement ID: LR1, LR2, LR3, LR7
Design artifact: N/A — API-only implementation; no screen or workflow-order changes
API routes: POST /api/recommendations
Web pages: N/A
Personal data: none; transient meal conditions and exclusion IDs are processed without persistence or request-body logging
Authorization: public; anonymous and authenticated users use the same stateless endpoint
Tests: request validation and normalization, master-data validation, mandatory filters, soft-delete exclusion, shortlist limits, restaurant diversity, randomization invariants, rejected/displayed exclusion, response minimization, no-match relaxation priority, replacement no-result behavior, public route, OpenAPI, and warm p95 measurement
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
