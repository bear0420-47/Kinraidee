# Role statement — 6631503050 Andrew Dicesare

**Status:** Final role statement and reflection.

**Role:** AI Lead ([`team-charter.md`](../../../docs/00-charter/team-charter.md))

## What I did

I wrote 78 non-merge commits on `main` under the GitHub identity `AnbrewTea`. As AI Lead, I led the team's AI coding-agent workflow and evaluated whether Gemini changed the shortlist compared with the non-AI path. I ran the [AI vs non-AI evaluation](../../../evidence/ai-vs-non-ai-2026-11-16.md), wrote [`ai-logic.md`](../ai-logic.md), and prepared presentation slides 6–8 covering product AI, AI in the SDLC and proof.

I built major API and web functionality: administration for zones, food types, tastes, restaurants and menu items; authentication and route protection; favourites, saved preferences and selected-dish history; and the core meal flow from condition entry through recommendation cards, no-match recovery, confirmation and success.

I created the per-restaurant catalog format, manually entered more than 20 restaurants, and visually checked free-licence photos against dish names. This increased recommendable photo coverage to 224 of 418 dishes. I also co-authored [`rule.md`](../../../rule.md) with Butsarin Chomchat and Natthanan Kaewsaengin, completed the OWASP Top 10 hardening recorded as SR-01–SR-03, and built the manual production seed workflow that resolved SR-04 and SR-05.

## Hardest part

The legal side was the hardest part. We could not copy or scrape proprietary menu and photo data, so I entered catalog records manually and searched reusable photo sources instead of using delivery-platform images. Google Places evidence is retrieved live through the official API and is not stored, as documented in [`rule.md`](../../../rule.md).

## AI disclosure

I mainly used Claude Code and Codex under [`AGENTS.md`](../../../AGENTS.md) and [`CLAUDE.md`](../../../CLAUDE.md). They drafted code, tests, documentation and the evaluation script. I reviewed and tested changes, ran `pnpm verify`, checked dish photos visually and decided what to merge. AI did not approve its own work or authorize production changes.

## Reflection

As AI Lead, I learned that building with AI is less about writing code and more about checking it. I mainly used Claude to develop Kinraidee. It could produce an admin screen, a test suite or an evaluation script in minutes, and it was easy to accept something that only looked right. My real work became setting the rules it worked under, reading every change, running `pnpm verify`, and deciding what was allowed to reach `main`. The AI never approved its own pull requests, and I think that rule mattered more than any single feature.

The hardest lesson was not technical, it was legal. The idea started simply: suggest food from restaurants near the university. I expected to pull menus and photos from Grab or Google Maps, but their data and images belong to them, so we could not copy or scrape them. A simple app turned into entering restaurants and menus by hand and searching free photo sources for pictures that matched each dish name. AI could not solve this for me. It could help search and organise, but I had to judge whether every photo really showed the right dish and whether every source allowed us to use it. That taught me to think about data rights and privacy before writing code, not after. Measuring the AI taught me the same honesty: Gemini gave more food-type variety but cost about one extra second, and we missed our own speed target.

In the AI era, I see myself as a developing AI engineer who directs and verifies AI, not someone replaced by it. I need to improve at testing with real users earlier, at security, and at saying no to features the evidence does not support. Next year I plan to build one more AI-assisted project from start to finish, this time with a real user A/B test of the AI feature from the beginning, and to study cloud and security fundamentals so I can deploy and protect what I build on my own. In five years I want to work as an AI or software engineer who leads AI features in real products, designing systems where AI is measured, safe and legally sound, and where people stay accountable for every decision.
