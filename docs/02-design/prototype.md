# Kinraidee Prototype

## Status

Draft — 2026-09-06. Pending human approval.

## Artifact

`wireframe.html` at the repository root — a single self-contained lo-fi HTML prototype. Open it directly in a browser; there is no build step and no server.

Automated checks: `node --test "tests/**/*.test.cjs"` runs `tests/wireframe-requirements.test.cjs`, which asserts the prototype's filter and session behaviour against the requirements.

Lo-fi is deliberate. The prototype tests the **flow**, not the polish.

## Screens

| # | Screen | Anchor in `wireframe.html` | Journey steps | Realizes |
|---|---|---|---|---|
| 1 | **Home** — value statement and a single start action, no sign-in anywhere. | `#home` | 1 | F6, LR2 |
| 2 | **Conditions** — four step cards revealed one at a time: budget → taste → food type → zone, with a progress track and a recap before submitting. | `#decision` | 2 | F1, NFR4 |
| 3 | **Shortlist** — up to three result cards, each with price, zone, available decision details, and a one-line reason; per-card reject with an undo bar; shuffle; edit-conditions and new-session actions; an empty state that names the constraint to relax. | `#results` | 3, 4, 5 | F2, F3, F4, F5, F7, F12, NFR3, NFR8, NFR9 |
| 4 | **Confirmation** — a focused dialog naming the chosen meal, restaurant, and price. | `#meal-overlay` | 5 | F7 |

## Behaviour the prototype demonstrates

- Budget, taste, food type, and zone are **mandatory filters**; every displayed result satisfies all of them (NFR8).
- A round renders `pool.slice(0, 3)` — at most three choices, fewer when fewer records match (F2, NFR3).
- Rejecting adds the item to a session-only `rejected` set, so it cannot reappear while another qualifying record exists (F4, F5, NFR9). Rejection is undoable.
- "Start a new session" clears conditions and the rejected set (F7).
- Shuffle draws only from the already-filtered pool — never from the whole catalog (F12).
- No sign-in, no account, no personalization consent anywhere in the flow (F6, LR2). The conditions screen states that conditions and rejected choices stay only in the open page session.
- Registered-user favorites, selected-menu history, and saved default settings are full-app supporting features; they are not part of this no-login prototype flow.
- Every result card carries a rationale line; imagery is labelled as generated reference photography and is not presented as the restaurant's actual serving (F3).
- Keyboard operability: `:focus-visible` rings on every control, focus is moved deliberately after a rejection, and state changes are announced in a live region (NFR12).

## Dataset

45 synthetic menu items across five balanced food types (9 each), described in `assets/food/datasets/image-dataset.json`. Synthetic and non-personal — no real restaurant's personal data is committed.

## Not yet covered by the prototype

| Gap | Requirement | Reason |
|---|---|---|
| Authorized data administration screens | F8, LR8; B8 | Approved for the full-app build but not represented in this no-login prototype |
| Registered user library screens | F14, F15, F17, F18; B19, B20, B22, B23 | Approved for the full-app build but outside this no-login prototype |
| Session-only GPS location | F9, LR5 | Won't have in the first release; manual `Zone` selection is used instead |
| Temporary food exclusions | F10, LR4; B12 | Sensitive-data assessment required first |
| Non-repetitive alternative slot | F11; B13 | Ranking evidence not yet gathered |
| Consent and agreement evidence records | LR14, LR15, LR16; B15 | Activation depends on whether consent or Terms are used |
| Data-subject access, correction, deletion | LR6, LR9; B16 | No persistent personal data exists in the prototype |
| Traffic-log retention | LR10, LR11, LR12, LR13; B17 | Section 26 applicability needs accountable confirmation |
| Restaurant diversity in a shortlist | F19, B24, charter §5.2 | The existing prototype predates F19 and does not enforce it. Measured: 2 of 25 full shortlists return three items from one restaurant. The full app must fill distinct restaurant slots first when enough qualifying restaurants exist. |
| Measured p95 response time | NFR1 | Requires the real API and the defined test environment, not a static page |

These are gaps by design, not oversights. They are listed so the W5 gate can see them.

## Design-system conformance

Every colour, radius, and size in the prototype resolves to a token in `design-system.md`. That file was written **from** this prototype; if either changes, both are corrected in the same change.
