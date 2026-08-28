# Intent: Kinraidee Food Decision Assistant

## Status

Draft — recorded from the approved survey summary on 2026-08-28. Requirements still require explicit human approval before Design or Build treats them as final.

## Problem

Students and other meal seekers frequently cannot decide what to eat, especially after study or work and during dinner. Existing food applications expose many repetitive choices, while users often know only that they do not want a proposed option. Price, desired taste, food type, distance, and delivery cost further constrain the decision.

## Users and stakeholders

- Primary user: a student or meal seeker choosing food alone under time, energy, or budget constraints.
- Secondary user: friends, partners, or families deciding together.
- Supporting actor: an authorized restaurant-data administrator.
- Governance stakeholders: system operators, privacy/compliance reviewers, and the human project approver.

## Research pains

- `P1 — Decision fatigue`: 26/31 respondents face the problem every day or about once per day.
- `P2 — Evening and fatigue context`: 24/31 struggle with dinner; 24/31 struggle when alone or tired from work/study.
- `P3 — Choice overload and repetition`: 24/31 are frustrated by repeated menus/restaurants; 10/31 report too many choices.
- `P4 — Unclear preference`: 20/31 reject a suggestion while still being unable to say what they want.
- `P5 — Budget sensitivity`: 25/31 consider price important; 25/31 usually spend THB 50–100 per meal.
- `P6 — Meal fit`: desired taste affects 22/31 and food type affects 17/31.
- `P7 — Location and delivery friction`: distance, travel difficulty, and delivery cost cause rejection or frustration.
- `P8 — Constrained shortlist over pure randomization`: 28/31 want short conditions followed by about three choices, while only 6/31 request one-click randomization.
- `P9 — Group choice`: 10/31 experience group disagreement, but only 3/31 explicitly request a shared voting room.

Full aggregate evidence and limitations are recorded in `evidence/survey-summary.md`.

## Goal and success criteria

### Goal

Reduce the time and mental effort needed to choose a meal by accepting a few session-specific conditions and returning about three suitable restaurant or menu choices, without requiring account registration or unnecessary personalization consent.

### Proposed success criteria

- At least 80% of a usability-test group of at least five target users completes the core workflow within 60 seconds without facilitator help.
- Each recommendation round returns no more than three choices unless fewer than three records satisfy the mandatory filters.
- A user can reject a choice, receive a replacement, edit conditions, and start a new session without creating an account.
- Every product backlog item traces to a research pain, legal requirement, or documented operational assumption.
- Build, test, lint, privacy, and authorization checks must pass before implementation is reported complete.

The numeric thresholds above are proposed acceptance thresholds and remain subject to human approval.

## Core workflow

1. User opens Kinraidee without signing in.
2. User enters short meal conditions such as budget, food type, desired taste, and area.
3. System returns up to three matching restaurants or menu choices with useful decision information.
4. User selects a choice or rejects it.
5. System supplies a non-duplicate replacement when another matching choice exists.

## Scope

### In scope

- Session-based meal conditions and recommendation.
- A shortlist of about three results.
- Price, food type, area/distance, and recommendation rationale.
- Reject-and-replace behavior without repetition in the same session.
- General use without an account.
- Authorized restaurant/menu data management.
- Optional session-only location use after notice.
- Privacy, authorization, consent evidence, retention, and audit handling required by `doc/rule.md`.

### Out of scope for the first release

- Ordering, payment, or delivery fulfillment.
- Public user reviews.
- Health diagnosis or medical dietary advice.
- Automatically retaining precise GPS or preference history.
- Operating a certification authority or issuing digital certificates.
- Production deployment without separate human approval.

## Constraints and risks

- Product: the first release must optimize the one core decision workflow rather than become a complete food-delivery marketplace.
- Evidence: the sample has 31 responses and does not prove demand in every population.
- Legal/compliance: follow `doc/rule.md`; conditional legal applicability must be confirmed by an accountable human.
- Privacy: food restrictions may reveal sensitive characteristics and must be assessed before storage or personalization.
- Data quality: price, location, availability, and menu details can become stale and require an explicit ownership process.
- External data: promotions, delivery cost, rating, and wait time depend on reliable sources and are not assumed available.

## Assumptions and open questions

- Should the first dataset cover only Mae Fah Luang University and nearby restaurants?
- Will area be selected manually in the MVP, or will GPS be included?
- Who owns and verifies restaurant/menu records?
- Does the deployed service fall within Computer Crime Act Section 26 traffic-data obligations? This requires accountable legal confirmation.
- Are THB 50–100 and the 60-second usability threshold appropriate final acceptance values?

## Approval

- Decision: Pending
- Approved by:
- Date:

