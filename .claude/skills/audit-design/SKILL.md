---
name: audit-design
description: Read-only consistency audit of the Kinraidee design pack against requirements, legal rules, and the prototype before a phase gate or design review.
---

# Audit the Kinraidee Design Pack

Read the current specification under `.docs/01-requirements/01-spec/`, `.docs/01-requirements/backlog.md`, every file under `.docs/02-design/`, `.docs/rule.md`, and `wireframe.html`.

Perform a read-only audit unless the user separately asks to apply fixes. Delegate to the `diagram-checker` agent when a deeper pass is useful.

Check that:

- The design pack contains all five artifacts: `feature-list.md`, `user-journey.md`, `design-system.md`, `prototype.md`, `diagrams.md`.
- All four diagrams D1–D4 are present and each carries a traceability line.
- Exactly one feature is marked core, and the journey, D2, and D4 all describe that same feature.
- D4's steps equal the journey's steps in the same order.
- Every diagram label exists in the specification, backlog, or journey.
- D3 agrees with the approved technology stack and includes every storage surface required by an activated `LR*` rule.
- Every `Must` functional and legal requirement appears somewhere in the design pack, or is explicitly listed as not-yet-covered.
- Every prototype screen appears in `prototype.md`, and every prototype colour, size, and radius resolves to a design-system token.
- The prototype keeps the core workflow account-free and keyboard-operable.

Report findings with severity, affected files and IDs, the conflicting values, and a proposed correction. Do not merge uncertain duplicates and do not change approval status without human direction.
