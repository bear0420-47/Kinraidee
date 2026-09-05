# Kinraidee Feature List

## Status

Draft — derived from `.docs/01-requirements/backlog.md` on 2026-09-06 for the W5 DISCOVER Phase Gate. Pending human approval.

## Core release features

| Feature | Core | What it does | Traces to |
|---|:--:|---|---|
| **Get a meal shortlist** | ★ | Enter budget, taste, food type, and area, then receive up to three qualifying choices with price, area, wait, and a rationale. | F1, F2, F3; B1, B2, B3; P1, P3, P5, P6, P7, P8 |
| Reject and replace | | Reject a choice and get a non-duplicate replacement; a rejected choice does not return in the same session. | F4, F5; B4, B5; P3, P4 |
| Restart or edit the session | | Edit the conditions or start a new session, clearing rejected choices. | F7; B7; P1, P2 |
| Use it without an account | | The whole core workflow runs with no sign-in and no optional personalization consent. | F6, LR2; B6; P1 |
| Decide for me | | Pick one at random from the already-filtered results only. | F12; B14; P8 |
| Authorized data administration | | Create, update, and retire restaurant and menu records behind authentication, role checks, and a minimized audit event. | F8, LR8; B8; OA1 |
| Privacy and legal controls | | Purpose notice, data minimization, purpose limitation, log hygiene, and the conditional consent, retention, and traffic-log duties. | LR1, LR3, LR6, LR7, LR9, LR13, LR14, LR15, LR16, LR17; B9, B15, B16, B17 |

The core feature is **Get a meal shortlist**. It removes the highest-count research pain (P1, 26/31 daily decision difficulty) and is the feature the survey majority asked for directly (P8, 28/31 preferred short conditions followed by about three choices).

## Deferred — not in the approved BUILD scope

| Feature | Reason | Traces to |
|---|---|---|
| Session-only location with manual fallback | GPS-vs-manual MVP decision still open | F9, LR5; B11 |
| Temporary food exclusions | Sensitive-data assessment required before build | F10, LR4; B12 |
| Non-repetitive alternatives | Depends on ranking evidence not yet gathered | F11; B13 |
| Shared voting room | Only 3/31 respondents requested it | F13; B18 |
| Saved favorites | Requires accounts and an approved retention rule | F14; B19 |
| Opted-in recommendation history | Requires lawful basis and user controls | F15; B20 |
| Promotions, fees, ratings, wait times | No reliable external data source confirmed | F16; B21 |

## Open decisions blocking scope lock

- **RG-1 — restaurant diversity has no requirement.** Charter §5.2 requires the recommendation logic to consider restaurant diversity so that a shortlist is not filled from one restaurant. No `F*` or `NFR*` requirement covers this. Add a requirement, or record that the clause is out of the first release.

- Is F8 (authorized data administration) a first-release Must? `OA1` is an operational assumption, not a survey finding.
- Manual area only, or optional GPS (F9) in the MVP?
- Are the NFR1 two-second p95 and NFR2 sixty-second thresholds the final acceptance values?
