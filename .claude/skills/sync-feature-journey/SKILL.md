---
name: sync-feature-journey
description: Regenerate the Kinraidee feature list and core user journey from the current backlog when requirements change or the design pack is prepared for a phase gate.
---

# Sync Feature List and User Journey

Read `AGENTS.md`, `.docs/01-requirements/intent.md`, the current specification under `.docs/01-requirements/01-spec/`, and `.docs/01-requirements/backlog.md`.

Write or update `.docs/02-design/feature-list.md` and `.docs/02-design/user-journey.md`.

Produce:

- 5–7 feature lines, each citing its `F*`/`LR*` and `B*` IDs, with exactly one marked core.
- Deferred items under their own heading, never mixed into the main list.
- One numbered core journey in user language, with the screen name for each step.

Then report which backlog rows are now unrepresented in the feature list and which features have no backlog row. Do not delete a feature because it is inconvenient; mark it deferred with the reason.

Leave both files Draft until a human approves them. Finish by suggesting `/audit-design`.
