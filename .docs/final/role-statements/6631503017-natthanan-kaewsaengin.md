# Role statement — 6631503017 Natthanan Kaewsaengin

**Status:** Final role statement for the presentation. Reflection added for Natthanan to review before submission.

**Role:** Backend, AI Integration and Deployment/DevOps Owner. I owned the API foundation, recommendation integration and production delivery of Kinraidee.

## What I did

- **Backend foundation.** I scaffolded the TypeScript web/API workspace and built the Express and Prisma foundation, PostgreSQL data model, authentication, administrator seed, Restaurant and MenuItem APIs, audit-log protection and stateless recommendation API.
- **Recommendation and AI integration.** I integrated Gemini shortlist selection and Google Places evidence while keeping rule-based filtering and server validation in control. I also implemented the automatic smallest-condition adjustment for an initial no-match. The pipeline and evaluation are documented in [`ai-logic.md`](../ai-logic.md).
- **Production deployment.** I configured the Docker API image, Artifact Registry, Neon migrations, Cloud Run, Firebase Hosting and its `/api/**` rewrite. I added continuous deployment from `main` using Workload Identity Federation, Secret Manager, immutable images and smoke tests. I also fixed first-run deployment failures, session-cookie forwarding and remote database provisioning. Evidence is in the [`deployment runbook`](../../../docs/03-implementation/google-cloud-deployment.md), [`deployment workflow`](../../../.github/workflows/deploy-production.yml) and [`production verification`](../../../docs/verification.md#production-deployment---2026-10-26).

## AI disclosure

I used Codex and Claude Code across requirements, design, implementation, testing and deployment under [`AGENTS.md`](../../../AGENTS.md) and [`CLAUDE.md`](../../../CLAUDE.md). The agents drafted code, tests and documentation. I reviewed their output, checked infrastructure commands, ran verification and smoke checks, and decided what to submit. AI did not hold cloud credentials, approve pull requests or authorize production deployment.

## Reflection

Building Kinraidee with AI changed how I worked across the whole software-engineering process. I spent a lot of time thinking about the system architecture, database schema and how the system should be divided into issues. Andrew and I were the main people implementing those issues, but AI did much of the work of turning an issue into actual code. Deployment was the clearest example. I mainly decided which services and architecture to use, then the AI called tools, diagnosed failures and continued until the system was running in production. Seeing it connect Firebase Hosting, Cloud Run, Neon and the deployment workflow successfully was impressive.

The biggest improvement was that AI became a powerful force multiplier for design, planning and implementation. Work that would normally take much longer could move from an idea to working code quickly. The downside was that I sometimes accepted implementation without inspecting every line. Because AI did much of the thinking and coding, I understood and remembered less of the system than I would have through an old-school process. I then needed extra time to read the project afterwards. This showed me that removing the human from the loop can create a system that works while its owner cannot explain it deeply enough, which is a risk for quality and security.

In the AI-era software industry, I currently see myself as a worker who is still finding the right career path. Competition is increasing and using AI effectively is becoming mandatory. My strength is analysing systems and seeing how their parts should connect. UI design is still a weakness. I can notice when an interface will be difficult to use and suggest UX improvements, but I rely on AI for much of the visual design.

Next year I want to learn more tools and use AI at full capacity without losing my own understanding and judgment. In five years, I hope to be a well-paid senior engineer without sacrificing my health to constant stress. If that path becomes unsustainable, I would also consider building a business of my own.
