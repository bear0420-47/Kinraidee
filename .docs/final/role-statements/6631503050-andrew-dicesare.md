# Role statement — 6631503050 Andrew Dicesare

**Role:** AI Lead ([`team-charter.md`](../../../docs/00-charter/team-charter.md))

## What I did

I wrote 78 of the non-merge commits on `main` (GitHub `AnbrewTea`; source: `git log --author=AnbrewTea`).

- **AI in the product and the AI evaluation.**
  - I led how the team used AI: the AI coding-agent workflow for building the project, and checking whether the Gemini shortlist (built with Natthanan's provider integration) is actually better than the non-AI pick.
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

## Reflection

**Status:** Draft for Andrew to personalise before Sun 22 Nov, 23:59.

As AI Lead, I learned that building with AI is less about writing code and more about checking it. I mainly used Claude to develop Kinraidee. It could produce an admin screen, a test suite or an evaluation script in minutes, and it was easy to accept something that only looked right. My real work became setting the rules it worked under, reading every change, running `pnpm verify`, and deciding what was allowed to reach `main`. The AI never approved its own pull requests, and I think that rule mattered more than any single feature.

The hardest lesson was not technical, it was legal. The idea started simply: suggest food from restaurants near the university. I expected to pull menus and photos from Grab or Google Maps, but their data and images belong to them, so we could not copy or scrape them. A simple app turned into entering restaurants and menus by hand and searching free photo sources for pictures that matched each dish name. AI could not solve this for me. It could help search and organise, but I had to judge whether every photo really showed the right dish and whether every source allowed us to use it. That taught me to think about data rights and privacy before writing code, not after.

The AI vs non-AI test changed how I see AI in a product. It was easy to claim that Gemini made better suggestions; measuring it showed something smaller and more honest: more variety in food types, correct prices in almost every reason, and about one extra second of waiting. Our user test also showed that we did not meet our own speed target.

In the AI era, I see my role as someone who directs and verifies AI, not someone who is replaced by it. I still need to get better at testing with real users earlier and at saying no to features the evidence does not support.
