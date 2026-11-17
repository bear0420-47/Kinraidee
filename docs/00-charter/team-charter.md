# Team charter — Kinraidee

**Status:** Draft, 2026-11-17. Members are taken from `.docs/project-proposal.md`. Roles and team rules have **not yet been confirmed by the team**. Each member fills in their own row before the final submission; nothing below is invented on their behalf.

Project scope, objectives and constraints: [`charter-constraints.md`](charter-constraints.md).

## Members and roles

| Student ID | Name | Role | Main responsibilities |
|---|---|---|---|
| 6631503111 | Butsarin Chomchat | Product Owner | Owns product direction, requirements, backlog prioritization, traceability and product governance |
| 6631503017 | Natthanan Kaewsaengin | TODO (member to confirm) | TODO |
| 6631503050 | Andrew Dicesare | AI Lead | AI in the product (Gemini shortlist, fallback, evaluation), AI coding-agent workflow, core meal flow, admin features, catalog and photos, security hardening |
| 6631503117 | Siwagorn Pitaksinagorn | TODO (member to confirm) | TODO |
| 6631503044 | Suwaphit Vatidmatee | TODO (member to confirm) | Personal-data contact for usability testing (`.docs/QA/participant-consent-form.md`) |

## Team rules

These working rules are already enforced by the repository. Rules the team agreed outside the repository (meetings, communication, deadlines) still need to be added.

1. **Document first.** No application code before the human approves the requirements and `docs/plan.md` (`AGENTS.md`, Workflow 2).
2. **Human approval gates.** A human approves intent and specification, the implementation plan, every pull request, and every production deployment (`AGENTS.md`, Approval gates).
3. **Branch and pull request.** Work happens on a branch; `main` changes only through a reviewed pull request, and a merge to `main` deploys to production (`.github/workflows/deploy-production.yml`).
4. **Checks before review.** Run `pnpm verify` (typecheck, lint, tests, build) and record results in `docs/verification.md` before asking for review (`AGENTS.md`, Workflow 7).
5. **Privacy.** No raw survey answers, real participant names, email addresses, precise GPS or secrets in git (`AGENTS.md`, Requirement conventions; `rule.md`).
6. **AI agents draft, humans decide.** Agents may write drafts, code and tests; a human owns every judgment and approval (`AGENTS.md`, Agent and skill roster; `CLAUDE.md`).
7. TODO — team to add: meeting schedule, communication channel, response time, how tasks are assigned, what happens when a deadline is missed.
