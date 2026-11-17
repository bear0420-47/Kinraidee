# Team charter — Kinraidee

**Status:** Team draft, 2026-11-17. Roles are inferred from committed work and must be confirmed by each member before submission.

Project scope, objectives and constraints: [`charter-constraints.md`](charter-constraints.md).

## Members and roles

| Student ID | Name | Role | Main responsibilities |
|---|---|---|---|
| 6631503111 | Butsarin Chomchat | Product Owner | Owns product direction, requirements, backlog prioritization, traceability and product governance |
| 6631503017 | Natthanan Kaewsaengin | Backend, AI Integration and Deployment/DevOps Owner | Owns the API foundation, recommendation and provider integration, production infrastructure, continuous deployment and deployment verification |
| 6631503050 | Andrew Dicesare | AI Lead | Leads AI use in the project (AI coding-agent workflow, AI vs non-AI evaluation, AI slides); built API/web features, catalog and photos, security hardening and the deployment seed workflow |
| 6631503117 | Siwagorn Pitaksinagorn | Web UX and quality contributor | Implemented web navigation and meal-flow refinements, CI verification fixes and prototype/journey alignment |
| 6631503044 | Suwaphit Vatidmatee | QA, usability-testing and personal-data contact | Maintained consent/test-plan evidence, anonymized user-test records, questionnaire updates and catalog/photo evidence |

## Team rules

These working rules are already enforced by the repository. Rules the team agreed outside the repository (meetings, communication, deadlines) still need to be added.

1. **Document first.** No application code before the human approves the requirements and `docs/plan.md` (`AGENTS.md`, Workflow 2).
2. **Human approval gates.** A human approves intent and specification, the implementation plan, every pull request, and every production deployment (`AGENTS.md`, Approval gates).
3. **Branch and pull request.** Work happens on a branch; `main` changes only through a reviewed pull request, and a merge to `main` deploys to production (`.github/workflows/deploy-production.yml`).
4. **Checks before review.** Run `pnpm verify` (typecheck, lint, tests, build) and record results in `docs/verification.md` before asking for review (`AGENTS.md`, Workflow 7).
5. **Privacy.** No raw survey answers, real participant names, email addresses, precise GPS or secrets in git (`AGENTS.md`, Requirement conventions; `rule.md`).
6. **AI agents draft, humans decide.** Agents may write drafts, code and tests; a human owns every judgment and approval (`AGENTS.md`, Agent and skill roster; `CLAUDE.md`).
7. **Team coordination.** Use the team chat for daily coordination, assign work through GitHub issues or pull requests, acknowledge a request within one day, and raise a blocker in the same channel rather than silently missing a deadline.
8. **Review and handoff.** The contributor who changes a module records tests and evidence; another member reviews the pull request before merge. If a member cannot finish an item, they notify the team, update the issue, and hand off the branch or evidence.
