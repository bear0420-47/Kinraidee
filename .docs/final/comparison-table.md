# Comparison table — before and after

"Before" means how testers chose food without Kinraidee, or the system before a change. Every number links to its source file. Test results: R = [`.docs/QA/user-test-results-2026-11-02.md`](../QA/user-test-results-2026-11-02.md), 10 testers U01–U10, scores 1–5.

## Main table

| Item | Before | After | Change | Measured with | Evidence |
|---|---|---|---|---|---|
| Time to choose a meal | about 342 s (lower bound of the time testers recalled) | 80.91 s mean (UAT-01, conditions → confirmed dish) | about −76% | Recalled time range (B3) vs timed task (UAT-01), n = 10 | R §6.3 |
| Ease of deciding what to eat | 2.90 | 3.90 | +1.00 (7 better, 3 same, 0 worse) | Paired self-rating B4 → PP1, n = 10 | R §5 |
| Finding food that matches the taste wanted | 3.40 | 4.20 | +0.80 | Paired rating B9 → PP5 | R §5 |
| Finding food in a convenient zone | 3.60 | 4.40 | +0.80 | Paired rating B11 → PP7 | R §5 |
| Choosing another dish when one is unwanted | 3.60 | 4.30 | +0.70 | Paired rating B12 → PP8 | R §5 |
| Finding food within budget | 3.70 | 4.00 | +0.30 | Paired rating B8 → PP4 | R §5 |
| Finding food of the type wanted | 4.20 | 4.00 | −0.20 (worse) | Paired rating B10 → PP6 | R §5 |
| Mental effort (lower is better) | 3.10 | 3.10 | 0.00 | Paired rating B5 → PP2 | R §5 |
| "Too many options to choose" (lower is better) | 2.70 | 3.20 | −0.50 (worse) | Paired rating B6 → PP3 | R §5 |
| Tasks finished without help | — (no app) | 88 of 90 (97.78%) | — | 9 task runs × 10 testers | R §3.1 |
| Acceptance (UTAUT2-based, 1–5) | — | PE 4.43, EE 4.55, HM 4.37, FC 4.60, BI 4.13 | — | 17-item questionnaire | R §4; questions in [`UTAUT2.md`](../QA/UTAUT2.md) |
| **AI: food-type variety in a 3-dish shortlist** | Non-AI: 2.31 types; 3 types in 44% of shortlists | AI: 2.59 types; 3 types in 61% | +0.29 types, p = 0.004 | 71 AI vs 85 non-AI complete, unadjusted shortlists from 90 requests per side; permutation test | [`evidence/ai-vs-non-ai-2026-11-16.md`](../../evidence/ai-vs-non-ai-2026-11-16.md) |
| **AI: answer time (cost of AI)** | Non-AI ≈ 0.3 s | AI median 1.55 s, p95 2.09 s | +1.2–1.3 s | Production timings | same file |
| **AI: correct facts in reasons** | Non-AI shows no written reason | 197/199 prices and 49/49 restaurants correct | — | Each reason checked against the database | same file |
| Dishes that can be recommended (have a photo) | 166 of 418 | 224 of 418 | +58 | Catalog build and database read-back | [`docs/verification.md`](../../docs/verification.md) lines 2002–2004 |
| Known dependency vulnerabilities | 21 | 2 (build-time only, accepted) | −19 | `pnpm audit` | [`docs/verification.md`](../../docs/verification.md) line 1992 |
| Recommendation speed (non-AI path, 500 restaurants) | target ≤ 2 s p95 (NFR1) | 33.22 ms warm p95 | meets target | `recommendations:verify`, 30 samples | [`docs/verification.md`](../../docs/verification.md) line 1735 |

The before/after ratings compare "usually, last week" with "during the test". They are self-ratings from 10 people, not proof that the app caused the change (R §5, §10).

## Every MUST item — before and after

MUST items from [`docs/01-requirements/backlog.md`](../../docs/01-requirements/backlog.md). "Not measured" is stated where no before/after data exists.

| MUST | Before | After | Evidence |
|---|---|---|---|
| B1 Capture short meal conditions | — | UAT-01 10/10 finished alone; ease of deciding 2.90 → 3.90 | R §3.1, §5 |
| B2 Up to three choices, or closest alternatives | — | UAT-01 10/10; UAT-08 (no match) 20/20 runs finished alone | R §3.1 |
| B3 Decision details and reasons | — | UAT-02 9/10 alone, 1 with help (issue UT-02) | R §3.1; [`issue-log.md`](../QA/issue-log.md) |
| B4 Reject and get a replacement | Choosing another dish 3.60 | 4.30; UAT-03 10/10 | R §3.1, §5 |
| B5 No repeat of rejected dishes | — | Not measured with users; covered by automated tests (`recommendations.service.test.ts`) | `pnpm verify` |
| B6 Core workflow without an account | — | All 10 testers used it without an account; UAT-07 restart 10/10 | R §3.1 |
| B7 Edit conditions and start again | — | UAT-05 10/10; UAT-07 10/10 | R §3.1 |
| B8 Authorized catalog administration | No rate limit or origin check | Rate limits and origin check; USER on admin route gets 403 | [`issue-log.md`](../QA/issue-log.md) SR-01; `docs/verification.md` line 1996 |
| B9 Purpose notice and data minimisation | — | Not measured with users; privacy notice page is open issue #60 | [`evidence/github-issues-2026-11-17.csv`](../../evidence/github-issues-2026-11-17.csv) |
| B10 Quality thresholds | NFR2 target: ≥ 80% finish the core flow in ≤ 60 s alone | 4 of 10 (40%) finished UAT-01 in ≤ 60 s; 8 of 10 did every task alone | R §3.3 (NFR2 **not met**) |
| B15 Separate consent and electronic-agreement evidence | Not activated: the first-release test flow did not introduce electronic signing or separate Terms/consent records | Not applicable to the current release; activation requires a human design decision before such records are introduced | Specification LR14–LR16; backlog B15 |
| B16 Personal-data access, correction and deletion handling | Registered-account data is in scope, so this item is activated | Account deletion is implemented as hard delete/cascade; access and correction request workflow is not fully measured or documented | Specification LR6/LR9; backlog B16; verification and issue follow-up required |
| B17 Required traffic-data retention | Legal applicability of Computer Crime Act §26 is pending accountable human/legal confirmation | Not claimed as applicable or inapplicable; no 90-day traffic-data result is reported until the activation decision is recorded | Specification LR10–LR13; backlog B17 |
| B24 Mixed restaurants in a shortlist | — | 2.88 (non-AI) and 2.97 (AI) different restaurants per 3 dishes | AI evaluation file |
| B25 AI selects and explains the shortlist | Non-AI pick, no reason | AI used in 76/90 production requests; more food-type variety (p = 0.004); 197/199 prices correct | AI evaluation file |
| B26 Live Google Places details | — | Live details with 4 reviews returned through Hosting | `docs/verification.md` line 1874 |
| B27 Automatic smallest condition change on no match | — | UAT-08 case 1: 10/10 finished alone; 1 tester found the message unclear (UT-04) | R §3.1, §7 |
