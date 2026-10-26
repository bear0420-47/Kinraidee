# Implementation Plan

## Desktop and mobile meal results — 2026-10-26

The human asked to prioritize UX/UI on both web and mobile, deferring multiple-taste behavior. Browser inspection at 1366×900 and 390×844 showed the condition-entry title and repeated progress badge consuming result-screen space; optional Google evidence preceded primary menu actions. Refine only presentation using the existing shell, grid, and cards. Previous affected plan/design artifacts are archived under `evidence/archive/20261026-responsive-meal/`.

```txt
Module: existing meal result presentation and PageShell
Requirement/backlog ID: F2, F3, F4, F7; B2, B3, B4, B7; NFR2, NFR12
Legal requirement ID: LR2, LR3; existing provider attribution stays visible
Design artifact: existing result-card and mobile layout rules; journey steps 3-5 unchanged
API routes: unchanged POST /api/recommendations and existing place details
Web pages: /meal; all other PageShell callers retain their existing title
Personal data: no changes to session state, storage, logs, providers, or retention
Authorization: existing anonymous and account permissions unchanged
Tests: full web regression, build/TypeScript, lint, changed-code formatting; browser layout checks at desktop, phone, and 320px; card selection and confirmation
```

Scope checklist complete. Allow the existing shell's title to be omitted when its child supplies the page heading. The result grid owns one h1 and receives focus as before; condition pages retain their existing heading/progress. Remove the redundant result badge, retain the no-match status explanation, and place existing menu actions before optional Google evidence. Preserve single-taste selection, current result count and ranking, all filters, explicit confirmation, replacement/undo, provider attribution, and responsive grid behavior. This does not implement all-catalog alternatives or native apps.

## Show closest menus immediately — 2026-10-26

The human approved the proposed no-match experience with “ลองปรับตามนั้นดู”: display up to three closest menus immediately, name differences on each card, preserve the original filters, and keep condition editing secondary. This supersedes the explicit suggestion-apply step below. Prior approved artifacts are preserved under `evidence/archive/20261026-closest-menus/`.

```txt
Module: existing meal no-match orchestration, shortlist, cards, and confirmation
Requirement/backlog ID: F1-F7, F19-F21; B1-B7, B24-B26; OA3; NFR3, NFR8, NFR9, NFR12
Legal requirement ID: LR1, LR2, LR3, LR7
Design artifact: all five artifacts in docs/02-design; journey steps 3-5
API routes: reuse unchanged POST /api/recommendations and existing public place details
Web pages: /meal
Personal data: existing session-only conditions and shortlist; optional closestConditions in the same sessionStorage record; no database, logs, or telemetry change
Authorization: existing anonymous flow and account/history permissions unchanged
Tests: automatic bounded fallback, immediately revealed cards, per-menu differences and budget boundaries, original filters across edit/reload/login, confirmation, replacement/exclusions/undo, empty catalog, stale suggestion, failure and duplicate-request guards; full build/test/lint
```

Scope checklist complete. Reuse the API's approved minimal-change suggestion and existing shortlist request, with at most one automatic follow-up after an empty initial result. Closest means fewest changed fields, then the existing zone/budget/taste/food-type priority and nearest budget range; it does not claim geographic distance or semantic food similarity. Preserve the original answers and store only the server-suggested retrieval conditions with the existing shortlist for consistent replacements and reloads. Open alternative cards immediately and compare their actual fields/prices against the original answers on cards and confirmation; hide rationale/AI copy calculated against alternate retrieval conditions. Normal matching cards retain their current reveal behavior. Replacement/undo retains the alternative context and reveals replacements immediately. A missing suggestion or a now-empty follow-up shows the existing empty state; failures preserve the original answers and offer retry without recursive fallback. Pending state covers both requests. No API, database, dependency, production deployment, or new persistent storage surface is needed.

## Fewer UX Actions — 2026-10-26

The human requested fewer required actions, then explicitly asked to apply the refinement to no-match recovery as well. Implement the reviewed pointer progression and direct summary-edit return together with inline no-match recovery. This supersedes the former separate no-match panel with an extra manual-edit action. The preceding plan and affected approved design artifacts are preserved in `evidence/archive/20261026-ux-actions/`.

```txt
Module: existing meal conditions, summary editing, and no-match recovery
Requirement/backlog ID: F1, F2, F3, F6, F7; B1, B2, B3, B6, B7; NFR2, NFR8, NFR12
Legal requirement ID: LR2, LR3, LR7
Design artifact: journey step 2 and no-match recovery; existing ChoiceStep, summary, and no-match patterns
API routes: unchanged POST /api/recommendations and public master-data queries
Web pages: /meal
Personal data: unchanged transient session conditions; no new fields, telemetry, storage, or retention
Authorization: existing public flow, account permissions, and provider credentials unchanged
Tests: pointer progression; keyboard arrows and explicit Next; existing/prefilled choice activation; direct edit return; no-match inline edit, explicit suggestion apply, null suggestion, pending controls, request errors, retries, and unchanged filter/confirmation boundaries
```

Scope checklist complete: reuse ChoiceStep, its four wrappers, MealPage, ConditionSummary, NoMatchPanel, existing session state, and validated server suggestions. Pointer activation selects and advances; keyboard arrow selection stays on the question with explicit Next. Summary edits return directly to the summary. A no-match response keeps the existing answer rows editable and shows its explanation inline, with one primary retry using the explicitly named server suggestion. It never applies a suggestion automatically. When no suggestion exists, answer editing remains available without a useless retry action. No backend, schema, dependency, or deployment change is required.

## UI Draft Alignment — 2026-10-26

The human project owner requested that the React web UI follow `wireframe.html` and explicitly confirmed that target on 2026-10-26. This authorizes the existing Home mood board and food imagery, superseding the earlier Home implementation decision to omit food photos. The previous plan is preserved in `evidence/archive/20261026-ui-draft-alignment/plan.md`.

```txt
Module: existing public web presentation and shared navigation/buttons
Requirement/backlog ID: F1-F7, F18; B1-B7, B23; existing approved visual artifacts
Legal requirement ID: LR2, LR3, LR7, LR8
Design artifact: prototype.md approved visual language; design-system.md tokens; wireframe.html Home, choice panels, and result cards; user-journey.md unchanged
API routes: existing routes unchanged; no new requests or provider calls
Web pages: / and /meal; shared header/button styling on existing account/admin pages
Personal data: no new fields or processing; existing sessionStorage lifetime, account data, and deletion rules unchanged
Authorization: public core workflow remains anonymous; existing account/admin guards and header visibility unchanged
Tests: existing route/auth, conditions, shortlist/reveal/reject/undo, confirmation, and account suites; repository verify, format, and historical prototype suite; browser visual review if a browser is available
```

Scope checklist completed before implementation: reuse HomePage, SiteHeader, Button, PageShell, ChoiceStep, and MenuCard; reuse the four existing prototype food assets as illustrative imagery; use approved tokens and Phosphor icons; preserve keyboard behavior, workflow order, data ownership, permissions, API contracts, and session retention. No feature, schema, dependency, or production deployment changes are required. The meal page uses the existing PageShell with an unframed appearance to avoid nesting choice/result cards inside another paper card.

Regression correction: the original HEAD comparison passed all 51 logout/account tests, while the changed Home exposed logout clearing the user before the Home transition committed. Preserve the existing logout contract by supplying React DOM's `flushSync` to the existing RouterProvider and using the installed `flushSync` navigation option to commit Home before clearing account caches. The shared test-render helper supplies that same implementation; no test assertion or expectation changes. This is a necessary compatibility fix for the updated Home, not a new authentication flow.

## Status

Approved — the AI-assisted selection and Google Places amendment was approved on 2026-10-24. The Firebase Hosting, Cloud Run, and Neon deployment architecture was approved on 2026-10-25. Creating or exposing production resources still requires separate explicit approval.

## Build Boundary

- Build the full application with React, Express, PostgreSQL, and Prisma using the stack locked in `docs/03-implementation/engineering-guidelines.md`.
- The public meal-recommendation workflow remains available without login.
- Registered users and administrators share the `User` model with `USER` and `ADMIN` roles.
- Authentication uses email/password, Argon2id password hashes, and a JWT stored in an HTTP-only cookie with a 7-day lifetime.
- Administrators manage zones, food types, tastes, restaurants, and menu items through protected APIs and admin screens.
- Catalog and account data are stored in PostgreSQL through Prisma.
- The web application deploys to Firebase Hosting as a static Vite React SPA with SPA fallback. Hosting rewrites `/api/**` to Cloud Run so browser traffic stays on one origin.
- The Express API deploys as a stateless container to Cloud Run in `asia-southeast1` (Singapore), with `min instances = 0`, `max instances = 2`, one CPU, 512 MiB memory, concurrency 20, and a 30-second request timeout unless verification proves a change is required.
- The approved production PostgreSQL provider is Neon in or nearest to Singapore. Cloud Run uses a pooled runtime connection; Prisma migrations use a direct connection. Prisma migrations and application queries remain provider-neutral PostgreSQL.
- Google Secret Manager stores database credentials, JWT secret, provider keys, and initial administrator credentials. Artifact Registry stores the Cloud Run image.
- Restaurant and menu-item images accept approved external URLs in every environment. Development/test may also use the internal `/uploads` directory; PostgreSQL stores only image keys and delivered URLs, never image blobs. Production internal uploads remain disabled until durable object storage is implemented.
- Recommendation conditions and rejected menu-item IDs remain in web `sessionStorage`; they are not persisted in PostgreSQL.
- The recommendation API is stateless and receives current conditions and rejected menu-item IDs with each request.
- Registered users can save menu-item favorites, one set of default zone, food type, taste, and budget preferences, and selected-menu history.
- Persistent food exclusions and detailed recommendation telemetry remain pending their separate privacy, retention, and schema decisions.
- GPS, latitude/longitude, ordering, payment, delivery fulfillment, user-published public reviews, external restaurant/menu catalog import, Google photos, promotions, and delivery fees remain out of scope.
- The existing 13 active restaurants and 222 active menu items remain the authoritative catalog; 130 currently have photos and are recommendable under the existing photo rule. This amendment does not add another restaurant/menu import pipeline.
- Gemini may select the initial shortlist only after the existing mandatory rules produce a restaurant-diverse eligible pool. Its provider path is optional and always has deterministic fallback.
- Google Places may enrich a revealed mapped restaurant with transient live details and provider-returned reviews. PostgreSQL stores only the optional unique Place ID, not live ratings, hours, reviews, Maps URIs, photos, or response payloads.
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
15. Request production deployment approval separately before creating or exposing Firebase Hosting, Cloud Run, Neon production data, Secret Manager secrets, Artifact Registry images, or future production object-storage resources.

## AI And Google Places Amendment Sequence

The amended requirements and this plan were approved separately on 2026-10-24. Application-code implementation may proceed; production deployment remains separately gated.

1. Approve F20, F21, amended NFR1, NFR13, NFR14, NFR15, B25, and B26. Completed 2026-10-24.
2. Approve this implementation-plan amendment separately from the requirements approval. Completed 2026-10-24.
3. Extend server environment validation for `GEMINI_API_KEY`, `GEMINI_MODEL`, and `GOOGLE_PLACES_API_KEY`, with explicit disabled/fallback behavior and no client exposure.
4. Add the optional unique `Restaurant.googlePlaceId`, its Prisma migration, contracts, and catalog-source support. Do not add rating, review, hours, Maps URI, or provider-payload columns.
5. Add a one-time matcher for the existing 13 restaurants. Persist only unambiguous Place IDs; require human resolution for ambiguous or missing candidates.
6. Create two provider seams with production and fake adapters: `AiShortlistSelector` with a Gemini adapter, and `PlaceDetailsProvider` with a Google Places adapter. Keep timeout, provider payload mapping, and provider errors inside the adapters.
7. Deepen the recommendation module: run existing hard filters and exclusions, preselect at most six restaurant-diverse candidates, make at most one Gemini call for eligible initial three-card requests, strictly validate selected IDs/reasons, and use deterministic fallback for timeout, provider error, malformed output, invalid selection, pools of three or fewer, and one-card replacement.
8. Add public `GET /api/restaurants/:restaurantId/place-details`. It reads the stored Place ID, requests current details only after reveal, returns a minimized attributed response, and degrades to an unavailable state without blocking the core flow.
9. Update `/meal` cards and confirmation content to distinguish genuine AI selection from deterministic rationale and to show Google Places loading, success, and unavailable states without using Google photos.
10. Add focused tests for hard-filter invariants, restaurant diversity, the max-six and one-call cost guard, strict AI response validation, deterministic fallback, replacement/small-pool bypass, Place ID mapping, live-details minimization, required attribution, timeout/error behavior, and secret/log/bundle scans.
11. Run `pnpm verify`, `pnpm format`, `node tests/wireframe-requirements.test.cjs`, requirement/design audits, and review; record exact results and pre-existing failures in `docs/verification.md`.
12. Keep production deployment behind its existing separate human approval, including accountable review of transient Google reviewer attribution before public production.

## Deferred Work

- Persistent food exclusions or allergy-related profiles.
- Detailed recommendation telemetry, including displayed shortlists, rejected menu-item IDs, and full recommendation-session conditions.
- GPS and distance-based recommendation.
- Group voting.
- Promotions and delivery fees. Ratings are covered by the Google Places amendment; wait-time data remains outside the product scope.
- External restaurant/menu catalog import. Google Places is used only for mapped live enrichment of the existing catalog.
- Consent evidence schemas unless an approved feature activates consent requirements.
- Computer Crime Act traffic-retention schemas unless accountable legal review confirms applicability.
- Self-service password reset, email delivery, and password-reset token flows.
- Registered-user password-change flow.
- Cloudflare R2 or another durable production object-storage integration. Until then, production accepts approved external image URLs and does not enable internal uploads.

## Implementation Decisions

- Gemini model update (2026-10-24): the configured `gemini-2.5-flash-lite` returned `404 NOT_FOUND` and Google's API stated that it is no longer available to new users. The implementation uses `gemini-3.5-flash-lite`, the replacement named by the provider response, while keeping the model environment-configurable and preserving the same one-call/token/fallback guards.
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
- The session notice was removed from the conditions screen and prototype on 2026-10-07 at the human approver's request; the recommendation session behavior remains unchanged. The human approver also approved the prototype's Home hero copy, without food photos.
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
  - `/account/favorites` lists favorites newest first with photo, names, Restaurant, and price. An unavailable favorite shows the `เมนูนี้ไม่พร้อมใช้งานแล้ว` badge with an icon and can still be removed. (Issue #48 aligned this wording with the approved history copy.)
- Issue #47 preferences API (`/api/preferences`) sits behind `requireAuth` for any role and always uses the token's user ID.
  - `PUT` is a full replacement: all four fields (`budget`, `zoneId`, `foodTypeId`, `tasteId`) are required, and at least one must be set. Any other field, such as `userId` or allergy data, is a `400`.
  - Each field is `null` for "not set". `tasteId`, `foodTypeId`, and `zoneId` also accept `"ANY"`, a saved "any" choice. `budget` has no "any", because the meal flow always asks for a budget range. This extends the issue's contract, as the human approver chose on 2026-10-07. The database keeps the ID columns and their foreign keys, and adds `tasteAny`, `foodTypeAny`, and `zoneAny` flags (see `docs/03-implementation/data-model.md`).
  - An unknown master-data ID is a `400 VALIDATION_ERROR` naming the field; `"ANY"` needs no record.
  - It upserts on the unique `userId` with no nested writes, so Prisma issues a native `INSERT … ON CONFLICT` and two first saves cannot collide. `DELETE` removes the row and is idempotent (`204`).
- Issue #47 web preferences:
  - Every select on `/account/preferences` starts with `ไม่ตั้งค่า` (not set, saved as `null`). Taste, food type, and zone then offer `อะไรก็ได้` / `ที่ไหนก็ได้`, saved as `"ANY"`, before their records. This replaces the first pass, where the "any" labels meant "not set" and an all-"any" save was refused; the human approver chose the split on 2026-10-07, and the earlier budget label `งบเท่าไหร่ก็ได้` is no longer used.
  - The page title and the account link read `ค่าเริ่มต้นการสุ่มเมนู`. A save with all four fields `ไม่ตั้งค่า` never calls `PUT`: it shows `เลือกอย่างน้อยหนึ่งค่า หรือกดล้างค่าเริ่มต้น` on the first field and focuses it. Choosing "any" everywhere is a valid save. Clearing asks for confirmation first. `ล้างค่าเริ่มต้น` is always shown (disabled, with the reason, when nothing is saved), as the human approver chose on 2026-10-07 so the action is discoverable.
- Issue #48 recommendation history API (`/api/recommendation-history`) sits behind `requireAuth` for any role and always uses the token's user ID.
  - `POST { menuItemId }` (strict) records one selection. It returns `404 MENU_ITEM_NOT_FOUND` for an unknown item and `409 MENU_ITEM_UNAVAILABLE` for a deleted item or one under a deleted Restaurant, reusing the favorites rules. Every confirmation adds a row; nothing is deduplicated.
  - `GET` is paged (`page` 1, `pageSize` 20, at most 100) and sorted by `selectedAt` then `id`, newest first. It includes unavailable rows with `available: false`, and returns only the MenuItem summary.
  - `DELETE` removes every row of the current user (`204`, idempotent) and never touches MenuItems.
  - No recommendation conditions, rejected IDs, displayed shortlists, or session data are stored.
- Issue #48 web history:
  - History is written only when a signed-in user presses `เอาเมนูนี้แหละ`, never on reveal, on opening the dialog, or on `ขอคิดอีกที`. Anonymous users skip it silently.
  - The success stage shows at once and never waits for the write. A failed write shows `เลือกเมนูสำเร็จ แต่บันทึกประวัติไม่สำเร็จ` as an announced warning, and `กลับหน้าหลัก` still works.
  - The shortlist remembers the confirmation (`confirmed`) next to `chosenMenuItemId`, so a reload before `กลับหน้าหลัก` shows the success stage again and never records the same decision twice (human approver's choice, 2026-10-07). A new flow can still record the same menu again.
  - `/account/history` (`ประวัติเมนูที่เลือก`) lists selections newest first, with the selected date, paged with the shared pagination controls. `ล้างประวัติทั้งหมด` is always shown, disabled when there is no history, and deletes only after confirmation.
  - Favorites and history share one menu-row component and the approved unavailable badge `เมนูนี้ไม่พร้อมใช้งานแล้ว` (human approver's choice).
  - The preference is cached only in the query cache, keyed by user and removed on logout, and is never written to `localStorage` or `sessionStorage`.
  - Prefill is display-then-commit. For a signed-in user with a preference, an unanswered step shows the saved default as selected (a saved "any" selects `อะไรก็ได้` / `ที่ไหนก็ได้`), and `ถัดไป` commits it to the flow like any other answer. The user can choose differently on every step, and an answer the user already gave, including "any", always wins. A `ไม่ตั้งค่า` field stays unanswered, and a default whose record no longer exists is dropped. Prefilled steps show no extra note (human approver's choice). Anonymous users get no preference request and no defaults.
- MVP browser-test fixes (2026-10-06), web only with no API or data-model change:
  - The MenuItem admin table no longer overflows its `1240px` card: food-type names wrap. Restaurant table labels no longer break mid-word.
  - ADMIN accounts get `บัญชีของฉัน` beside `จัดการระบบ` in the header.
  - Dialogs are opaque, and the confirmation photo is `16:10` so the dialog fits short laptop screens.
  - The preferences zone select is labelled `พื้นที่`, matching the meal flow.
  - Audit-log action and record types use Thai labels. The actor's email stays out of the audit log, as #49 requires.
  - Restaurant and MenuItem admin filters are kept in the URL, so they survive a reload.
- No-match suggestion (human approver's decision, 2026-10-06). It replaces #54's single-field `relaxation` with a guaranteed `suggestion`:
  - When nothing matches, `POST /api/recommendations` returns the fewest filter changes that produce at least one result, as `suggestion: { changes, conditions, resultCount }`. Single changes come before pairs, and so on, in field priority zone, budget, taste, food type.
  - Budget moves to the nearest range in either direction, trying up first. Zone, taste, and food type move to the specific option with the most results, not to "any". A field the user left as "any" is never changed.
  - The suggestion is `null` only when no active, non-excluded menu item exists, and for one-card replacements.
  - The web shows every change in one sentence, and `ใช้เงื่อนไขนี้แล้วสับใหม่` shuffles with the suggested `conditions`.
  - The API computes the suggestion in memory from one query of every active, non-excluded item, rather than one count query per option.
- Seeded catalog photos (human approver's decision, 2026-10-06). It replaces #30's rule that seeded images stay `null`:
  - Each restaurant and menu item in `catalog.seed.json` has an `image` entry: its photo in `assets/catalog/` and a fixed generated upload key.
  - When local uploads are on (development and test, never production), the seed copies the 12 photos into `LOCAL_UPLOADS_DIRECTORY` before its transaction and stores `imageKey` plus `/uploads/<key>`. A missing photo stops the seed before any write, and fixed keys keep repeated runs unchanged.
  - With local uploads off, records keep their approved external URL or `null`, as before.
  - Re-running the seed still resets seeded records' images to these values, as it does for every seed-managed field.
- Navigation and fresh-setup fixes (human approver's decision, 2026-10-07), from a teammate's report on a fresh clone of `main`:
  - Every page except Home shows a `หน้าแรก` header link, `บัญชีของฉัน` links `กลับหน้าแรก`, and the cards view adds `เริ่มใหม่`, which clears the flow and shows question 1.
  - The web dev server is pinned to port 5173 (`strictPort`). Before, a busy port moved Vite to 5174, which the API's CORS allowlist refuses, so the taste step showed `โหลดตัวเลือกไม่สำเร็จ`.
  - The API stops with the startup error when its port is in use. Before, Express 5 passed the error to the listen callback, which logged `Kinraidee API listening` and exited.
  - A database seeded before the catalog-photo change keeps `null` images until the seed is re-run; `first-setup.md` now says to re-run it after pulling.
- Catalog source format (human approver's decision, 2026-10-22). It replaces the hand-edited flat `catalog.seed.json`, so tens to hundreds of restaurants can be added from screenshots:
  - The source is `src/api/prisma/data/catalog/`: `taxonomy.json` (zones, food types, tastes, each with a readable slug and its fixed CUID) and one `restaurants/<slug>.json` per restaurant with its menu items nested inside. Zones, food types, and tastes are referenced by slug.
  - `pnpm --filter api catalog:build` validates the source and generates `catalog.seed.json` in the unchanged flat shape, so the seed, the database, and the API do not change. Restaurant and menu-item IDs are derived from their slugs, so a slug must never be renamed once seeded. `catalog:build --check` fails when the generated file is out of date.
  - A dish photo is assigned by saving it as `assets/catalog/<restaurant-slug>/menus/<menu-slug>.(png|jpg|webp)` (a logo as `logo.*`). The build finds it and derives a stable upload key. It also writes `assets/catalog/photo-checklist.csv` listing every dish, its expected photo path, and whether the photo exists. Dishes without a photo keep `null` images and show the app's no-photo state.
  - Prices stay exact whole baht. Each restaurant records its `source` (for example `grab-screenshot`, the capture date, and whether prices include Grab's delivery mark-up). The human approver removed the `ownerConsent` field on 2026-10-24: for this educational project, restaurant names, menu names, and prices are treated as factual catalog data rather than personal data requiring consent. Grab-sourced data is used only for names and prices, with descriptions written by us; screenshots and Grab images are never committed. This decision does not waive third-party platform terms, image licences, trademark rules, or the separate production-deployment approval gate.
  - A menu item may carry a `review` note when something is unclear. The build refuses to generate the seed while any note remains (`--draft` builds anyway for checking).
  - The taxonomy grows to fit Thai dishes: new food types `noodles`, `pizza-flatbread`, `curries-soups`, `salads-yum-somtam`, `grills-steaks`, `hotpot-bbq`, `desserts`, and `drinks`, and new tastes `sweet` and `sour`. Existing zones, food types, and tastes keep their CUIDs, so saved preferences keep working.
  - `desserts` and `drinks` are marked `hidden`: their records stay in the source files but the build leaves those food types and their menu items out of the generated seed, so they never reach the database or the meal flow until the flag is removed.
  - The previous 3 restaurants and 9 menu items are archived, not deleted: the seed moves to `src/api/prisma/data/archive/catalog.seed.2026-10-06.json` and their photos to `assets/catalog/_archive/`. The archive is also the fixture for the seed tests, so their counts no longer depend on the live catalog. Until the first new restaurant is added, the catalog may have no restaurants; the seed then creates only the administrator and the taxonomy.
  - The seed soft-deletes (`deletedAt`) any archived restaurant or menu item a database seeded earlier still has active, unless the current catalog uses the same ID, so old databases match the current catalog without being wiped. Favorites and history that point at those records are kept (human approver's decision, 2026-10-23).
- Dish photos (human approver's decision, 2026-10-23):
  - Photos are Unsplash stock photos stored as hotlinked image URLs (`imageUrl`), as the Unsplash API requires, so nothing large is committed and they also show in production, where internal uploads are off. No schema or API change.
  - `src/api/prisma/data/catalog/photos.json` holds a pool of up to 5 approved photos per **dish-name key** (carbonara and bolognese are separate keys); each menu item names its key in `photo`. Every restaurant using a key gets its own fixed photo from the pool in restaurant-slug order, so the same dish at two shops looks different while one dish always shows the same photo on cards, in the dialog, favorites, and history. Size variants of one dish share a key and a photo. A dish's own file in `assets/catalog/` still wins over the pool. An empty pool records that stock photos have no match for that dish.
  - `pnpm --filter api catalog:photos search|apply` finds candidates through the Unsplash API (`UNSPLASH_ACCESS_KEY`, development only, never used by the app; demo keys allow 50 requests an hour, so searches run in hourly batches), writes approved picks, and reports each approved photo to Unsplash's download endpoint as its guidelines require; `catalog:build` validates the pools and writes `assets/catalog/PHOTO-CREDITS.md`.
  - Stock photos show a `ภาพประกอบ` label, and the cards view credits Unsplash (`design-system.md`). Pexels was the first choice, but it paused new API keys on 2026-10-23.
  - Second source (human approver's decision, 2026-10-23): dishes Unsplash matches poorly (often Thai dishes) are also searched through Openverse (`catalog:photos search-openverse`, no key), limited to Wikimedia Commons and Flickr photos under CC0, public domain, CC BY, or CC BY-SA, which allow commercial use and cropping. Those photos are hotlinked from upload.wikimedia.org or live.staticflickr.com, and each shows `© creator · licence` linking to its source page on the photo itself, from `src/web/src/generated/photoCredits.json` (written by `catalog:build`, checked by `--check`).
- Photo required for recommendation (human approver's decision, 2026-10-24): a menu item is offered by `POST /api/recommendations` only when it has an image (`imageUrl` not null), for both candidates and the no-match suggestion pool, so every recommended card shows a photo. Items without a photo stay in the database, in the admin lists, and in favorites and history; they become eligible as soon as a photo is added. No schema or response change.

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
Tests: request validation and normalization, master-data validation, mandatory filters, soft-delete exclusion, shortlist limits, restaurant diversity, randomization invariants, rejected/displayed exclusion, response minimization, no-match suggestion (originally single-field relaxation priority; see the no-match suggestion decision), replacement no-result behavior, public route, OpenAPI, and warm p95 measurement
```

## AI And Google Places Implementation Note

```txt
Module: AI-assisted recommendation selection and live restaurant-place details
Requirement/backlog ID: F20, F21; B25, B26; existing F1-F5, F19
Legal requirement ID: LR1, LR3, LR7; provider attribution terms
Design artifact: feature list; user journey steps 3-4; design-system result cards; prototype reveal pattern; D1, D3, D4
API routes: POST /api/recommendations; GET /api/restaurants/:restaurantId/place-details
Web pages: /meal
Personal data: transient meal conditions sent to Gemini; transient Google reviewer attribution returned to the browser; neither is persisted or logged
Authorization: public, using the existing anonymous core flow; provider credentials remain server-only
Tests: hard-filter invariants, max-six/one-call cost guard, strict AI response validation, deterministic fallback, replacement and small-pool bypass, Place ID mapping, live-details minimization, attribution, timeout/error behavior, and secret/log/bundle scans
```

## Local API environment loading

- API development/start and maintenance scripts use Node's optional `--env-file-if-exists=.env`, so local commands load `src/api/.env` without a shell-specific `source` step while deployed environments can continue injecting variables.
- `prisma.config.ts` loads the same optional local file before Prisma evaluates `env("DATABASE_URL")`; this restores the direct setup commands documented in `first-setup.md` without adding a runtime dependency.
- Development logging uses `pino-pretty` with colors and readable local timestamps. Test logging remains silent, and production keeps structured JSON for log aggregation.

## Deployment Decisions

- Google Cloud project: use the human-owned project with available credits. Enable billing alerts and quotas before public traffic.
- Web hosting: Firebase Hosting in the same Google Cloud project. Deploy the Vite output as static assets, configure React Router SPA fallback, and rewrite `/api/**` to the Cloud Run API.
- Same-origin contract: build production web with `VITE_API_BASE_URL` set to the Firebase Hosting origin. The Hosting rewrite preserves the current HTTP-only `SameSite=Lax` authentication design without exposing the Cloud Run URL to browser code as a separate origin.
- API hosting: Cloud Run in `asia-southeast1` (Singapore). Deploy a reproducible container, keep the API stateless, expose `/health`, allow unauthenticated network access for public routes, and continue enforcing authentication and roles inside the application for protected routes.
- Cloud Run cost guard: start with `min instances = 0`, `max instances = 2`, one CPU, 512 MiB memory, concurrency 20, and a 30-second request timeout. Revisit only from recorded load or memory evidence.
- Database hosting: Neon PostgreSQL in or nearest to Singapore. Runtime uses a pooled SSL connection and migration/maintenance commands use a direct SSL connection. Do not run migrations or seed during normal API container startup.
- Migration and seed: run `prisma migrate deploy` as a controlled deployment job. Run `prisma db seed` only for initial provisioning or an explicitly approved catalog update. Initial administrator credentials exist only in the job's secret environment.
- Secrets: Google Secret Manager owns `DATABASE_URL`, the direct migration URL, `JWT_SECRET`, `GEMINI_API_KEY`, `GOOGLE_PLACES_API_KEY`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD`. No provider key uses a `VITE_` variable or enters the web bundle.
- Container registry: Artifact Registry stores the API image. Cloud Run deploys an immutable image revision and retains the previous healthy revision for rollback.
- Provider restrictions: restrict the Places key to Places API and the Gemini key to its required API where Google supports the restriction. Configure quotas and budget alerts before production traffic.
- Development/test image storage: internal ignored directory served from `/uploads`; uploads require an authenticated administrator, validate actual image type and size, and use generated filenames.
- Production images: approved external image URLs only. Cloud Run local disk is ephemeral, so `LOCAL_UPLOADS_ENABLED=false`; the upload route and `/uploads` static serving remain unavailable in production.
- Firebase Hosting auth cookie: production uses the reserved `__session` cookie name because Hosting forwards that cookie to Cloud Run rewrites while stripping other cookie names. Its approved `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, and seven-day lifetime remain unchanged.
- Production CD: pushes to `main` authenticate from GitHub Actions to Google Cloud through repository-and-branch-restricted Workload Identity Federation. The workflow builds an immutable API image, applies approved Prisma migrations, deploys Cloud Run, builds and deploys Firebase Hosting, then performs non-mutating smoke checks. It never runs the seed automatically. CI remains pull-request-only and is not duplicated inside CD.
- Future durable object-storage integration must preserve the `imageKey`/`imageUrl` contract. Soft deletion keeps the referenced image; replacement removes a superseded internally owned object only after the database safely points to the new object.

## Deployment Sequence

The human approved production deployment on 2026-10-26. Steps 1-9 completed that day; verification and operational follow-up remain recorded below.

1. Add Neon direct-connection configuration while keeping the pooled runtime connection separate.
2. Add a reproducible multi-stage API `Dockerfile`, `.dockerignore`, and Artifact Registry/Cloud Build commands. Completed in the repository on 2026-10-25; no cloud resource was created.
3. Add Firebase project configuration, static asset rules, SPA fallback, and `/api/**` rewrite to Cloud Run. Completed in the repository on 2026-10-25; no Firebase resource or preview channel was created.
4. Create the Neon database in or nearest to Singapore and store pooled/direct URLs only in approved secret stores. Completed 2026-10-26.
5. Create Google Secret Manager entries and a least-privilege Cloud Run runtime identity. Completed 2026-10-26.
6. Build and push the immutable API image to Artifact Registry. Completed 2026-10-26.
7. Run the controlled Prisma migration job, then the one-time seed job, and verify 13 active restaurants, 222 active menu items, and seven verified Place IDs. Completed 2026-10-26.
8. Deploy Cloud Run with the approved limits and verify `/health` before directing Hosting traffic to it. Completed 2026-10-26.
9. Build the web with the Firebase Hosting origin as `VITE_API_BASE_URL`, then deploy Hosting and its Cloud Run rewrite. Completed 2026-10-26.
10. Run production smoke tests for SPA refresh, anonymous recommendation, login/cookie behavior, protected administration, Gemini selection/fallback, Google Places success/unavailable states, mobile layout, and secret/log scans.
11. Record exact commands, revisions, URLs without secrets, migration result, seed result, costs/quotas, and smoke-test evidence in `docs/verification.md`.
12. If verification fails, route Cloud Run traffic to the previous healthy revision and roll Firebase Hosting back to its previous release. The nullable Place ID migration remains backward-compatible.

## Neon Connection Implementation Note

```txt
Module: Prisma deployment connection configuration
Requirement/backlog ID: B10; approved Deployment Sequence step 1
Legal requirement ID: LR7
Design artifact: N/A — deployment configuration only
API routes: N/A
Web pages: N/A
Personal data: no new data; database credentials remain server-side secrets
Authorization: migration jobs are operator-only; the Cloud Run runtime receives only the pooled runtime URL
Tests: Prisma schema validation with separate pooled/direct URLs and local direct-URL fallback; full repository verification
```

- `DATABASE_URL` is the pooled runtime connection used by Prisma Client in Cloud Run.
- `DIRECT_DATABASE_URL` is the non-pooled connection used by Prisma Migrate and controlled maintenance jobs. It is not required in the Cloud Run runtime secret set.
- Local development falls back from `DIRECT_DATABASE_URL` to `DATABASE_URL`, because local PostgreSQL does not use a separate pooler endpoint.

## Deployment Boundary

- Development and verification run locally by default.
- Creating or exposing Firebase Hosting, Cloud Run, Neon production data, Secret Manager secrets, Artifact Registry images, or future production object-storage resources is treated as public production deployment.
- The human explicitly approved and executed the initial production deployment on 2026-10-26.
- Computer Crime Act Section 26 traffic-log applicability remains pending accountable human/legal review. Deployment does not silently treat the conditional requirement as inapplicable.
- Do not implement traffic-log storage before that confirmation. `AuditLog` is not a substitute for legal traffic logs.
- If Section 26 applies, approve a separate traffic-log schema, required fields, access rules, security controls, and retention configuration before production deployment.
