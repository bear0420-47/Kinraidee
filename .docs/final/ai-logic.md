# AI logic — Where, How, Prove, Measure

Every number below links to the file it comes from.

## Where

AI is used in **one** place in the running app: choosing the first three dishes of a shortlist and writing a short Thai reason for each.

| Situation | AI used? |
|---|---|
| First shortlist (`count = 3`) and more than 3 dishes match the conditions | Yes |
| Replacement after rejecting a card (`count = 1`) | No |
| 3 or fewer dishes match | No (nothing to choose between) |
| No `GEMINI_API_KEY`, timeout, error or invalid answer | No, the randomized rule-based fallback runs |

Code: `src/api/src/modules/recommendations/recommendations.service.ts` (`selectItems`) and `gemini-shortlist.adapter.ts`. Diagram: [D5 sequence](../../docs/02-design/diagrams-sequence-er.md).

AI coding agents were also used to build the project (the SDLC side). That is described in [`CLAUDE.md`](../../CLAUDE.md#how-the-team-uses-ai), with numbers in [`evidence/github-snapshot-2026-11-17.md`](../../evidence/github-snapshot-2026-11-17.md).

## How

1. **Rules first.** The database query returns only dishes that match the active budget, taste, food type and zone, are not deleted, have a photo, and were not already shown or rejected (`recommendations.repository.ts`).
2. **Effective conditions.** Normally the active or effective conditions are exactly what the user submitted. If an initial request has no match, the server deterministically finds the fewest condition changes that produce a result, using the fixed tie priority zone, budget, taste, then food type. The adjusted values become the effective conditions for filtering and are returned to the web with every changed field, its original and replacement value, and the result count. A one-card replacement never changes conditions.
3. **Small, mixed pool.** `selectDiverseCandidates` randomly picks up to 6 eligible dishes while preferring different restaurants. Gemini therefore sees a compact diverse pool, not every eligible dish.
4. **AI chooses.** Gemini (`GEMINI_MODEL`, default `gemini-3.5-flash-lite`) receives only those candidates as JSON (name, restaurant, price, food type, tastes, zone) and the effective conditions. It must return up to 3 `menuItemId`s with a Thai reason of at most 120 characters, in a fixed JSON schema. Settings: temperature 0.2, at most 400 output tokens, 5-second timeout (`EXTERNAL_PROVIDER_TIMEOUT_MS`).
5. **Server checks the answer.** It accepts the answer only if every ID is one of the candidate pool, there are no duplicates, there are at most 3, and they come from different restaurants when the pool allows it. Then each dish is marked `selection.source = "AI"`.
6. **Fallback.** On any AI failure the server randomly selects up to 3 dishes from the rule-filtered eligible list while preserving exclusions and restaurant diversity. This is a rule-based non-AI fallback, not a technically deterministic selection. The current API retains the legacy label `selection.source = "DETERMINISTIC"` to mean "not selected by AI."

Because the AI can only choose among dishes the rules already accepted, it cannot recommend a dish outside the response's effective conditions. When those conditions differ from the user's original submission, the response and UI disclose every automatic change. The AI may still make a weaker selection or write a less useful reason, but it cannot bypass the server's filtering and validation rules.

## Prove

### Unit tests (run with `pnpm verify`)

`src/api/src/modules/recommendations/recommendations.service.test.ts`:

| Test | Line |
|---|---:|
| uses one AI selection from a compact diverse pool for an initial request | 322 |
| falls back when AI returns an unknown candidate ID | 350 |
| falls back when the AI adapter rejects | 374 |
| bypasses AI for replacement and pools of three or fewer | 396 |
| uses at most one AI call after automatically adjusting conditions | 284 |

### Live provider check

`pnpm --filter api providers:verify`: Gemini received 6 candidates and returned 3 valid candidate IDs ([`docs/verification.md` line 1734](../../docs/verification.md)).

### Evaluation against a baseline

| Part | File |
|---|---|
| Requests collected | 18 conditions: budgets ฿50–100 and ฿101–200 × ("any" taste + 8 tastes); 5 fresh requests each; 90 production requests and 90 non-AI baseline requests |
| Analysis sample | Only complete three-dish responses with no automatic adjustment: 71 AI-selected production shortlists and 85 non-AI baseline shortlists |
| Baseline | The same API with no Gemini key (non-AI path), on a database seeded with the same catalog (22 restaurants, 224 recommendable dishes) |
| Eval script | [`evidence/ai-vs-non-ai-2026-11-16-script.py`](../../evidence/ai-vs-non-ai-2026-11-16-script.py) |
| Raw log (all 180 answers) | [`evidence/ai-vs-non-ai-2026-11-16-raw.json`](../../evidence/ai-vs-non-ai-2026-11-16-raw.json) |
| Method, results and limits | [`evidence/ai-vs-non-ai-2026-11-16.md`](../../evidence/ai-vs-non-ai-2026-11-16.md) |

## Measure

From [`evidence/ai-vs-non-ai-2026-11-16.md`](../../evidence/ai-vs-non-ai-2026-11-16.md): the experiment made 90 requests per side, but the comparison below uses only 71 complete AI-selected production shortlists and 85 complete non-AI shortlists with no automatic adjustment. Two-sided permutation tests compare those analysis samples.

| Measure | Non-AI | AI | Result |
|---|---|---|---|
| Shortlists with 3 different food types | 37 of 85 (44%) | 43 of 71 (61%) | AI higher |
| Different food types per shortlist (mean) | 2.31 | 2.59 | +0.29, p = 0.004 |
| Different tastes per shortlist (mean) | 3.41 | 3.76 | +0.35, p = 0.031 (weak; 4 measures tested) |
| Different restaurants per shortlist | 2.88 | 2.97 | no clear difference (p = 0.22) |
| Price spread within a shortlist | ฿32.7 | ฿31.3 | no difference (p = 0.60) |
| Answer time on production | about 0.3 s | median 1.55 s, p95 2.09 s | AI adds about 1.2–1.3 s |

How often AI is used on production: 76 of 90 requests (84%).

Are the AI's reasons true? Checked against the database for all 213 reasons:

- 197 of 199 reasons that state a price state the correct price.
- 49 of 49 reasons that name a restaurant name the right one.
- 188 of 213 reasons mention at least one of the dish's own taste labels.

## Limits

- This was one run on one day using 18 constructed condition sets, not choices submitted by a representative user sample. The catalog and Gemini model can change.
- The catalog covers restaurants around MFU, and only dishes with approved photos are recommendable. Missing restaurants, menu types, price ranges or photos can bias both the AI and non-AI results before Gemini is called.
- Gemini sees a randomly selected restaurant-diverse pool of at most 6 eligible dishes, not the complete eligible catalog. A different random pool can change the shortlist, so the measured difference combines candidate-pool variation with Gemini selection.
- The evaluation does not measure whether outcomes differ by dietary need, language, disability or another demographic group. No fairness conclusion can be made from these results.
- More variety is not proof that people like the AI's picks better. The user test (U01–U10) did not compare AI against non-AI. That needs a separate A/B test.
- The reasons check matches facts (price, restaurant, taste), not whether the reason is persuasive.
- The data cannot tell whether the 14 non-AI production answers were caused by too few candidates or by a Gemini failure.
