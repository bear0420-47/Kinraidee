# Discovery evidence — what we collected and what we did not

Recorded 2026-11-17. This file states the type of each discovery source so that no number is mistaken for interview data.

## Interviews: not conducted

The team did **not** run one-to-one user interviews. In their place the discovery phase uses one primary survey and two secondary studies, each labelled below. The 10 usability-test sessions (U01–U10) came later and are test evidence, not discovery interviews.

## PRIMARY — user survey (31 responses)

| Field | Value |
|---|---|
| Type | Online questionnaire (Google Forms), 10 questions: 9 closed, 1 open "tell us about the last time you could not decide what to eat" |
| Responses | 31, submitted 2026-08-22 to 2026-08-25 |
| Open-text stories | 23 of 31 respondents wrote a substantive answer to the open question |
| Aggregate results | [`survey-summary.md`](survey-summary.md) (P1–P9) |
| Recount | All counts in `survey-summary.md` were recounted from the form export on 2026-11-17 and match |
| Raw data | Kept outside the repository by the team. It contains respondent email addresses and timestamps, so it is not committed (AGENTS.md: raw survey responses and email addresses must not be committed) |

Limits: a convenience sample of 31, mostly students; checkbox questions sometimes received more choices than the stated maximum; answers describe stated pain and preference, not observed behaviour.

## SECONDARY — published research

These studies are not about Kinraidee users. They are used only to support the design choice of returning a small shortlist (up to three dishes) instead of a long list.

| ID | Source | What it supports | Limits |
|---|---|---|---|
| S1 | Iyengar, S. S., & Lepper, M. R. (2000). When choice is demotivating: Can one desire too much of a good thing? *Journal of Personality and Social Psychology, 79*(6), 995–1006. https://doi.org/10.1037/0022-3514.79.6.995 | In field and lab studies, people offered a large set of options (24 or 30) were less likely to choose and less satisfied than people offered a small set (6). | US participants; jam, chocolate and essay-topic choices, not meals; the effect does not replicate in every setting (see S2). |
| S2 | Scheibehenne, B., Greifeneder, R., & Todd, P. M. (2010). Can there ever be too many options? A meta-analytic review of choice overload. *Journal of Consumer Research, 37*(3), 409–425. https://doi.org/10.1086/651235 | A meta-analysis of 50 experiments: on average the choice-overload effect is close to zero, but it appears under some conditions, for example when people lack clear preferences. | It weakens S1 as a general rule. It supports a short list only for users without a clear preference, which matches survey item P4 (20/31 "the suggested food is unwanted, but I still don't know what I want"). |

## How the evidence feeds the backlog

`docs/01-requirements/backlog.md` traces every Must item to survey findings P1–P9, a legal rule, or a recorded operational assumption (OA1–OA3). S1 and S2 add outside support for B2 ("return up to three choices") and are not the sole basis for any requirement.
