# Implementation Plan

## Status

Awaiting human approval. No application code may be written while this status remains unchanged.

## Proposed sequence

1. Confirm `intent.md` and `spec.md` with the human approver.
2. Define the TypeScript application boundary and input-validation approach.
3. Define the data model, lawful purpose, access roles, retention, deletion, and consent records.
4. Implement the smallest general restaurant-discovery flow.
5. Add optional personalization and location flows with consent and purpose checks.
6. Add protected data-subject and administrator operations.
7. Add security, audit, and retention handling required by `rule.md`.
8. Add focused tests, then run build, test, and lint.
9. Complete `REVIEW.md` and resolve findings.
10. Request human approval for the pull request and production separately.

## Evidence expected

- Requirement decisions: `intent.md`, `spec.md`
- Implementation decisions and deviations: this file
- Verification commands and results: `verification.md`
- Bug, security, PDPA, and requirement review: `REVIEW.md`

## Open decisions

- Human approval of requirements
- Database technology and deployment boundary
- Whether restaurant administration is in the first release
- Applicable lawful basis and retention schedule for each collected field
