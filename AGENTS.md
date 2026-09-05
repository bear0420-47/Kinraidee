# Project Instructions

This repository follows a document-first AI-native SDLC for Kinraidee. `.docs/rule.md` is the current single source of truth for legal and compliance rules. Requirements live under `.docs/01-requirements/`.

## Workflow

1. Read `.docs/01-requirements/intent.md`, the current specification under `.docs/01-requirements/01-spec/`, `.docs/plan.md`, and `.docs/rule.md` before editing.
2. Do not write application code until the human approves both the requirements and `.docs/plan.md`.
3. Trace every product requirement to survey/interview evidence, a legal requirement, or an explicitly documented assumption.
4. Keep the design pack under `.docs/02-design/` consistent with the specification and backlog. All five artifacts describe the same one core workflow.
5. Keep every stage's decision and result in its designated evidence file.
6. Update `.docs/plan.md` when implementation differs from the approved plan.
7. Run build, test, and lint before reporting implementation complete; record exact results in `.docs/verification.md`.
8. Do not modify tests only to make them pass.
9. Review `.docs/REVIEW.md` before requesting pull-request approval.
10. Do not deploy to production without explicit human approval.

## Requirement artifacts

- Charter constraints: `.docs/00-charter/charter-constraints.md`
- Intent: `.docs/01-requirements/intent.md`
- Specification: `.docs/01-requirements/01-spec/`
- Product backlog: `.docs/01-requirements/backlog.md`
- Design pack: `.docs/02-design/` (`feature-list.md`, `user-journey.md`, `design-system.md`, `prototype.md`, `diagrams.md`)
- Decision log: `.docs/05-log/`
- Survey summary: `evidence/survey-summary.md`
- Legal and compliance rules: `.docs/rule.md`

## Requirement conventions

- Functional requirements use user stories, acceptance criteria, MoSCoW priority, and traceability IDs.
- NFRs must contain a measurable threshold and a reproducible verification method.
- Must-level rules from `.docs/rule.md` must appear as `LR-*` requirements in the specification and as traceable backlog items.
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

## Design conventions

- The design pack has exactly one core workflow. `feature-list.md` marks exactly one core feature, and `user-journey.md`, D2, D4, and the prototype all describe that same feature.
- `user-journey.md` step order is the contract. D4 and the prototype reproduce it exactly.
- Every diagram label must already exist in the specification, backlog, or journey. Never introduce a name that appears nowhere else.
- Diagrams are committed as Mermaid source so they stay reviewable in version control.
- Screens use only tokens and component rules from `design-system.md`. A value missing from the design system is added there first.
- The design pack states which requirements it does **not** cover. A silent gap is a defect; a declared gap is not.
- D3 contains every component named in charter §5.2. A charter clause with no requirement behind it is recorded as a numbered `RG-*` gap, never silently dropped and never silently turned into a new requirement.

## Agent and skill roster

Fine-grained agents live in `.claude/agents/`; the invocable commands live in `.claude/skills/`. The coarse SDLC role gates for the GitHub surface live in `.github/agents/`.

| Layer | Agent | Skill |
|---|---|---|
| Requirements | `requirement-writer` | — |
| Requirements audit | `backlog-auditor` | `/audit-backlog` |
| Feature and journey | `feature-journey-writer` | `/sync-feature-journey` |
| Architecture and diagrams | `architecture-writer` | `/sync-architecture` |
| Design system and prototype | `prototype-writer` | `/build-prototype` |
| Design audit | `diagram-checker` | `/audit-design` |

Run `/audit-backlog` and `/audit-design` before any phase gate. The writer agents draft; a human owns the judgment and the approval.
