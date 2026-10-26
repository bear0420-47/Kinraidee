# Kinraidee Core User Journey

Presentation refinement approved 2026-10-26: within the existing question and result steps, consolidate progress into the question header, expose a neighboring card edge and current position on mobile, and shorten card content through native details while keeping key facts and closest differences visible. Original-condition chips on results open the existing edit-question -> summary path, preserving other answers and clearing the previous shortlist before a new search. No journey step, confirmation, account requirement or recommendation rule changes.

## Status

Human-approved product-flow contract — synchronized with the approved specification; AI/Places behavior was approved on 2026-10-24 and automatic no-match behavior was approved on 2026-10-26. Visual style is approved separately in `design-system.md`.

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
| 3 | Submits the chosen conditions with the `สับการ์ดเมนู` action. Filters and exclusions run first. If none match, the backend automatically applies the fewest proven concrete condition changes and continues in the same request. A restaurant-diverse pool of at most six is then formed. When more than three candidates remain, Gemini selects and explains up to three; strict validation or deterministic fallback produces the final face-down cards. If conditions changed, an announced notice names every change above the cards. | Shortlist | F2, F3, F19, F20, F22, NFR3, NFR8, NFR13, NFR14 |
| 4 | Reveals cards one by one, uses `เปิดทั้งหมด`, selects a revealed menu, or rejects a revealed choice and receives a different qualifying choice. Revealing a mapped restaurant starts a non-blocking live Google Places details request. Rejected choices do not come back this session, and one-card replacement does not call Gemini. | Shortlist | F4, F5, F21, NFR9, NFR12, NFR13, NFR14 |
| 5 | Selects a revealed menu, reviews its confirmation details, then confirms the choice, returns to the shortlist, or starts a new session. Logged-in history is written only after confirmation. | Shortlist → Confirmation | F7, F15 |

## The one decision that changes the flow

At step 3, **are there any qualifying choices left?**

- **Yes** → show up to three and continue to step 4.
- **No** → find and apply the fewest filter changes guaranteed to produce at least one result, then return the shortlist and an explicit change notice in the same response. If no available menu remains, show the true no-match state with manual editing. Never invent a result or change a condition silently (F22, NFR8).

Automatic no-match adjustment (human approver's decision, 2026-10-26; algorithm retained from the approved 2026-10-06 suggestion):

- The API finds and applies the fewest filter changes that produce at least one result within the original initial-shortlist request. It tries every single-field change before any two-field change, and so on.
- Fields are tried in this priority, which keeps personal intent such as taste and food type stable before more flexible constraints:
  1. `Zone`
  2. `Budget`
  3. `Taste`
  4. `FoodType`
- A changed field gets a concrete value:
  - Budget moves to the nearest range that has results, trying one range up, then one down, then further out.
  - Zone, taste, and food type move to the specific option with the most results. Ties go to the record's display order.
- A field the user left as `อะไรก็ได้` / `ที่ไหนก็ได้` is never changed, because it cannot get any wider.
- An adjustment exists while at least one active photographed menu item is not excluded. It is absent only when the catalog has none left. One-card replacement requests never adjust conditions.

Automatic-adjustment and true no-match presentation:

- When adjustment succeeds, there is no confirmation action and no second recommendation request. The cards appear immediately with an announced sentence naming every changed field and its previous and effective value.
- The effective conditions replace the submitted conditions for the shortlist, subsequent one-card replacements, session storage, rationale, and condition editing.
- `แก้เงื่อนไข` remains available from the cards view.
- When no adjustment is possible because no available menu remains, show the no-match state with `แก้เงื่อนไขเอง`; Home remains reachable through the header.

## Notes

- Mobile presentation (human request, 2026-10-26): step 4 uses native horizontal swipe/snap browsing below 640px, showing one card at a time with a hint and numbered navigation for multiple slots. Swiping changes only the visible card. Existing reveal, choose, reject, undo and confirmation actions remain explicit, and desktop/tablet uses the existing grid. This is presentation within step 4, not a new journey step.

- Public pages show `เข้าสู่ระบบ` as a secondary/ghost action at the top-right of the header. Anonymous users can ignore it and start the core flow. After login, the same header slot becomes the account/admin entry point.
- `เข้าสู่ระบบ` navigates to a dedicated `/login` page; account creation uses a dedicated `/register` page. Do not use authentication modals in the first release.
- Authentication navigation preserves the current recommendation state in `sessionStorage` and includes a safe internal return target. After successful login, return the user to the page/step that initiated login; when login starts from Home, return Home.
- After authentication, the header action is `บัญชีของฉัน` for `USER` and `จัดการระบบ` for `ADMIN`. Do not show an administrator entry action to anonymous users or `USER` accounts.
- Every page except Home shows a visible `หน้าแรก` link in the header (icon only at phone width, with the same accessible name), so Home never depends on recognising the brand as a link. `บัญชีของฉัน` also links `กลับหน้าแรก` (human approver's decision, 2026-10-07).
- Administrator management routes use `/admin`, `/admin/zones`, `/admin/food-types`, `/admin/tastes`, `/admin/restaurants`, `/admin/menu-items`, and `/admin/audit-logs`.
- Anonymous access to `/admin/*` redirects to `/login` with a validated internal `returnTo`. Authenticated `USER` access redirects to `/account` with `บัญชีนี้ไม่มีสิทธิ์จัดการระบบ`. An authenticated `ADMIN` returns to the requested `/admin/*` route after login.
- Budget step uses quick ranges with no default selection: `ต่ำกว่า ฿50`, `฿50–100`, `฿101–200`, and `มากกว่า ฿200`.
- Budget API values are `UNDER_50`, `BETWEEN_50_100`, `BETWEEN_101_200`, and `OVER_200`. The first release does not provide a custom min/max budget input.
- Taste step lists admin-managed `Taste` master data sorted by `sortOrder`, plus a special `อะไรก็ได้` option that is not a database `Taste` record. The user selects at most one taste and no taste is selected by default.
- Food-type step lists admin-managed `FoodType` master data sorted by `sortOrder`, showing icons when available, plus a special `อะไรก็ได้` option that is not a database `FoodType` record. The user selects at most one food type and no food type is selected by default.
- Zone step lists admin-managed `Zone` master data sorted by `sortOrder`, plus a special `ที่ไหนก็ได้` option that is not a database `Zone` record. The user selects at most one zone and no zone is selected by default. GPS/current-location selection is not present in the first release.
- Condition summary uses the primary CTA `หาเมนูกัน`. Loading copy is `กำลังหาเมนูให้นะ…`.
- Pointer activation selects a condition and advances immediately, with an explanatory hint; keyboard arrow/Space selection stays on the question and explicit Next remains available for keyboard users and saved defaults. An edit opened from the summary returns directly after committing with pointer activation or `ใช้คำตอบนี้`.
- Shortlist presentation uses up to three face-down cards. Users can reveal cards individually or use `เปิดทั้งหมด`. A revealed card can be selected immediately without revealing the remaining cards.
- Card reveal does not call the recommendation API again. It reveals an item already returned by the stateless recommendation response, then may call `GET /api/restaurants/:restaurantId/place-details` for transient live Google Places evidence.
- If fewer than three choices match, show only the returned card count. Do not render empty placeholder cards.
- Initial shortlist and replacement both use the same stateless API contract, `POST /api/recommendations`. Initial requests ask for up to three cards; replacement requests ask for one card while sending rejected IDs and currently displayed IDs.
- Initial three-card requests may call Gemini once only when more than three eligible candidates remain. The provider receives at most six compact candidates and returns selected IDs with short reasons. Pools of three or fewer and one-card replacement requests bypass Gemini.
- The backend validates every AI-selected ID, count, duplicate, mandatory-filter invariant, and restaurant-diversity invariant. Timeout, provider failure, malformed output, or invalid selection uses the existing deterministic selection without blocking the flow.
- Reloading a stored shortlist restores it from `sessionStorage`; it does not request another AI selection.
- UI copy identifies `AI เลือกให้` only for a result genuinely selected by Gemini. Deterministic fallback uses the existing structured rationale and must not carry a false AI label.
- Google Places details load only after reveal for restaurants with a stored Place ID. Loading, missing mapping, incomplete data, timeout, or provider error leaves the recommendation card usable and shows an explicit unavailable state.
- Google ratings, opening information, Maps URI, and provider-returned reviews are transient and are not stored. Required Google and review-author attribution remains visible. Google photos are not used.
- Recommendation items include menu, restaurant, zone, food-type, taste, price, image, and structured rationale data in one response. The web converts structured rationale flags into localized user-facing copy.
- A successful automatic adjustment returns non-empty `items` with structured `adjustment` metadata containing each change (field, from, to), the complete effective conditions, and the matching-result count. The web owns the localized explanation copy and persists the adjustment with the shortlist. A true no-match returns `items: []` with `adjustment: null`.
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
