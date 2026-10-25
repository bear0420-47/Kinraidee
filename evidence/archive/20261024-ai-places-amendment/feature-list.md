# Kinraidee Feature List

## Status

Approved — synchronized with the approved backlog and human-confirmed full-app scope on 2026-09-28. Exactly one core feature is marked with `★`.

## Core release features

| Feature | Core | What it does | Traces to |
|---|:--:|---|---|
| **Get a meal shortlist** | ★ | Enter budget, taste, food type, and zone, then receive up to three qualifying choices with price, zone, available decision details, and a rationale. | F1, F2, F3; B1, B2, B3; P1, P3, P5, P6, P7, P8 |
| Reject and replace | | Reject a choice and get a non-duplicate replacement; a rejected choice does not return in the same session. | F4, F5; B4, B5; P3, P4 |
| Restart or edit the session | | Edit the conditions or start a new session, clearing rejected choices. | F7; B7; P1, P2 |
| Use it without an account | | The whole core workflow runs with no sign-in and no optional personalization consent. | F6, LR2; B6; P1 |
| Decide for me | | Pick one at random from the already-filtered results only. | F12; B14; P8 |
| Restaurant-diverse shortlist | | Fill distinct restaurant slots first when enough qualifying restaurants exist, then allow repeated restaurants only when necessary. | F19; B24; P3, P8 |
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
| Promotions, fees, and ratings | No reliable external data source confirmed | F16; B21 |

## Quality notes

- NFR1 applies to warm API responses; free-tier cold-start latency is measured and reported separately.
- NFR2 requires at least 80% of at least five target-user testers to complete F1–F4 within 60 seconds without facilitator help.

## Won't have — first release

| Feature | Reason | Traces to |
|---|---|---|
| Session-only GPS location | First release uses manual `Zone` records only; GPS requires separate approval and privacy handling | F9, LR5 |
