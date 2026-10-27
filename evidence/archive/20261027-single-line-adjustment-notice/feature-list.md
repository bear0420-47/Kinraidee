# Kinraidee Feature List

Immediate-results amendment approved 2026-10-27: initial, replacement, restored and undone menu results are visible immediately; no face-down state, reveal action or Reveal all step. This supersedes historical reveal descriptions below. Existing edit/reset, direct condition edits, mobile paging, confirm-only history and all filtering remain. Existing non-blocking Places hooks run when a returned restaurant is displayed. The same five journey steps apply; steps 3-4 now show and compare menus directly.


## Status

Approved — synchronized with the approved backlog; AI/Places additions were approved by the human project owner on 2026-10-24 and automatic no-match adjustment was approved on 2026-10-26. Exactly one core feature is marked with `★`.

## Core release features

| Feature | Core | What it does | Traces to |
|---|:--:|---|---|
| **Get a meal shortlist** | ★ | Enter budget, taste, food type, and zone, then receive up to three qualifying choices, or immediately visible closest menus when none match; show price, zone, decision details, and each alternative's differences against the original filters. | F1, F2, F3; B1, B2, B3; OA3; P1, P3, P5, P6, P7, P8 |
| Reject and replace | | Reject a choice and get a non-duplicate replacement; a rejected choice does not return in the same session. | F4, F5; B4, B5; P3, P4 |
| Restart or edit the session | | Edit the conditions or start a new session, clearing rejected choices. | F7; B7; P1, P2 |
| Use it without an account | | The whole core workflow runs with no sign-in and no optional personalization consent. | F6, LR2; B6; P1 |
| Decide for me | | Pick one at random from the already-filtered results only. | F12; B14; P8 |
| Restaurant-diverse shortlist | | Fill distinct restaurant slots first when enough qualifying restaurants exist, then allow repeated restaurants only when necessary. | F19; B24; P3, P8 |
| AI-assisted shortlist selection | | After mandatory rules create a diverse eligible pool of at most six, Gemini selects and briefly explains the initial shortlist; strict validation and deterministic fallback preserve the existing rules. | F20; B25; OA2; NFR13, NFR14 |
| Live Google Places evidence | | Revealing a mapped restaurant can show current rating, rating count, opening information, Maps link, and attributed provider-returned reviews without storing the live payload. | F21, F16; B26; OA2; NFR14, NFR15 |
| Automatic no-match adjustment | | If an initial condition set has no menu, apply the fewest proven concrete changes in the same request, show the resulting shortlist immediately, and provide every original-to-effective change in a disclosure with a complete accessible announcement. | F22; B27; OA3; P1, P4, P8; NFR8 |
| Authorized data administration | | Create, update, and soft-delete restaurant and menu records behind authentication, role checks, and a minimized audit event. Soft-deleted records are excluded from public catalog and recommendation results. | F8, LR8; B8; OA1 |
| Registered user library | | Users can register, log in, save menu-item favorites, view selected-menu history, and save one set of default recommendation settings without blocking anonymous use. | F14, F15, F17, F18; B19, B20, B22, B23; LR1, LR2, LR3, LR6 |
| Privacy and legal controls | | Purpose notice, data minimization, purpose limitation, log hygiene, and the conditional consent, retention, and traffic-log duties. | LR1, LR3, LR6, LR7, LR9, LR13, LR14, LR15, LR16, LR17; B9, B15, B16, B17 |

The core feature is **Get a meal shortlist**. It removes the highest-count research pain (P1, 26/31 daily decision difficulty) and is the feature the survey majority asked for directly (P8, 28/31 preferred short conditions followed by about three choices).

## Deferred — not in the approved BUILD scope

| Feature | Reason | Traces to |
|---|---|---|
| Temporary food exclusions | Sensitive-data assessment required before build | F10, LR4; B12 |
| Non-repetitive alternatives | Depends on ranking evidence not yet gathered | F11; B13 |
| Shared voting room | Only 3/31 respondents requested it | F13; B18 |
| Promotions and delivery fees | No reliable external data source confirmed | F16; B21 |

## Quality notes

- NFR1 applies to warm API responses; free-tier cold-start latency is measured and reported separately.
- NFR2 requires at least 80% of at least five target-user testers to complete F1–F4 within 60 seconds without facilitator help.

## Won't have — first release

| Feature | Reason | Traces to |
|---|---|---|
| Session-only GPS location | First release uses manual `Zone` records only; GPS requires separate approval and privacy handling | F9, LR5 |
