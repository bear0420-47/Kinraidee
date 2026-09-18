# Implementation Plan

## Status

Awaiting human approval. No application code may be written while this status remains unchanged.

## Proposed sequence

1. Confirm `docs/01-requirements/intent.md` and the current specification under `docs/01-requirements/01-spec/` with the human approver.
2. Define the TypeScript application boundary and input-validation approach in `docs/03-implementation/engineering-guidelines.md`.
3. Define the MVP anonymous session boundary and mock restaurant/menu data boundary.
4. Implement anonymous session handling without login, accounts, or persistent personalization.
5. Implement recommendation behavior from mock data for shortlist, rationale, reject, no-repeat, edit, and start-new-session flows.
6. Implement the mobile-first meal flow in `src/web` using `docs/02-design/design-system.md` tokens and `docs/02-design/user-journey.md` step order.
7. Add the MVP purpose notice and data-minimization behavior for session-only conditions and rejected choices.
8. Add focused MVP tests for validation, recommendation filtering, reject/no-repeat state, keyboard path, build, lint, and typecheck.
9. Complete `docs/REVIEW.md` and resolve findings.
10. Request human approval for the pull request and production separately.

## MVP implementation boundary

The first implementation pass is limited to the no-login meal decision workflow:

- Anonymous session only; no account registration, user login, personalization history, or saved favorites.
- Mock restaurant/menu data only; no administrator UI/API, no restaurant CRUD, and no production data ownership workflow.
- Manual condition entry only; no precise GPS, browser geolocation, group voting, ordering, payment, delivery, or external provider integration.
- Session conditions and rejected choices are session-scoped by default and must not become persistent personal-data records without a later approved lawful basis, retention period, access role, and deletion behavior.
- Web screens must follow the approved design tokens and user journey before adding extra UI states or flows.

## Implementation issue sequence

Create implementation issues under the existing backlog issues instead of turning MoSCoW backlog rows into direct coding tasks:

1. `I1: Define MVP anonymous session and mock data boundary` — traces `B1`, `B4`, `B5`, `B7`, `B9`.
2. `I2: Implement anonymous session API module` — traces `B1`, `B4`, `B5`, `B7`.
3. `I3: Implement mock catalog read model` — traces `B2`, `B3`.
4. `I4: Implement recommendation API module from mock data` — traces `B2`, `B3`, `B4`, `B5`.
5. `I5: Implement mobile-first meal flow web pages` — traces `B1`–`B7`.
6. `I6: Apply design tokens to MVP screens` — traces `docs/02-design/design-system.md` and `docs/02-design/user-journey.md`.
7. `I7: Add MVP verification tests` — traces `B10`.

## Evidence expected

- Requirement decisions: `docs/01-requirements/intent.md`, `docs/01-requirements/01-spec/`, and `docs/01-requirements/backlog.md`
- Implementation decisions and deviations: this file
- Engineering guidelines and stack decisions: `docs/03-implementation/engineering-guidelines.md`
- Verification commands and results: `docs/verification.md`
- Bug, security, PDPA, and requirement review: `docs/REVIEW.md`

## Open decisions

- Human approval of requirements
- Deployment boundary
- Whether restaurant administration is in a later release; it is excluded from the current MVP implementation pass
- Applicable lawful basis and retention schedule for each collected field
