---
name: architecture-writer
description: Produce the Kinraidee high-level architecture and the four required diagrams (D1 Context, D2 Use Case, D3 Architecture, D4 Activity) from the approved requirements and journey.
---

# Kinraidee Architecture and Diagram Writer

Read `AGENTS.md`, `.docs/00-charter/charter-constraints.md`, the current specification under `.docs/01-requirements/01-spec/`, `.docs/01-requirements/backlog.md`, `.docs/02-design/feature-list.md`, `.docs/02-design/user-journey.md`, and `.docs/rule.md`.

Write `.docs/02-design/diagrams.md`. D1, D3 and D4 are Mermaid source so they stay diffable in version control. **D2 is the exception**: it is a hand-authored UML use case diagram at `.docs/02-design/assets/d2-use-case.svg`, referenced as an image. Mermaid has no use case diagram type, so never regenerate D2 as a Mermaid flowchart — edit the SVG instead, keeping stick-figure actors, ovals inside the system boundary, plain solid associations with no arrowhead, and dashed `«include»` arrows with an open arrowhead.

| ID | Diagram | Must show | Correct if |
|---|---|---|---|
| D1 | System Context | the system as one box, external actors, scope | named system; at least two actors; no internal detail |
| D2 | Use Case | main use cases, actors, include/extend | every actor linked to a use case; the core use case present |
| D3 | Architecture | layers/components and call or data direction | does not contradict the approved technology stack |
| D4 | Activity | one scenario from the core user story | start and end nodes; step order equals `user-journey.md` |

Rules:

- Every actor, use case, component, and step label must already exist in the specification, backlog, or journey. Never introduce a name that appears nowhere else.
- D3 must show the storage and control surfaces that `.docs/rule.md` requires whenever their activating condition is met — the consent record, the audit record, and any Section 26 traffic record — and must label conditional elements as conditional.
- D3 must contain **every** component named in charter §5.2 — User Interface, Backend API, Recommendation Logic, Session Management, Database, and Admin Interface. Check them off one by one against `.docs/00-charter/charter-constraints.md`; a missing component is a gate failure.
- D3 must match the charter §5.3 technology stack (React + TypeScript, Express.js + TypeScript, PostgreSQL). If a stack decision is still open, say so in the diagram notes rather than picking silently.
- When the charter requires a behaviour that no `F*`/`NFR*` requirement covers, draw it, label it, and record it as a numbered open gap (`RG-*`) in the diagram notes. Never silently invent the missing requirement, and never silently drop the charter clause.
- D4 must reproduce the journey steps in the same order, with guards in square brackets.
- Record each diagram's traceability line: which `F*`, `LR*`, `NFR*`, and `B*` IDs it covers.
- Keep a label-provenance table at the top of the document naming every source a label may come from, and list any label that no source backs.

Do not write application code. Leave the document Draft until a human approves it.
