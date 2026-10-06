# Kinraidee Core User Journey

## Status

Human-approved product-flow contract — synchronized with the approved specification and confirmed on 2026-09-28. Visual style is approved separately in `design-system.md`.

## Scope

One core workflow only: **Get a meal shortlist** (the core feature in `feature-list.md`).

- Actor: meal seeker (a student choosing food alone under time, energy, or budget pressure).
- Precondition: restaurant and menu data with `deletedAt = null` exists. No account, no sign-in.
- Success: the user leaves with one meal decided, within 60 seconds, unassisted (NFR2).

## Steps

| # | The user… | Screen | Traces to |
|---|---|---|---|
| 1 | Opens Kinraidee and starts without signing in. | Home | F6, LR2 |
| 2 | Chooses a budget, then a taste, then a food type, then a zone — one short step at a time. An invalid value is rejected inline, naming the field, and the user stays on this step. | Conditions | F1, NFR4 |
| 3 | Submits the chosen conditions with the `สับการ์ดเมนู` action, then sees up to three face-down result cards. The API has already selected the complete filtered shortlist; revealing cards is presentation only. | Shortlist | F2, F3, F19, NFR3, NFR8 |
| 4 | Reveals cards one by one, uses `เปิดทั้งหมด`, selects a revealed menu, or rejects a revealed choice and receives a different qualifying choice. Rejected choices do not come back this session. | Shortlist | F4, F5, NFR9, NFR12 |
| 5 | Selects a revealed menu, reviews its confirmation details, then confirms the choice, returns to the shortlist, or starts a new session. Logged-in history is written only after confirmation. | Shortlist → Confirmation | F7, F15 |

## The one decision that changes the flow

At step 3, **are there any qualifying choices left?**

- **Yes** → show up to three and continue to step 4.
- **No** → suggest a filter change that is guaranteed to produce at least one result, or say that no menu is available at all. Never invent a result and never break mandatory filters silently (NFR8).

No-match suggestion (human approver's decision, 2026-10-06):

- The API suggests the fewest filter changes that produce at least one result. It tries every single-field change before any two-field change, and so on.
- Fields are tried in this priority, which keeps personal intent such as taste and food type stable before more flexible constraints:
  1. `Zone`
  2. `Budget`
  3. `Taste`
  4. `FoodType`
- A changed field gets a concrete value:
  - Budget moves to the nearest range that has results, trying one range up, then one down, then further out.
  - Zone, taste, and food type move to the specific option with the most results. Ties go to the record's display order.
- A field the user left as `อะไรก็ได้` / `ที่ไหนก็ได้` is never changed, because it cannot get any wider.
- A suggestion always exists while at least one active menu item is not excluded. It is absent only when the catalog has none left (for example, every item was rejected), and for one-card replacement requests.

No-match actions:

- Primary: `ใช้เงื่อนไขนี้แล้วสับใหม่` applies every suggested change at once (the suggestion's complete conditions) and calls the recommendation API again.
- Secondary: `แก้เงื่อนไขเอง` returns to the condition summary with all current selections preserved.
- Do not add a third Home action inside the no-match panel; Home remains reachable through the header's `หน้าแรก` link and the Kinraidee brand.

## Notes

- Public pages show `เข้าสู่ระบบ` as a secondary/ghost action at the top-right of the header. Anonymous users can ignore it and start the core flow. After login, the same header slot becomes the account/admin entry point.
- `เข้าสู่ระบบ` navigates to a dedicated `/login` page; account creation uses a dedicated `/register` page. Do not use authentication modals in the first release.
- Authentication navigation preserves the current recommendation state in `sessionStorage` and includes a safe internal return target. After successful login, return the user to the page/step that initiated login; when login starts from Home, return Home.
- After authentication, the header action is `บัญชีของฉัน` for `USER` and `จัดการระบบ` for `ADMIN`. Do not show an administrator entry action to anonymous users or `USER` accounts.
- Every page except Home shows a visible `หน้าแรก` link in the header (icon only at phone width, with the same accessible name), so Home never depends on recognising the brand as a link. `บัญชีของฉัน` also links `กลับหน้าแรก` (human approver's decision, 2026-10-07).
- Administrator management routes use `/admin`, `/admin/zones`, `/admin/food-types`, `/admin/tastes`, `/admin/restaurants`, `/admin/menu-items`, and `/admin/audit-logs`.
- Anonymous access to `/admin/*` redirects to `/login` with a validated internal `returnTo`. Authenticated `USER` access redirects to `/account` with `บัญชีนี้ไม่มีสิทธิ์จัดการระบบ`. An authenticated `ADMIN` returns to the requested `/admin/*` route after login.
- Budget step uses quick ranges with no default selection: `ไม่เกิน ฿50`, `฿50–100`, `฿101–200`, and `มากกว่า ฿200`.
- Budget API values are `UNDER_50`, `BETWEEN_50_100`, `BETWEEN_101_200`, and `OVER_200`. The first release does not provide a custom min/max budget input.
- Taste step lists admin-managed `Taste` master data sorted by `sortOrder`, plus a special `อะไรก็ได้` option that is not a database `Taste` record. The user selects at most one taste and no taste is selected by default.
- Food-type step lists admin-managed `FoodType` master data sorted by `sortOrder`, showing icons when available, plus a special `อะไรก็ได้` option that is not a database `FoodType` record. The user selects at most one food type and no food type is selected by default.
- Zone step lists admin-managed `Zone` master data sorted by `sortOrder`, plus a special `ที่ไหนก็ได้` option that is not a database `Zone` record. The user selects at most one zone and no zone is selected by default. GPS/current-location selection is not present in the first release.
- Condition summary uses the primary CTA `สับการ์ดเมนู`. Loading copy is `กำลังสับการ์ดเมนู...`.
- Shortlist presentation uses up to three face-down cards. Users can reveal cards individually or use `เปิดทั้งหมด`. A revealed card can be selected immediately without revealing the remaining cards.
- Card reveal does not call the recommendation API again. It only reveals items already returned by the stateless recommendation response.
- If fewer than three choices match, show only the returned card count. Do not render empty placeholder cards.
- Initial shortlist and replacement both use the same stateless API contract, `POST /api/recommendations`. Initial requests ask for up to three cards; replacement requests ask for one card while sending rejected IDs and currently displayed IDs.
- Recommendation items include menu, restaurant, zone, food-type, taste, price, image, and structured rationale data in one response. The web converts structured rationale flags into localized user-facing copy.
- Valid no-match responses return `items: []` with a structured `suggestion` object or `suggestion: null`. The suggestion lists each change (field, from, to), the complete suggested conditions, and the result count; the web owns the localized explanation and action copy.
- Rejecting a revealed card adds its `menuItemId` to the session rejected IDs and requests one non-duplicate replacement that excludes rejected IDs and menu items still displayed. The replacement enters the same card slot face-down.
- Reject feedback offers `เลิกทำ`. Undo removes the original ID from rejected IDs, removes the replacement, and restores the original card in its previous slot and reveal state.
- Confirmation shows menu name, restaurant, price, zone, image, and recommendation rationale. It does not show wait time.
- Confirmation has two stages. Stage 1 actions are `เอาเมนูนี้แหละ` and `ขอคิดอีกที`.
- `เอาเมนูนี้แหละ` writes `RecommendationHistory` only for logged-in users and moves to the success state. Anonymous confirmation never writes history to PostgreSQL. Merely revealing or opening a card never writes history.
- `ขอคิดอีกที` closes confirmation and returns to the same revealed-card state without writing history.
- Success state marks the flow complete and shows `กลับหน้าหลัก` as the only dialog action. `กลับหน้าหลัก` clears current conditions, rejected IDs, shortlist, reveal state, and replacement/undo state, then returns to Home. A new flow starts from Home, or from `เริ่มใหม่` on the cards view: it clears the same state and shows question 1 with no answers (human approver's decision, 2026-10-07). Leaving the cards for Home and pressing the Home CTA again resumes the unfinished flow.
- Steps 2–5 are keyboard-operable end to end with a visible focus indicator (NFR12).
- The user is told, on the conditions screen, that conditions and rejected choices stay only in the open page session (LR1, LR3).
- GPS/current location, food exclusions, registered-user library features, and group voting are outside this anonymous-first core journey and must not block it.
- `wireframe.html` supplies visual style only. Its exploratory profile, location, voting, wait-time, favorites, and history interactions do not modify this journey.

This step order is the contract. `diagrams.md` D4 and `prototype.md` must reproduce it exactly.
