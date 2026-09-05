---
name: audit-backlog
description: Audit Kinraidee requirement, evidence, legal-rule, and backlog traceability when requirements or backlog items are created, changed, or prepared for approval.
---

# Audit Kinraidee Backlog

Read `AGENTS.md`, `.docs/01-requirements/intent.md`, every current specification under `.docs/01-requirements/01-spec/`, `.docs/01-requirements/backlog.md`, `evidence/survey-summary.md`, and `.docs/rule.md`.

Perform a read-only audit unless the user separately asks to apply fixes.

Check that:

- Every Must functional requirement has at least one backlog row.
- Every Must or activated Conditional Must legal requirement has backlog coverage.
- Every backlog row traces to at least one functional requirement, legal requirement, NFR, research pain, or explicitly labeled assumption.
- Cited research evidence actually supports the associated requirement and no respondent identity is exposed.
- Functional requirements include testable acceptance criteria and MoSCoW priority.
- NFRs include a measurable threshold and a reproducible verification method.
- Conditional requirements identify their activation decision and accountable approver.

Report findings with severity, affected IDs, evidence, and a proposed correction. Do not merge uncertain duplicates or change approval status without human direction.


This skill audits the requirements layer only. For the design pack under `.docs/02-design/`, run `/audit-design`.
