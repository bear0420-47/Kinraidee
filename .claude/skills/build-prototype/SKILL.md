---
name: build-prototype
description: Build or update the Kinraidee lo-fi prototype and its design system so the screens match the core user journey and use only recorded tokens.
---

# Build the Kinraidee Prototype

Read `AGENTS.md`, `.docs/02-design/design-system.md`, `.docs/02-design/user-journey.md`, and `.docs/02-design/feature-list.md`.

Update `.docs/02-design/design-system.md`, `.docs/02-design/prototype.md`, and `wireframe.html`.

Rules:

- Every screen realizes named journey steps and cites the requirement IDs it covers.
- Use only tokens and component rules from the design system. If a needed value is missing, add it to the design system first, then use it.
- The whole core workflow stays keyboard-operable with a visible focus indicator (NFR12).
- Show at most three choices per round (F2, NFR3) and identify unavailable information rather than inventing it (F3).
- The core workflow must never require an account or optional personalization consent (F6, LR2).
- Record in `prototype.md` which requirements the prototype does not yet cover.

Run `node --test "tests/**/*.test.cjs"` afterwards and record the result. Never weaken a test to make a change pass. Finish by suggesting `/audit-design`.
