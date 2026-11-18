# Team charter — Kinraidee

**Status:** Team confirmed, 2026-11-18. The members, roles, responsibilities and working rules below are confirmed for final submission.

Project scope, objectives and constraints: [`charter-constraints.md`](charter-constraints.md).

## Members and roles

| Student ID | Name | Role | Main responsibilities |
|---|---|---|---|
| 6631503111 | Butsarin Chomchat | Product Owner | Owns product direction, requirements, backlog prioritization, traceability and product governance |
| 6631503017 | Natthanan Kaewsaengin | Backend, AI Integration and Deployment/DevOps Owner | Owns the API foundation, recommendation and provider integration, production infrastructure, continuous deployment and deployment verification |
| 6631503050 | Andrew Dicesare | AI Lead | Leads AI use in the project (AI coding-agent workflow, AI vs non-AI evaluation, AI slides); built API/web features, catalog and photos, security hardening and the deployment seed workflow |
| 6631503117 | Siwagorn Pitaksinagorn | UX/UI Designer | Designed and refined the meal-selection experience, responsive layouts and navigation; maintained prototype/journey alignment and supported UI quality verification |
| 6631503044 | Suwaphit Vatidmatee | QA, usability-testing and personal-data contact | Maintained consent and test-plan evidence, anonymized user-test records, questionnaire updates, results analysis and the issue log |

## Team rules

The team confirms these working rules for the final submission.

1. **Document first.** No application code before the human approves the requirements and `docs/plan.md` (`AGENTS.md`, Workflow 2).
2. **Human approval gates.** A human approves intent and specification, the implementation plan, every pull request, and every production deployment (`AGENTS.md`, Approval gates).
3. **Branch and pull request.** Feature and application changes normally happen on a branch and enter `main` through a reviewed pull request. An authorized member may push a time-sensitive documentation-only update directly after synchronizing with `origin/main` and checking for conflicts. Every update to `main` triggers the production deployment workflow (`.github/workflows/deploy-production.yml`).
4. **Checks before review.** Run `pnpm verify` (typecheck, lint, tests, build) and record results in `docs/verification.md` before asking for review (`AGENTS.md`, Workflow 7).
5. **Privacy.** No raw survey answers, real participant names, email addresses, precise GPS or secrets in git (`AGENTS.md`, Requirement conventions; `rule.md`).
6. **AI agents draft, humans decide.** Agents may write drafts, code and tests; a human owns every judgment and approval (`AGENTS.md`, Agent and skill roster; `CLAUDE.md`).
7. **Team coordination.** Use the team chat for daily coordination, assign work through GitHub issues or pull requests, acknowledge a request within one day, and raise a blocker in the same channel rather than silently missing a deadline.
8. **Review and handoff.** The contributor who changes a module records tests and evidence; another member reviews the pull request before merge. If a member cannot finish an item, they notify the team, update the issue, and hand off the branch or evidence.
