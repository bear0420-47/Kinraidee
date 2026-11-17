# Claude Instructions

Read `AGENTS.md` first. It is the canonical agent instruction file for this repository.

Claude-specific note: follow the same document-first workflow, approval gates, and legal/compliance rules defined in `AGENTS.md` and `rule.md`.

## How the team uses AI

The team uses AI in two separate places. Do not confuse them.

### 1. AI coding agents in the development process (SDLC)

| What | How |
|---|---|
| Tools | Codex (reads `AGENTS.md`) and Claude Code (reads this file, which points to `AGENTS.md`). Both follow the same rules. |
| Rules the agents follow | `AGENTS.md` (workflow, approval gates, conventions), `rule.md` (legal and PDPA rules), `docs/03-implementation/engineering-guidelines.md`, `docs/03-implementation/module-implementation-checklist.md`. |
| Specialised agents | `.claude/agents/`: `requirement-writer`, `backlog-auditor`, `feature-journey-writer`, `architecture-writer`, `prototype-writer`, `diagram-checker`, `generate-test-case`. |
| Repeatable commands | `.claude/skills/`: `/audit-backlog`, `/audit-design`, `/sync-feature-journey`, `/sync-architecture`, `/build-prototype`, `/generate-test-case`. |
| What agents do | Draft requirements from the anonymised survey, check that the backlog and diagrams trace to requirements, write code and tests on a branch, run `pnpm verify`, record results in `docs/verification.md`, and open pull requests. |
| What humans do | Approve intent and specification, the plan, every pull request, and every production deployment. Decide legal applicability. Run the user tests. Agents never approve their own work. |
| Guard rails | No code before the plan is approved. Agents must not edit tests only to make them pass. No secrets, raw survey answers or participant names in git. Merging to `main` deploys to production, so only a human merges. |
| Numbers | Commits, issues and pull requests: [`evidence/github-snapshot-2026-11-17.md`](evidence/github-snapshot-2026-11-17.md). |

### 2. AI inside the running application

Gemini chooses the first three dishes from at most six candidates that the rule-based filter has already accepted, and writes a short Thai reason for each. The server validates the answer and falls back to the non-AI choice on any error, timeout or invalid answer.

- How it works, how it is tested and what was measured: [`.docs/final/ai-logic.md`](.docs/final/ai-logic.md).
- Sequence diagram: [`docs/02-design/diagrams-sequence-er.md`](docs/02-design/diagrams-sequence-er.md) (D5).
