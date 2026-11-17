# Case study — Kinraidee, a food decision assistant

**Live site:** https://kinraidee-512615.web.app · **Repository:** https://github.com/bear0420-47/Kinraidee

## Problem

Students often cannot decide what to eat. Our survey of 31 people ([`evidence/survey-summary.md`](../../evidence/survey-summary.md)) found:

- 26 of 31 face this every day or about once a day.
- 24 of 31 find it hardest at dinner, or when alone or tired.
- 24 of 31 are frustrated by seeing the same menus and restaurants in delivery apps.
- 20 of 31 reject a suggestion but still don't know what they want.
- 25 of 31 say price matters, and 25 of 31 usually spend ฿50–100.
- 28 of 31 prefer entering a few conditions and getting about 3 choices. Only 6 of 31 prefer a one-click random pick.

We ran no one-to-one interviews. The survey is the primary source, and two published studies on choice overload are labelled SECONDARY in [`evidence/discovery-evidence.md`](../../evidence/discovery-evidence.md).

## Process

1. **Discover.** Survey (Aug 2026) → intent → specification with user stories, NFRs and legal rules (`rule.md`, Thai PDPA) → MoSCoW backlog in [`docs/01-requirements/backlog.md`](../../docs/01-requirements/backlog.md).
2. **Design.** One core workflow: conditions → up to 3 dishes → reject, undo, edit or confirm. Diagrams D1–D4 are in [`docs/02-design/diagrams.md`](../../docs/02-design/diagrams.md); the D5 sequence and D6 ER diagrams are in [`diagrams-sequence-er.md`](../../docs/02-design/diagrams-sequence-er.md).
3. **Build.** The stack is a pnpm monorepo: React 19 + Vite for the web, and Express 5 + Prisma + PostgreSQL for the API. Every input is checked with Zod. It is deployed on Firebase Hosting and Cloud Run, with the database on Neon. AI coding agents worked under written rules (`AGENTS.md`, `CLAUDE.md`), with a human approval gate for the plan, every pull request and every deployment. The repository has 218 commits on `main`, 48 of 50 issues closed and 53 pull requests merged ([`evidence/github-snapshot-2026-11-17.md`](../../evidence/github-snapshot-2026-11-17.md)).
4. **AI in the product.** Gemini picks 3 dishes out of at most 6 rule-approved candidates and writes a reason for each. The server checks the answer and falls back to the non-AI pick on any problem ([`ai-logic.md`](ai-logic.md)).
5. **Test.**
   - A test plan, consent form and 10 usability sessions (U01–U10, 28–29 Oct 2026).
   - A UTAUT2-based questionnaire with before and after ratings ([`.docs/QA/`](../QA/)).
   - An AI vs non-AI evaluation.
   - An OWASP Top 10 security review.
   - Automated tests that run in CI (`pnpm verify`).
   - Problems and fixes are tracked in [`issue-log.md`](../QA/issue-log.md).

## Outcome

From [`.docs/QA/user-test-results-2026-11-02.md`](../QA/user-test-results-2026-11-02.md), 10 testers:

- 88 of 90 task runs were finished without help (97.78%).
- Time to choose a meal: about 342 s recalled before, against 80.91 s measured with the app.
- Ease of deciding rose from 2.90 to 3.90 out of 5. Acceptance scores are 4.13–4.60 out of 5, and satisfaction is 4.20.
- **Not met:** the NFR2 target was that 80% of testers finish the core flow alone in 60 s or less; 40% did. Mental effort did not change (3.10 → 3.10), and the "too many options" rating got worse (2.70 → 3.20).

AI evaluation ([`evidence/ai-vs-non-ai-2026-11-16.md`](../../evidence/ai-vs-non-ai-2026-11-16.md)):

- AI shortlists have more food-type variety: 3 different types in 61% of shortlists, against 44% without AI (p = 0.004).
- 197 of 199 stated prices in the AI's reasons are correct.
- AI adds about 1.3 s to the answer time.

All results side by side: [`comparison-table.md`](comparison-table.md).

**What we would do next:**

- Fix the open Medium usability issues: Undo is hard to find, the details button is off-screen, and tapping the map moves to the next screen.
- Retest to reach NFR2.
- Run an A/B test of AI against non-AI with real users.
- Add the privacy notice page (issue #60).
