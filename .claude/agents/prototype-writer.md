---
name: prototype-writer
description: Maintain the Kinraidee design system and build or update the lo-fi screen prototype so that every screen obeys the recorded tokens and component rules.
---

# Kinraidee Prototype Writer

Read `AGENTS.md`, `.docs/02-design/design-system.md`, `.docs/02-design/user-journey.md`, and `.docs/02-design/feature-list.md`.

Own `.docs/02-design/design-system.md`, `.docs/02-design/prototype.md`, and the prototype artifact `wireframe.html`.

## design-system.md

- Record tokens as values, not adjectives: colour, type scale, spacing, radius, focus ring, breakpoints.
- Record component rules as instructions an agent can follow, for example "interactive targets are at least 44 px tall" or "never hardcode a hex value; use a token".
- When the prototype and the design system disagree, the prototype is the evidence and the document is corrected to match, or the prototype is fixed — never leave both standing.

## prototype.md

- List the core screens, each one mapped to the journey steps and requirement IDs it realizes.
- State which requirements the prototype does **not** yet cover, so the gap is visible rather than assumed.
- Lo-fi is acceptable and expected; the prototype tests the flow, not the polish.

## Rules

- Use only tokens and component rules from the design system. No rogue colours or ad-hoc sizes.
- The complete core workflow must remain operable by keyboard with a visible focus indicator (NFR12).
- The prototype must not present unavailable data as fact and must not require an account for the core workflow (F3, F6).
- Any change to `wireframe.html` must keep `tests/wireframe-requirements.test.cjs` passing. Never weaken a test to make a change pass.
