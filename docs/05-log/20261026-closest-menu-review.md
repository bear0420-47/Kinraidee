# Closest-menu refinement review — 2026-10-26

## Approval and scope

The human approved the proposed immediate closest-menu experience with “ลองปรับตามนั้นดู”, following the proposal to show up to three alternatives, explain differences, preserve filters, and make editing secondary. This approval covers the scoped refinement; PR approval and production deployment remain separate. Eleven preceding approved artifacts were archived under `evidence/archive/20261026-closest-menus/` before edits.

## /audit-backlog

- Reviewed F1-F7, F19-F21, NFR3/NFR8/NFR9/NFR12 and B1-B7/B24-B26 against the intent, specification, backlog, survey summary, and rule.md. No blocking scope finding.
- OA3 explicitly attributes the new fallback behavior to the human decision rather than claiming new survey evidence. F2 and B2 contain the changed acceptance criteria. NFR8 distinguishes original filters from alternate retrieval conditions while retaining a measurable 100% API filter invariant.
- LR1/LR2/LR3/LR7 continue to govern anonymous access, purpose limitation, session-only data, and logging. No sensitive field, account requirement, database storage, or unresolved conditional legal activation is added. Existing Must and Conditional Must backlog coverage remains unchanged.

## /audit-design

- All five design artifacts retain exactly one core feature: Get a meal shortlist. D1-D4 remain present. D2 and D3 remain unchanged because neither the user goal nor architecture/storage surfaces change.
- Journey steps 1-5 remain in order. D4 now branches to automatic retrieval and immediately revealed alternatives at step 3, then review/rejection/confirmation at steps 4-5. Branch labels are recorded in the journey. Normal exact cards still start face-down.
- Card and confirmation differences reuse the rationale-list component, existing WarningCircle icon, and design tokens. The API suggestion ranking remains the source of “closest”; no geographic or semantic similarity claim is added.
- Empty catalog, stale suggestion, failure/retry, disabled pending actions, reload/login session retention, replacement exclusions, and undo are specified. No blocking finding within this refinement.

## Implementation review

- Reused the typed recommendation hook, original API filters and suggestions, existing cards/confirmation, shortlist transitions, and sessionStorage validation. One extra recommendation request is allowed only after the original request has no items and supplies a suggestion; there is no recursive fallback.
- Original answers are never replaced by retrieval conditions. Optional closestConditions remains inside the existing session shortlist and follows its existing edit/reset/finish deletion rules. No API, schema, provider adapter, dependency, telemetry, or production change.
- Actual menu fields are compared against original answers. Cards and confirmation suppress rationale/AI claims computed against alternate conditions. Existing UNDER_50 API semantics are preserved and the exact 50-baht boundary is explicitly explained rather than claiming a match.
- Full web tests, build/TypeScript, lint, and changed-code formatting pass. Historical wireframe tests remain 20 passed/4 existing failures. The design detector reports one warning for the existing MenuPhoto border-b-2 divider; that class is unchanged by this refinement.
- Browser verification reached the local budget/taste screens but cannot reach catalog recommendations: /health returns 200, /api/tastes returns 500, and local PostgreSQL TCP port 5433 is closed. Do not infer real-data, mobile, provider, or usability acceptance from component tests.

## Remaining approval

Human PR review and production deployment are pending. No commit, push, migration, seed, or deployment was performed.
