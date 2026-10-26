# Kinraidee Visual Prototype Reference

## Status

Visual style approved — 2026-09-28. The AI/Places reveal pattern was approved by the human project owner on 2026-10-24. Product flow and feature behavior shown inside `wireframe.html` are exploratory and are not approved by this status.

## Artifact Role

`wireframe.html` at the repository root is the visual reference for the first React/Tailwind implementation.

Use it to understand:

- Colour, typography, spacing, borders, radii, shadows, and doodle styling.
- Mobile-first layout density and responsive composition.
- The visual treatment of buttons, chips, step cards, result cards, dialogs, toasts, and imagery.
- Accessibility patterns such as visible focus, focus return, live-region feedback, and reduced motion.

Do not use it as a source of product requirements, API contracts, persistence rules, or approved user-flow steps. Those come from the specification, backlog, `user-journey.md`, data model, and implementation issues.

## Approved Visual Language

Condition-choice amplification (human request, 2026-10-26): reuse ChoiceStep for all four questions, with a cream body, dark ink question band/cream heading, yellow step marker, and white ink-outlined choice cards with existing shadows. Selected cards show yellow and a check icon; keyboard focus remains explicit. Reuse existing type/spacing/color tokens and preserve copy, values, native radio behavior, pointer progression and keyboard Next. Result, Home and other screens retain their current appearance.

The approved visual direction is:

- Bright paper canvas with dark ink outlines.
- Friendly rounded body typography and decorative handwritten headings.
- Slightly irregular corners and offset shadows that resemble a notebook sketch.
- Food imagery framed as paper cards or mood-board material.
- Clear selected states using warm accent fills and dark outlined shadows.
- One strong primary action per screen.
- Mobile-first tap targets and layouts that remain usable at narrow widths.

Exact tokens and component rules live in `docs/02-design/design-system.md`.

## Reusable Visual Patterns

| Pattern | Wireframe reference | Intended implementation use |
|---|---|---|
| Header and brand | Main header / Kinraidee brand | Shared public navigation shell |
| Hero mood board | `#home` | Landing-page visual treatment |
| Step card | `#decision` panels | Condition-entry presentation after flow approval |
| Choice chip/card | Budget, mood, and type controls | Selectable filter controls |
| Doodle select | Area selector styling | Manual `Zone` selector; no current-location action |
| Result card | `#results-grid` | Menu recommendation results |
| Toast and undo | `#toast` | Rejection feedback and undo |
| Confirmation dialog | `#meal-overlay` | Selected-menu confirmation without wait-time fields |
| Empty state | `#empty-state` | No-match guidance |

The React implementation may reorganize markup and component boundaries. It must preserve the approved visual language and accessibility behavior, not the prototype's DOM structure.

Public header decision: anonymous public pages place `เข้าสู่ระบบ` at the top-right as a secondary/ghost action. It must not compete visually with the primary recommendation CTA. After authentication, the same position becomes the account/admin entry point.

Home link decision (2026-10-07): every page except Home shows a ghost `หน้าแรก` link with a house icon at the left of the header actions; at phone width only the icon shows, labelled `หน้าแรก`. The account landing page also has a `กลับหน้าแรก` text link.

Authenticated header decision: show `บัญชีของฉัน` for `USER` and `จัดการระบบ` for `ADMIN`. `จัดการระบบ` navigates to `/admin`; do not expose it to anonymous users or `USER` accounts. Authentication uses the shared `/login` page rather than a separate administrator login screen.

Authentication navigation decision: use dedicated `/login` and `/register` pages, not modal forms. Preserve recommendation state in `sessionStorage` while navigating to authentication. Successful login returns to the safe internal page/step that initiated login; login started from Home returns Home.

Budget visual options: show `ไม่เกิน ฿50`, `฿50–100`, `฿101–200`, and `มากกว่า ฿200` as quick-select chips/cards. No option is selected by default.

Taste visual options: render admin-managed `Taste` records ordered by `sortOrder`, plus a special `อะไรก็ได้` option. `อะไรก็ได้` is a UI filter choice, not a persisted `Taste` row.

Food-type visual options: render admin-managed `FoodType` records ordered by `sortOrder`, showing icons when available, plus a special `อะไรก็ได้` option. `อะไรก็ได้` is a UI filter choice, not a persisted `FoodType` row.

Zone visual options: render admin-managed `Zone` records ordered by `sortOrder`, plus a special `ที่ไหนก็ได้` option. `ที่ไหนก็ได้` is a UI filter choice, not a persisted `Zone` row. Do not show GPS/current-location controls in the first release.

Recommendation reveal pattern: use a shuffle-card metaphor. The condition summary primary CTA is `หาเมนูกัน`; loading copy is `กำลังหาเมนูให้นะ…`; the result view shows up to three face-down cards. Users can reveal cards one by one, use `เปิดทั้งหมด`, or select an already revealed menu without revealing the rest. The recommendation API returns the complete filtered shortlist before reveal. An AI-selected card shows `AI เลือกให้` and its short reason; deterministic fallback keeps the current rationale without an AI label.

Google Places evidence pattern: revealing a mapped restaurant begins a separate live-details request. Menu details and actions remain usable while the evidence panel loads. Success may show rating, rating count, opening information, a Maps link, and attributed provider-returned reviews. Missing mapping, timeout, provider error, or unavailable fields show a compact unavailable state and do not remove or replace the card. Google photos are not displayed.

Reject/undo pattern: rejecting a revealed card replaces that slot with one new face-down card and shows a `เอาเมนูเดิมกลับมา` toast. Undo restores the original card in the same slot and reveal state, removes the replacement, and removes the original menu ID from the session rejected IDs.

Stock photo pattern: dish photos taken from Unsplash show a `ภาพประกอบ` label on the photo, and the cards view credits Unsplash below the cards (see `design-system.md`).

Confirmation pattern: selecting a revealed card opens a two-stage dialog with menu name, restaurant, price, zone, image, and recommendation rationale. Stage 1 actions are `เอาเมนูนี้แหละ` and `ขอคิดอีกที`. `เอาเมนูนี้แหละ` confirms the decision and moves to a success state; `ขอคิดอีกที` returns to the same revealed-card state. The success state has one action, `กลับหน้าหลัก`, which clears the current flow and returns Home. Only confirmation by a logged-in user writes selected-menu history; revealing or opening a card does not.

No-match pattern: follow the OA3 closest-menu contract below. The former explicit suggested-filter apply step is superseded.

Condition interaction refinement approved on 2026-10-26: pointer activation selects and advances immediately; keyboard arrow/Space selection stays on the question with explicit Next. Explain this before the choices. Saved defaults remain reviewable, and activating an already-selected choice also advances. An edit opened from the summary returns directly after committing with pointer activation or `ใช้คำตอบนี้`.

## Mock Elements That Are Not Requirements

The following elements currently appear in `wireframe.html` but must not be implemented merely because they are visible there:

- Current-location/GPS actions or location-permission overlays.
- Allergy/profile exclusions or sensitive preference capture.
- Group voting controls and voting dialogs.
- Wait-time fields.
- Session-only favorites/history as a replacement for the approved registered-user persistence rules.
- Any account, password, or admin behavior not present in the approved specification and plan.

These elements may remain in the HTML as exploratory mock content until the reference artifact is cleaned up. They do not override Won't-have or deferred decisions.

## Closest menus — OA3, approved 2026-10-26

Mobile browsing amendment (2026-10-26): below 640px, step 4 presents one existing card at a time in a native horizontal swipe/snap rail rather than vertically stacking all cards. A multi-card swipe hint and numbered navigation expose the available positions; keyboard/button navigation complements touch. Native vertical page scrolling remains possible. Swiping does not reveal, reject, select, or confirm a menu. Existing buttons retain those actions. One slot hides the redundant pager; desktop/tablet retains the grid. Result counts, recommendation rules and journey order are unchanged.

Desktop/mobile presentation refinement (2026-10-26): the result heading is the page h1. Omit the condition-entry title and duplicate result-progress badge; retain the no-match status message. Choose/reject actions follow menu details and differences, before optional Google evidence. Use the same flow on phone and desktop with the existing responsive grid; no selection/ranking/API change.

Journey step 3 tries exact conditions, then loads the existing minimal-change suggestion once if empty. Show up to three revealed cards under `เมนูใกล้เคียงที่น่าลอง`, announce `ยังไม่มีเมนูตรงทุกข้อ ลองดูเมนูใกล้เคียงพวกนี้นะ`, preserve original filters, and offer `เปลี่ยนตัวเลือก` as secondary. Cards and confirmation show actual differences including budget excess; alternate-request rationale/AI claims are hidden. Step 4 replacement/undo keeps the same comparison context and exclusions. Step 5 requires explicit menu confirmation. Empty/error paths remain recoverable.

## Core Visual Screens

The first public visual implementation is expected to need these screen categories, subject to the separately approved journey:

1. Landing/home.
2. Condition entry.
3. Recommendation shortlist.
4. Selected-menu confirmation.
5. Empty/no-match state.

Registered-user and admin screens use the same tokens and component language, but require their own implementation issues and screen specifications.

## Conformance Rules

- Implement with React and Tailwind; do not copy the HTML wholesale.
- Translate design tokens into Tailwind theme values or shared CSS variables.
- Do not hardcode raw colours, radii, or shadows in individual screens.
- Do not copy prototype mock data or client-side business logic into production code.
- Do not call the recommendation API per card reveal; reveal state is client-side presentation for the already returned shortlist. A reveal may call the separate restaurant place-details route once for live evidence.
- If the implementation needs a visual value or component state missing from `design-system.md`, add and approve it there first.
- When `wireframe.html` conflicts with requirements or the data model, requirements and the data model win.

## Prototype Verification Boundary

The existing `tests/wireframe-requirements.test.cjs` verifies the historical interactive prototype. It is not sufficient verification for the React application and may cover exploratory behavior that is outside the first-release scope.

React implementation verification must be defined separately by QA and recorded in `docs/verification.md`.
