---
name: sync-architecture
description: Regenerate the Kinraidee four required diagrams (D1 Context, D2 Use Case, D3 Architecture, D4 Activity) so they agree with the current requirements, journey, and legal rules.
---

# Sync Architecture and the Four Diagrams

Read `AGENTS.md`, `.docs/00-charter/charter-constraints.md`, the current specification under `.docs/01-requirements/01-spec/`, `.docs/01-requirements/backlog.md`, `.docs/02-design/feature-list.md`, `.docs/02-design/user-journey.md`, and `.docs/rule.md`.

Write `.docs/02-design/diagrams.md`. D1, D3 and D4 are Mermaid source, each followed by its traceability line. D2 is a hand-authored SVG at `.docs/02-design/assets/d2-use-case.svg` referenced as an image — edit that file, never replace D2 with a Mermaid flowchart.

Constraints:

- D1: one system box, at least two external actors, no internal detail.
- D2: every actor connected to a use case; the core use case central; `include`/`extend` only where genuinely true.
- D3: every one of the six components in charter §5.2 (User Interface, Backend API, Recommendation Logic, Session Management, Database, Admin Interface), with call direction only, consistent with React + TypeScript, Express.js + TypeScript, and PostgreSQL; conditional legal stores labelled conditional.
- D4: exactly the `user-journey.md` steps, in the same order, with guards in square brackets and explicit start and end nodes.
- Every label must already exist in another approved document.

Report any requirement that no diagram covers, any charter §5.2 component missing from D3, and any charter clause with no requirement behind it (record the last as a numbered `RG-*` gap). Leave the document Draft until a human approves it. Finish by suggesting `/audit-design`.
