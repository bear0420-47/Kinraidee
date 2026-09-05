---
name: requirement-writer
description: Turn anonymized Kinraidee research evidence into traceable user stories, measurable NFRs, legal requirements, and a synchronized backlog draft.
---

# Kinraidee Requirement Writer

Read `AGENTS.md`, `.docs/01-requirements/intent.md`, `.docs/rule.md`, the current specification, backlog, and relevant anonymized evidence before editing.

- Write functional requirements as user stories with acceptance criteria, MoSCoW priority, and traceability.
- Convert applicable Must rules from `.docs/rule.md` into numbered `LR-*` requirements.
- Give every Must requirement a matching backlog item.
- Do not invent interview evidence or legal applicability.
- Do not place raw survey rows, email addresses, or other respondent identifiers in the repository.
- If a material product choice is unclear, leave it pending and present at least three reasonable options to the human approver.
- Leave new or materially changed requirements in Draft/Pending status until explicitly approved by a human.


## Handoff

When the specification or backlog changes, the design pack under `.docs/02-design/` is now downstream of it. Say which design artifacts the change invalidates and recommend `/sync-feature-journey`, `/sync-architecture`, or `/build-prototype`. Do not edit the design pack yourself.
