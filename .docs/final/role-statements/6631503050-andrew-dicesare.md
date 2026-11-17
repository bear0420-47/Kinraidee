# Role statement — 6631503050 Andrew Dicesare

**Status:** Draft for Andrew to review and edit before submission. Facts are from git history (`git log --author=AnbrewTea`); the wording is to be confirmed by Andrew.

**Role:** Full-stack developer and AI-logic owner. Final role title to be confirmed in [`team-charter.md`](../../../docs/00-charter/team-charter.md).

## What I did

I wrote 78 of the non-merge commits on `main` (GitHub `AnbrewTea`).

- **Admin and user features.** I built the admin API and screens for zones, food types, tastes, restaurants and menu items. I also built sign-in pages and route guards, favourites, saved preferences and selected-dish history.
- **Core meal flow.** I built the condition steps, the recommendation cards, and the confirm and success screens. I also added a guaranteed suggestion when nothing matches.
- **Catalog.** I created the per-restaurant catalog format and added more than 20 restaurants. I found and visually checked the dish photos: 224 of 418 dishes now have one.
- **Security and deployment.** I did the OWASP Top 10 hardening (issue log SR-01 to SR-03) and set up the manual production seed workflow (SR-04, SR-05).
- **AI evaluation.** I ran the AI vs non-AI test ([`evidence/ai-vs-non-ai-2026-11-16.md`](../../../evidence/ai-vs-non-ai-2026-11-16.md)), wrote [`ai-logic.md`](../ai-logic.md), and presented the AI Logic slides.

## AI disclosure

I used AI coding agents (Claude Code and Codex) under the rules in `AGENTS.md` and `CLAUDE.md`. The agents drafted code, tests, documentation and the evaluation script. I read and tested every change, ran `pnpm verify`, checked dish photos by eye, and decided what to merge. The AI did not approve its own work, and every production change went through a pull request that I reviewed.
