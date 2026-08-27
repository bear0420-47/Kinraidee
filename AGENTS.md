# Project Instructions

This repository is a document-first workflow for the Kinraidee food-menu recommendation project. `rule.md` is the single source of truth for legal and compliance rules.

## Workflow

1. Read `intent.md`, `spec.md`, `plan.md`, and `rule.md` before editing.
2. Do not write application code until `plan.md` is approved by a human.
3. Keep every stage's decision and result in its designated evidence file.
4. Update `plan.md` when implementation differs from the approved plan.
5. Run build, test, and lint before reporting completion; record results in `verification.md`.
6. Do not modify tests only to make them pass.
7. Review `REVIEW.md` findings before requesting approval.
8. Do not deploy to production without explicit human approval.

## Stage outputs

| Stage | Agent | Primary output | Template |
|---|---|---|---|
| Planner | `planner` | `intent.md` | `templates/intent.template.md` |
| Design | `designer` | `spec.md` | `templates/spec.template.md` |
| Build | `builder` | `plan.md` | `templates/plan.template.md` |
| CodeTest | `codetest` | `verification.md` | `templates/verification.template.md` |
| Review | `reviewer` | `REVIEW.md` | `templates/review.template.md` |
| Maintenance | `maintainer` | approved replacement `intent.md` | `templates/maintenance-intent.template.md` |

Custom Agent definitions live in `.github/agents/`. Evidence that does not belong in a primary document goes in `evidence/`.

## Approval gates

- Human approves requirements in `intent.md` and `spec.md`.
- Human approves the implementation plan in `plan.md`.
- Human approves the pull request after `verification.md` and `REVIEW.md` are complete.
- Human approves production deployment separately.

## Project conventions

- Use TypeScript for application code.
- Validate all API inputs at the boundary.
- Never expose secrets or unnecessary personal data.
- Every protected API must verify user permissions.
- Read and follow `rule.md` for legal, privacy, retention, and security requirements.
- Keep personal data out of logs unless strictly necessary and lawful.
- Use the matching template when starting a new stage and record the stage status.
- Never silently overwrite approved evidence; preserve the previous version under `evidence/archive/` first.
