# Kinraidee

Kinraidee is a document-first food decision assistant project. The first release focuses on one workflow: collect short meal conditions and return up to three suitable restaurant or menu choices.

## Repository Layout

- `AGENTS.md` — canonical agent workflow and repository rules for Codex-first collaboration.
- `CLAUDE.md` — Claude entry point that delegates to `AGENTS.md`.
- `rule.md` — legal, PDPA, consent, retention, and compliance rules.
- `docs/` — intent, specification, backlog, design pack, plan, verification, and review evidence.
- `docs/03-implementation/engineering-guidelines.md` — approved stack decisions, project structure, and implementation rules.
- `docs/03-implementation/module-implementation-checklist.md` — required checklist before adding or changing feature modules.
- `evidence/` — survey summary and archived evidence.
- `src/` — application code for the one approved workflow; currently intentionally empty.
- `src/web/` — mobile-first React + TypeScript web client boundary.
- `src/api/` — Express 5 + TypeScript REST API boundary.
- `tests/` — runnable checks for committed prototype/workflow artifacts.
- `assets/` — static food and vendor assets used by the prototype.
- `templates/` — document templates for SDLC artifacts.

## Current Status

Requirements and implementation plan are still draft/pending approval. Do not add application code until the human approves both the specification and `docs/plan.md`.

## Run Checks

```sh
node tests/wireframe-requirements.test.cjs
```

## First Local Setup

Follow `docs/03-implementation/first-setup.md` before running the web or API packages on a new machine.

Local PostgreSQL runs through `docker-compose.yml` with the same defaults as `src/api/.env.example`.
