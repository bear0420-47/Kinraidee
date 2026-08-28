# Agent Workflow

This project uses document-first Custom Agents for a food-menu recommendation system.

| Order | Agent | Reads | Writes |
|---|---|---|---|
| 1 | Planner | `doc/rule.md`, current evidence | `.docs/01-requirements/intent.md` |
| 2 | Designer | approved Intent, `doc/rule.md` | dated specification + backlog under `.docs/01-requirements/` |
| 3 | Builder | approved requirements | `doc/plan.md` |
| 4 | CodeTest | approved `doc/plan.md`, source, tests | `doc/verification.md` |
| 5 | Reviewer | all primary documents and verification | `doc/REVIEW.md` |
| 6 | Maintainer | incident evidence and all relevant rules | archived Intent plus replacement Intent |

Use the agents from `.github/agents/` in order. Human approval is required after requirements, after the plan, before PR merge, and before production deployment. The GitHub Actions workflow at `.github/workflows/verify.yml` validates the evidence structure and runs Node checks when `package.json` exists.
