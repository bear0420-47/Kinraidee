# Agent Workflow

This project uses document-first Custom Agents for a food-menu recommendation system.

| Order | Agent | Reads | Writes |
|---|---|---|---|
| 1 | Planner | `rule.md`, current evidence | `intent.md` |
| 2 | Designer | approved `intent.md`, `rule.md` | `spec.md` |
| 3 | Builder | approved `intent.md` and `spec.md` | `plan.md` |
| 4 | CodeTest | approved `plan.md`, source, tests | `verification.md` |
| 5 | Reviewer | all primary documents and verification | `REVIEW.md` |
| 6 | Maintainer | incident evidence and all relevant rules | archived intent plus new `intent.md` |

Use the agents from `.github/agents/` in order. Human approval is required after requirements, after the plan, before PR merge, and before production deployment. The GitHub Actions workflow at `.github/workflows/verify.yml` validates the evidence structure and runs Node checks when `package.json` exists.
