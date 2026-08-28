# Project Instructions

This repository follows a document-first AI-native SDLC for Kinraidee. `doc/rule.md` is the current single source of truth for legal and compliance rules. Requirements live under `.docs/01-requirements/`.

## Workflow

1. Read `.docs/01-requirements/intent.md`, the current specification under `.docs/01-requirements/01-spec/`, `doc/plan.md`, and `doc/rule.md` before editing.
2. Do not write application code until the human approves both the requirements and `doc/plan.md`.
3. Trace every product requirement to survey/interview evidence, a legal requirement, or an explicitly documented assumption.
4. Keep every stage's decision and result in its designated evidence file.
5. Update `doc/plan.md` when implementation differs from the approved plan.
6. Run build, test, and lint before reporting implementation complete; record exact results in `doc/verification.md`.
7. Do not modify tests only to make them pass.
8. Review `doc/REVIEW.md` before requesting pull-request approval.
9. Do not deploy to production without explicit human approval.

## Requirement artifacts

- Intent: `.docs/01-requirements/intent.md`
- Specification: `.docs/01-requirements/01-spec/`
- Product backlog: `.docs/01-requirements/backlog.md`
- Decision log: `.docs/05-log/`
- Survey summary: `evidence/survey-summary.md`
- Legal and compliance rules: `doc/rule.md`

## Requirement conventions

- Functional requirements use user stories, acceptance criteria, MoSCoW priority, and traceability IDs.
- NFRs must contain a measurable threshold and a reproducible verification method.
- Must-level rules from `doc/rule.md` must appear as `LR-*` requirements in the specification and as traceable backlog items.
- Conditional legal requirements must say what condition activates them; an Agent must not make the legal applicability decision silently.
- Raw survey responses, email addresses, precise GPS coordinates, secrets, and unnecessary personal data must not be committed.

## Approval gates

- Human approves Intent and Specification.
- Human approves the implementation plan separately.
- Human approves the pull request after verification and review.
- Human approves production deployment separately.

## Project conventions

- Use TypeScript for application code.
- Validate all API inputs at the boundary.
- Every protected API must verify user permissions.
- Keep personal data out of logs unless strictly necessary and lawful.
- Never silently overwrite approved evidence; archive the previous version under `evidence/archive/` first.

