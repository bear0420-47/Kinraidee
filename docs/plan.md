# Implementation Plan

## Status

Awaiting human approval. No application code may be written while this status remains unchanged.

## Proposed sequence

1. Confirm `docs/01-requirements/intent.md` and the current specification under `docs/01-requirements/01-spec/` with the human approver.
2. Define the TypeScript application boundary and input-validation approach in `docs/03-implementation/engineering-guidelines.md`.
3. Define the data model, lawful purpose, access roles, retention, deletion, and consent records.
4. Implement the smallest general restaurant-discovery flow.
5. Add optional personalization and location flows with consent and purpose checks.
6. Add protected data-subject and administrator operations.
7. Add security, audit, and retention handling required by `rule.md`.
8. Add focused tests, then run build, test, and lint.
9. Complete `docs/REVIEW.md` and resolve findings.
10. Request human approval for the pull request and production separately.

## Evidence expected

- Requirement decisions: `docs/01-requirements/intent.md`, `docs/01-requirements/01-spec/`, and `docs/01-requirements/backlog.md`
- Implementation decisions and deviations: this file
- Engineering guidelines and stack decisions: `docs/03-implementation/engineering-guidelines.md`
- Verification commands and results: `docs/verification.md`
- Bug, security, PDPA, and requirement review: `docs/REVIEW.md`

## Open decisions

- Human approval of requirements
- Deployment boundary
- Whether restaurant administration is in the first release
- Applicable lawful basis and retention schedule for each collected field
