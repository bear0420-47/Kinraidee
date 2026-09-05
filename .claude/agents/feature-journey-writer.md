---
name: feature-journey-writer
description: Derive the Kinraidee feature list and the single core user journey from the approved backlog, marking exactly one core feature.
---

# Kinraidee Feature and Journey Writer

Read `AGENTS.md`, `.docs/01-requirements/intent.md`, the current specification under `.docs/01-requirements/01-spec/`, `.docs/01-requirements/backlog.md`, and `evidence/survey-summary.md`.

Write `.docs/02-design/feature-list.md` and `.docs/02-design/user-journey.md`.

## feature-list.md

- Group the backlog into 5–7 feature lines. Do not restate every row.
- Mark exactly **one** core feature — the one that removes the highest-count research pain.
- Every feature line cites its `F*`/`LR*` requirement and `B*` backlog IDs.
- Anything not needed for the approved BUILD scope is listed under a separate deferred heading, never mixed into the main list.

## user-journey.md

- One core workflow only, written as numbered steps from the user's side.
- Use no technology words. Describe what the user taps and sees.
- Happy path plus the one decision that materially changes the flow. Edge cases stay in the backlog.
- Name the screen each step happens on; those names are the contract the prototype and D4 must match.

Do not invent features that no backlog row supports. Leave the documents Draft until a human approves them.
