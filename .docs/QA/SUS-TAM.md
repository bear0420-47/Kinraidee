# SUS and TAM — Kinraidee

**Status:** Draft evidence gap — no SUS or TAM responses were found in the repository as of 2026-11-17.

This document is intentionally explicit about the missing data. The existing 10 tester responses contain a UTAUT2-based questionnaire and pain-point ratings, but they do not contain a SUS instrument or a separately defined TAM instrument. Their scores must not be relabelled as SUS or TAM.

## SUS questionnaire and scoring plan

Use the standard 10-item System Usability Scale after the participant completes the core workflow. Respondents answer each item from 1 (strongly disagree) to 5 (strongly agree), using the standard alternating positive/negative wording. Record only anonymous codes such as U01–U10.

For each respondent:

1. For odd-numbered items, subtract 1 from the response.
2. For even-numbered items, subtract the response from 5.
3. Add the ten adjusted values and multiply by 2.5.
4. Report respondent scores, mean, median, standard deviation, and response count. Do not claim a population result from this convenience sample.

**Current result:** `Not available — no SUS items or SUS responses are present in the committed test evidence.`

## TAM questionnaire and scoring plan

Use a clearly labelled, Kinraidee-specific TAM questionnaire rather than calling the existing UTAUT2 items TAM. Use a 1–5 agreement scale and at least three items per construct:

| Code | Construct | Draft item |
|---|---|---|
| PU1–PU3 | Perceived usefulness | Kinraidee helps me decide what to eat; improves my decision process; helps me complete the task effectively. |
| PEOU1–PEOU3 | Perceived ease of use | Learning the workflow is easy; the steps are clear; becoming skilful is easy. |
| BI1–BI3 | Behavioural intention | I intend to use Kinraidee again; I would use it when undecided; I expect to use it in the next month. |

For each construct, calculate the respondent mean across answered items, then report the group mean, median, sample standard deviation, and `n`. State the exact item version and missing-response rule. This draft is not a validated Thai translation and should be labelled TAM-based if used.

**Current result:** `Not available — no separately collected TAM responses are present in the committed test evidence.`

## Collection plan

1. Obtain consent using the existing [participant consent form](participant-consent-form.md).
2. Ask the SUS and TAM questions immediately after the same core workflow used by U01–U10.
3. Store response rows under anonymous codes only; do not commit names, emails, raw timestamps or identifying free text.
4. Add the anonymized response table and calculation output to this document, then link the exact test run from [user-test-results-2026-11-02.md](user-test-results-2026-11-02.md).

Until this collection is completed, the presentation must say that SUS/TAM results are unavailable rather than substitute UTAUT2 scores.
