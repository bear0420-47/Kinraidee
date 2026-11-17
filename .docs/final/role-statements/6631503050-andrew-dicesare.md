# Role statement — 6631503050 Andrew Dicesare

**Role:** AI Lead ([`team-charter.md`](../../../docs/00-charter/team-charter.md))

## What I did

I wrote 78 of the non-merge commits on `main` (GitHub `AnbrewTea`; source: `git log --author=AnbrewTea`).

- **AI in the product and the AI evaluation.**
  - I led the AI part of Kinraidee: Gemini picks 3 dishes from a pool the rules have already approved, and the server checks its answer.
  - I ran the AI vs non-AI test ([`evidence/ai-vs-non-ai-2026-11-16.md`](../../../evidence/ai-vs-non-ai-2026-11-16.md)) and wrote [`ai-logic.md`](../ai-logic.md).
  - I presented slides 6–8 (AI Logic, AI in our SDLC, AI Proof).
- **Admin and user features.**
  - I built the admin API and screens for zones, food types, tastes, restaurants and menu items.
  - I built the sign-in pages and route guards, favourites, saved preferences and selected-dish history.
- **Core meal flow.** I built:
  - the condition steps,
  - the recommendation cards,
  - the confirm and success screens,
  - a guaranteed suggestion when nothing matches.
- **Catalog.**
  - I created the per-restaurant catalog format and entered more than 20 restaurants by hand.
  - I found and checked by eye free-licence photos that match each dish name: 224 of 418 dishes now have one.
- **Security and deployment.**
  - I did the OWASP Top 10 hardening (issue log SR-01 to SR-03).
  - I set up the manual production seed workflow (SR-04, SR-05).

## Hardest part

The legal side was the hardest part.

The project started as a simple idea: suggest food from restaurants near the university. Grab and Google Maps own the rights to their menus, photos and data, so we could not copy or scrape them.

That meant almost everything had to be done by hand:

- I entered the restaurants and menus myself.
- I searched free photo sources for pictures that match each menu name, instead of using Grab's menu photos.
- Google Places details are shown live through the official API, and never stored ([`rule.md`](../../../rule.md)).

## AI disclosure

- **Tools.** I mainly used Claude (Claude Code) to develop the project, plus Codex. Both worked under the rules in [`AGENTS.md`](../../../AGENTS.md) and [`CLAUDE.md`](../../../CLAUDE.md).
- **What the AI did.** It drafted code, tests, documentation and the evaluation script.
- **What I did.** I read and tested every change, ran `pnpm verify`, checked dish photos by eye, and decided what to merge.
- **Approval.** The AI did not approve its own work, and every production change went through a pull request.
