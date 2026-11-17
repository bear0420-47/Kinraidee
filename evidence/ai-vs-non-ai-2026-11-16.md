# AI picks compared with non-AI picks

- Date: 2026-11-16
- Question: when Gemini chooses the first three dishes, is the shortlist measurably different from the non-AI choice?
- This is an automated comparison. It does not measure whether people prefer the AI's picks.

## Method

- AI side: the production site (`https://kinraidee-512615.web.app`), where Gemini picks 3 of at most 6 candidates.
- Non-AI side: a local copy of the API with no Gemini key, on a local database seeded with the same catalog (22 restaurants, 224 recommendable dishes).
- 18 conditions: budgets ฿50–100 and ฿101–200, each with "any taste" and the 8 tastes; food type and zone left as "any".
- 5 fresh three-dish requests per condition on each side: 90 requests per side, 180 in total, 0 errors.
- Compared only complete three-dish answers with no automatic adjustment: 71 AI shortlists (every dish marked `AI`) and 85 non-AI shortlists, over the same 17 conditions.
- Script and raw answers: `ai-vs-non-ai-2026-11-16-script.py`, `ai-vs-non-ai-2026-11-16-raw.json`.

## Results

| Measure | AI (n=71) | Non-AI (n=85) | Difference |
|---|---|---|---|
| Shortlists with 3 different food types | 43 of 71 (61%) | 37 of 85 (44%) | AI higher |
| Different food types per shortlist (mean) | 2.59 | 2.31 | +0.29, p = 0.004 |
| Different tastes covered per shortlist (mean) | 3.76 | 3.41 | +0.35, p = 0.031 |
| Different restaurants per shortlist (mean) | 2.97 | 2.88 | +0.09, p = 0.22 (no clear difference) |
| Price spread within a shortlist (mean, baht) | 31.3 | 32.7 | −1.4, p = 0.60 (no difference) |
| Share of dishes that were new across the 5 repeats | 0.68 | 0.66 | no difference |

p-values are two-sided permutation tests with 20,000 shuffles.

AI use and speed on production:

- 76 of 90 production answers (84%) were chosen by AI. The other 14 used the non-AI path; 8 of those were "sour" requests, which have few matching dishes. The data cannot separate "too few candidates" from "Gemini failed and the fallback ran".
- AI answer time: median 1.55 s, 95th percentile 2.09 s, slowest 3.15 s (n=71). The non-AI path on production took 0.27–0.34 s in 4 one-dish requests measured on 2026-11-16, so AI adds roughly 1.2–1.3 s.

Accuracy of the AI's written reasons (213 reasons from the 71 AI shortlists):

- 199 state a price; 197 state the correct price. The 2 others gave a wrong price range ("120 ถึง 200 บาท" for a ฿101–200 budget, and "199 บาทหรือต่ำกว่า" for a ฿159 dish).
- 49 name a specific restaurant; all 49 name the right one.
- 188 mention at least one of the dish's own taste labels.
- 212 of 213 reason texts are different from each other.

## Limits

- The non-AI side ran on a local machine, so its speed is not comparable; only production timings are quoted.
- One run on one day; the catalog and the Gemini model can change.
- Four variety measures were tested, so the taste result (p = 0.031) is weak evidence on its own. The food-type result is the solid one.
- More variety is not the same as better recommendations. A user test is needed for that.
