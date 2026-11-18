# Role statement — 6631503044 Suwaphit Vatidmatee

**Status:** Final role statement for the presentation. The post-presentation reflection remains for Suwaphit to review before submission.

**Role:** QA, usability-testing and personal-data contact ([`team-charter.md`](../../../docs/00-charter/team-charter.md)). I prepared the user-testing materials, coordinated the evaluation of the main meal-selection workflow, and analysed the results.

## What I did

I prepared the [main meal test plan](../../QA/main-meal-test-plan.md), covering condition entry, recommendations, details, replacement, Undo, editing, confirmation, restart and no-match handling. The evaluation used eight tasks with two no-match cases, giving nine task sets per participant. I defined completion criteria, timing instructions and result fields, created an early test-case generation agent and skill, maintained the participant schedule, and prepared Thai and English [consent information](../../QA/participant-consent-form.md) as the personal-data contact.

I prepared and revised the Thai UTAUT2-based questionnaire and Google Form, covering usefulness, ease of use, enjoyment, readiness, intention to reuse, satisfaction and food-choice pain points. I organised results from 10 participants as anonymous records U01–U10 and documented all 90 task attempts, including assistance with Undo and an off-screen details button. Evidence is in [`UTAUT2.md`](../../QA/UTAUT2.md) and [`user-test-sheet-evidence.md`](../../QA/user-test-sheet-evidence.md).

I calculated 88/90 independently completed attempts (97.78%), 2/90 assisted attempts, eight participants completing every task independently, satisfaction of 4.20/5, task durations and paired before/after ratings. I documented the estimated time comparison and reported results that did not improve, including mental effort, choice overload and preferred food type. I prepared the presentation tables and linked usability findings to the [`issue log`](../../QA/issue-log.md). The calculations and source columns are in the [`results report`](../../QA/user-test-results-2026-11-02.md).

### Git evidence

I authored nine non-merge commits on `main` covering the test-case agent, test plan, consent materials, participant schedule, questionnaire revisions, anonymized records and final results. Key checkpoints are [`591b357`](https://github.com/bear0420-47/Kinraidee/commit/591b357), [`76efd97`](https://github.com/bear0420-47/Kinraidee/commit/76efd97), [`4661b57`](https://github.com/bear0420-47/Kinraidee/commit/4661b57) and [`242f0ef`](https://github.com/bear0420-47/Kinraidee/commit/242f0ef).

## Hardest part

The hardest part was turning food-choice pain points into understandable questions and interpreting the results without mixing task completion, opinions and timing evidence. The baseline time was recalled as a range while the app trial was measured, so I documented the lower-endpoint method and labelled the 76.34% difference as an estimate rather than a controlled timing result.

## AI disclosure

I used Codex/ChatGPT to help draft test cases, consent wording, questionnaire items, calculation scripts, the results report, Google Form, Canva content and this statement under [`AGENTS.md`](../../../AGENTS.md) and [`CLAUDE.md`](../../../CLAUDE.md). I directed the testing scope, revised the questions, clarified the procedure and checked calculations against the coded responses. The final report identifies its sources, formulas and participant codes.

## Reflection

Working as the tester on Kinraidee changed how I approach software evaluation. AI helped me draft test cases, organise the questionnaire, calculate scores and prepare reports faster. However, it also created extra revision work. Some generated Thai questions sounded unnatural and were difficult to understand. Explanations sometimes sounded more certain than the evidence supported, especially when discussing UTAUT2 scoring and comparing recalled selection times with recorded trial times. I had to question these explanations, simplify the wording and check the calculations against the responses. This taught me that faster document production still requires careful review.

My main lesson was that testing requires clear measurements and close observation. Participants could complete a task while still needing help to find Undo or a button outside the visible screen. I learned to record assistance alongside completion and duration. Comparing task results with questionnaire answers also showed that an easier selection process could coexist with unchanged mental effort and increased choice overload. As a tester in the AI era, I see my responsibility as defining what success means, checking evidence and explaining findings accurately. I need stronger skills in test design, statistics, usability observation and automated testing to judge AI output confidently.

Next year, I plan to practise writing clearer acceptance criteria, pilot questionnaires before collecting responses and define timing start and finish points before each session. I also want to improve my TypeScript and Vitest skills by writing regression tests for problems found during user testing. I will practise linking each issue to its severity, fix commit and retest result. In five years, my goal is to become a QA engineer who can plan testing from requirements through release, combine user research with automated checks and communicate risks clearly to developers. I want to use AI efficiently while taking responsibility for the quality of my decisions and reports.
