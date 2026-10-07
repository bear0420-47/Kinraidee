# Kinraidee Visual Prototype Reference

## Status

Visual style approved — 2026-09-28. Product flow and feature behavior shown inside `wireframe.html` are exploratory and are not approved by this status.

## Artifact Role

`wireframe.html` at the repository root is the visual reference for the first React/Tailwind implementation.

Use it to understand:

- Colour, typography, spacing, borders, radii, shadows, and doodle styling.
- Mobile-first layout density and responsive composition.
- The visual treatment of buttons, chips, step cards, result cards, dialogs, toasts, and imagery.
- Accessibility patterns such as visible focus, focus return, live-region feedback, and reduced motion.

Do not use it as a source of product requirements, API contracts, persistence rules, or approved user-flow steps. Those come from the specification, backlog, `user-journey.md`, data model, and implementation issues.

## Approved Visual Language

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

Recommendation reveal pattern: use a shuffle-card metaphor. The condition summary primary CTA is `สับการ์ดเมนู`; loading copy is `กำลังสับการ์ดเมนู...`; the result view shows up to three face-down cards. Users can reveal cards one by one, use `เปิดทั้งหมด`, or select an already revealed menu without revealing the rest. Revealing is a UI presentation state only; the API returns the complete filtered shortlist before any card is revealed.

Reject/undo pattern: rejecting a revealed card replaces that slot with one new face-down card and shows a `เลิกทำ` toast. Undo restores the original card in the same slot and reveal state, removes the replacement, and removes the original menu ID from the session rejected IDs.

Confirmation pattern: selecting a revealed card opens a two-stage dialog with menu name, restaurant, price, zone, image, and recommendation rationale. Stage 1 actions are `เอาเมนูนี้แหละ` and `ขอคิดอีกที`. `เอาเมนูนี้แหละ` confirms the decision and moves to a success state; `ขอคิดอีกที` returns to the same revealed-card state. The success state has one action, `กลับหน้าหลัก`, which clears the current flow and returns Home. Only confirmation by a logged-in user writes selected-menu history; revealing or opening a card does not.

No-match pattern: when no menu satisfies all selected conditions, suggest the fewest filter changes that are proven to produce at least one result (see `user-journey.md`). The message names every change, such as `ถ้าเปลี่ยนพื้นที่จาก “คชพล” เป็น “ตลาดฟ้าไทย” จะพบ 4 เมนู`, joining several changes with `และ`. The panel has two actions only: `ใช้เงื่อนไขนี้แล้วสับใหม่` and `แก้เงื่อนไขเอง`. If no menu is available at all, explain that the current catalog has no matching menu and show only `แก้เงื่อนไขเอง`; Home remains reachable through the header. The cards view has `แก้เงื่อนไข` and `เริ่มใหม่`; `เริ่มใหม่` clears the flow and returns to question 1.

## Mock Elements That Are Not Requirements

The following elements currently appear in `wireframe.html` but must not be implemented merely because they are visible there:

- Current-location/GPS actions or location-permission overlays.
- Allergy/profile exclusions or sensitive preference capture.
- Group voting controls and voting dialogs.
- Wait-time fields.
- Session-only favorites/history as a replacement for the approved registered-user persistence rules.
- Any account, password, or admin behavior not present in the approved specification and plan.

These elements may remain in the HTML as exploratory mock content until the reference artifact is cleaned up. They do not override Won't-have or deferred decisions.

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
- Do not call the recommendation API per card reveal; reveal state is client-side presentation for the already returned shortlist.
- If the implementation needs a visual value or component state missing from `design-system.md`, add and approve it there first.
- When `wireframe.html` conflicts with requirements or the data model, requirements and the data model win.

## Prototype Verification Boundary

The existing `tests/wireframe-requirements.test.cjs` verifies the historical interactive prototype. It is not sufficient verification for the React application and may cover exploratory behavior that is outside the first-release scope.

React implementation verification must be defined separately by QA and recorded in `docs/verification.md`.
