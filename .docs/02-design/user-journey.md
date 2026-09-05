# Kinraidee Core User Journey

## Status

Draft — 2026-09-06. Pending human approval.

## Scope

One core workflow only: **Get a meal shortlist** (the core feature in `feature-list.md`).

- Actor: meal seeker (a student choosing food alone under time, energy, or budget pressure).
- Precondition: active restaurant and menu data exists. No account, no sign-in.
- Success: the user leaves with one meal decided, within 60 seconds, unassisted (NFR2).

## Steps

| # | The user… | Screen | Traces to |
|---|---|---|---|
| 1 | Opens Kinraidee and starts without signing in. | Home | F6, LR2 |
| 2 | Chooses a budget, then a taste, then a food type, then an area — one short step at a time. An invalid value is rejected inline, naming the field, and the user stays on this step. | Conditions | F1, NFR4 |
| 3 | Sees up to three matching choices, each with price, area, wait time, and a one-line reason it was chosen. | Shortlist | F2, F3, NFR3, NFR8 |
| 4 | Rejects one that does not suit them and immediately receives a different qualifying choice. The rejected one does not come back this session. | Shortlist | F4, F5, NFR9 |
| 5 | Picks a meal and sees a confirmation — or edits the conditions, or starts a new session and begins again. | Shortlist → Confirmation | F7 |

## The one decision that changes the flow

At step 3, **are there any qualifying choices left?**

- **Yes** → show up to three and continue to step 4.
- **No** → say which single constraint to relax, and offer *edit conditions* or *start a new session*. Never invent a result and never break a mandatory filter (NFR8).

## Notes

- Steps 2–5 are keyboard-operable end to end with a visible focus indicator (NFR12).
- The user is told, on the conditions screen, that conditions and rejected choices stay only in the open page session (LR1, LR3).
- Everything else — location, food exclusions, favorites, group voting — is deferred and must not appear in this journey.

This step order is the contract. `diagrams.md` D4 and `prototype.md` must reproduce it exactly.
