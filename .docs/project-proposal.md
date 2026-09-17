# Project Proposal for Software Engineering Case Studies

## Project Title: Kinraidee — Food Decision Assistant

**Team Members:**

- 6631503111 Butsarin Chomchat
- 6631503017 Natthanan Kaewsaengin
- 6631503050 Andrew Dicesare
- 6631503117 Siwagorn Pitaksinagorn 
- 6631503044 Suwaphit Vatidmatee 


**Date:** 02/09/2026  
**Document status:** Draft — pending team, requirements, and implementation-plan approval

## 1. Executive Summary

Kinraidee is a web-based food decision assistant for students and other meal seekers who struggle to decide what to eat. Evidence from 31 survey responses shows that 26 respondents experience this problem every day or about once per day, 24 particularly struggle at dinner or when alone or tired, and 24 are frustrated by repetitive menus or restaurants. Price, taste, food type, location, and delivery cost further constrain the decision.

The proposed system asks the user for a small set of conditions, such as budget, desired food type or taste, and area, then returns no more than three suitable restaurant or menu choices. Users can reject an unsuitable choice and receive a non-duplicate replacement during the same session. The core workflow will not require account registration or consent to unnecessary personalization. This focused approach is supported by 28 of 31 respondents who preferred short conditions followed by about three choices, compared with only 6 of 31 who requested one-click randomization.

The project follows a document-first, AI-native software development lifecycle. Product requirements are traceable to aggregated survey evidence, legal requirements, or explicitly documented operational assumptions. Privacy, authorization, retention, accessibility, input validation, and verification are treated as part of the product rather than as later additions.

## 2. Introduction and Problem Statement

Choosing a meal is a frequent but mentally demanding task, especially after study or work. Existing food applications often present large catalogs, repeated restaurants, or too many choices. They are useful for browsing and ordering but do not necessarily help a user reach a decision quickly.

The survey identified the following problems:

- **Decision fatigue:** 26/31 respondents face difficulty choosing food every day or about once per day (`P1`).
- **Difficult context:** 24/31 struggle at dinner, and 24/31 struggle when alone or tired from work or study (`P2`).
- **Repetition and choice overload:** 24/31 dislike seeing the same menus or restaurants, while 10/31 report that too many choices make the decision difficult (`P3`).
- **Unclear preferences:** 20/31 may reject a suggestion while still being unable to explain what they want (`P4`).
- **Budget sensitivity:** Price affects 25/31 respondents, and 25/31 usually spend THB 50–100 per meal (`P5`).
- **Meal-fit constraints:** Desired taste affects 22/31, and food type affects 17/31 (`P6`).
- **Location and delivery friction:** Distance, travel difficulty, and delivery cost can make a choice unsuitable (`P7`).
- **Group disagreement:** 10/31 experience disagreement in group choices, although only 3/31 explicitly requested a shared voting room (`P9`).

Kinraidee addresses these issues as a constrained decision assistant rather than a broad restaurant directory, an unconstrained random wheel, or a food-delivery marketplace. A user supplies only the conditions needed for the current meal, receives a small shortlist with decision-relevant information, and can quickly reject or replace choices.

## 3. Project Goals and Objectives

### Primary Goal

Reduce the time and mental effort required to choose a meal by returning a small, relevant, and explainable shortlist from a few session-specific conditions.

### Specific Objectives

1. Allow a user to enter a valid set of short meal conditions without creating an account (`F1`, `F6`).
2. Return at most three choices that satisfy every mandatory condition (`F2`, `NFR3`, `NFR8`).
3. Show estimated price, food type, area or distance, and a recommendation rationale when those data are available (`F3`).
4. Allow a user to reject a result and receive a non-duplicate replacement during the same session (`F4`, `F5`, `NFR9`).
5. Allow users to edit conditions or start a new session (`F7`).
6. Achieve a p95 recommendation response time of no more than two seconds against up to 500 active restaurant records in the defined test environment (`NFR1`).
7. Enable at least 80% of a usability-test group of at least five target users to complete the core workflow within 60 seconds without facilitator help (`NFR2`).
8. Protect users through data minimization, purpose limitation, authorization, retention controls, and privacy-aware logging (`LR1`–`LR17`, as applicable).

The numeric quality thresholds remain proposals until the human approver accepts the requirements.

## 4. Scope of Work

### 4.1 In-Scope Functionalities

#### Meal Seeker

- Enter budget, food type, desired taste, and manual area as session conditions (`F1`).
- Receive up to three matching restaurant or menu choices (`F2`).
- Compare available price, food type, area/distance, and recommendation rationale (`F3`).
- Reject a choice and receive another qualifying choice when available (`F4`).
- Avoid rejected-choice repetition within the same session (`F5`).
- Use the general recommendation flow without registration or optional personalization consent (`F6`).
- Edit conditions and start a new session (`F7`).
- Use current location only after notice and affirmative action, if GPS is approved for the MVP; refusal must leave a manual-area path available (`F9`, Should).
- Apply temporary food exclusions for the current session, subject to sensitive-data assessment (`F10`, Should).
- Request a random choice only from already-filtered results (`F12`, Should).

#### Authorized Restaurant-Data Administrator

- Create, update, and retire restaurant or menu records with boundary validation, role authorization, and minimized audit records (`F8`). This role and its inclusion in the first release require human confirmation because they are operational assumptions rather than survey findings.

#### Core System Capabilities

- Session-based recommendation and non-duplicate replacement.
- Fast filtering and retrieval using an approved restaurant/menu dataset.
- Input validation at every API boundary.
- Authorization for every protected API.
- Keyboard-operable core workflow.
- Privacy, consent, retention, audit, and traffic-log controls when their activating conditions apply.

### 4.2 Out-of-Scope Functionalities for the First Release

- Ordering, payment, or delivery fulfillment.
- Public user reviews.
- Health diagnosis or medical dietary advice.
- Automatic persistent storage of precise GPS coordinates or preference history.
- Operating as a certification authority or issuing digital certificates.
- Group voting, saved favorites, and personalized recommendation history, unless separately approved as later-scope features.
- Production deployment without separate human approval.

## 5. Methodology and Technical Approach

### 5.1 Development Methodology

The project will use an iterative, evidence-driven workflow with explicit approval gates:

1. **Discover:** validate intent, survey evidence, requirements, legal rules, and backlog.
2. **Design:** approve the implementation plan, architecture, data model, privacy decisions, and prototype.
3. **Build:** implement only the approved Must-level workflow in small, reviewable increments.
4. **Test:** verify functionality, performance, accessibility, input validation, authorization, privacy, and retention behavior.
5. **Review and deliver:** record findings, obtain pull-request approval, and request production approval separately.

Stakeholder feedback will be collected at requirement review, design review, prototype/usability testing, and final acceptance. Existing approved evidence will be archived before any replacement.

### 5.2 Proposed System Architecture

A three-tier web architecture is proposed, subject to approval in the implementation plan:

- **Frontend/client:** collects session conditions and presents up to three recommendations, explanations, and reject/replace controls.
- **Application/API layer:** validates inputs, applies mandatory filters, selects or ranks results, manages session exclusions, and enforces authorization on protected operations.
- **Data layer:** stores restaurant/menu records and only approved operational, consent, audit, or traffic data. Raw GPS is not stored by default.

### 5.3 Technology Stack

- **Application language:** TypeScript, as required by the repository conventions.
- **Frontend framework:** TBD during approved architecture design.
- **Backend/API framework:** TBD during approved architecture design.
- **Database technology:** TBD; selection must support required constraints, indexing, retention, and deletion behavior.
- **Deployment boundary:** TBD; no production deployment without explicit human approval.
- **Quality controls:** automated build, test, lint, performance, input-boundary, and authorization checks.

Technology choices are intentionally not presented as final because the current implementation plan is awaiting approval.

## 6. Risk Assessment and Mitigation Plan

| Risk | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|
| Requirements or plan remain unapproved | Medium | High | Hold application coding until separate human approval of the intent/specification and implementation plan; record decisions in the decision log. |
| Recommendation results do not feel useful | Medium | High | Test with target users; use mandatory filters; show rationale; measure completion time and rejection behavior; revise ranking only with recorded evidence. |
| Restaurant/menu data become stale or incomplete | High | High | Confirm a data owner; record source and freshness where relevant; allow authorized retirement/update; never present unavailable or stale fields as current facts. |
| Too few records match strict conditions | Medium | Medium | Return fewer than three honest matches and identify which constraint the user may relax; never invent results or violate mandatory filters. |
| Response time exceeds the two-second p95 target | Medium | High | Define a reproducible test environment; index approved query fields; test with up to 500 active records; measure and optimize before acceptance. |
| Sensitive food exclusions reveal health or religion | Medium | High | Keep exclusions session-only by default; conduct a sensitive-data assessment before persistent processing; apply explicit consent only when legally applicable. |
| GPS or personal data are collected unnecessarily | Medium | High | Use manual area by default; request GPS only after notice and affirmative action; do not persist raw coordinates; expire session processing within 30 minutes or at session end. |
| Unauthorized restaurant-data changes or personal-data disclosure | Medium | High | Authenticate administrators, authorize every protected API, validate inputs, minimize audit data, and test expected 401/403 responses. |
| Legal retention duties are assumed incorrectly | Medium | High | Treat Computer Crime Act Section 26 controls as Conditional Must; require an accountable human to confirm applicability and required fields before configuration. |
| Survey sample does not represent all users | Medium | Medium | State the 31-response limitation; conduct usability testing with target users; avoid generalizing findings beyond the evidence. |
| Scope expands into delivery, payments, or broad social features | Medium | High | Prioritize `F1`–`F8`; keep Could features deferred; route changes through requirement and plan approval with traceability. |
| Team knowledge or availability becomes uneven | Medium | Medium | Keep decisions and verification in repository evidence; use small reviewed changes and shared documentation; avoid undocumented single-person ownership. |

## 7. Milestones and Timeline

The timeline below follows the official Week 4–Week 11 course schedule supplied by the team. Kinraidee activities and deliverables are aligned with the phase and classroom focus of each week. The BUILD period runs from W6 through W8, and every function included in the approved BUILD scope must be implemented and integrated by Alpha Demo Day on October 7, 2026. Estimated team hours remain to be assigned after scope lock.

| Week | Date | Phase | Course Focus | Kinraidee Key Tasks | Reporting / Deliverable | Est. Team Hours |
|:---:|:---:|:---:|---|---|---|:---:|
| W4 | Sep 2, 2026 | **DISCOVER** | Design with agents: feature list, user journey, prototype, architecture, and four diagrams | Finalize the evidence-traced feature list; map the meal-seeker journey; design the condition-entry, shortlist, and reject/replace prototype; draft the system architecture and four required diagrams; record unresolved GPS, data-owner, framework, and database decisions. | Feature list, user journey, prototype, architecture draft, and four diagrams. | TBD |
| W5 | Sep 9, 2026 | **DISCOVER** | User Validation Gate: proposal, backlog, design, and compliance review | Validate the proposed workflow with target users; revise the proposal, backlog, and design from evidence; review PDPA, sensitive food data, location use, authorization, retention, and conditional traffic-log requirements; obtain requirement and plan decisions before coding. | User-validation evidence; updated proposal and backlog; design package; compliance review; **DISCOVER Phase Gate submission**. | TBD |
| W6 | Sep 16, 2026 | **BUILD** | Scope lock, Sprint 0, repository setup, AI agents and MCP workshop | Lock the complete BUILD scope and assign every approved function to W6–W8; set up the TypeScript frontend, API, database, validation, test workflow, and synthetic/non-personal restaurant dataset. Build condition entry for budget, food type, taste, and area (`F1`); the up-to-three-choice recommendation flow (`F2`); recommendation details and rationale (`F3`); and general use without account registration (`F6`). | Approved BUILD scope and function allocation; working project foundation; completed `F1`, `F2`, `F3`, and `F6` vertical flow. | TBD |
| W7 | Sep 23, 2026 | **BUILD** | Architecture design studio and build sprint | Finalize architecture decisions and diagrams. Build reject-and-replace (`F4`), same-session duplicate prevention (`F5`), edit conditions and start a new session (`F7`), and authorized restaurant/menu data administration (`F8`) if confirmed in the approved scope. Add API-boundary validation, protected-operation authorization, session-state handling, and initial tests for the completed functions. | Architecture baseline; completed `F4`, `F5`, `F7`, and approved `F8`; integrated core workflow with initial test evidence. | TBD |
| W8 | Oct 7, 2026 | **BUILD** | UI/UX, final build sprint, and Alpha Demo Day | Complete the UI/UX and all remaining functions included in the approved BUILD scope: optional session-only location with manual-area fallback (`F9`), temporary food exclusions (`F10`), non-repetitive alternatives (`F11`), and random selection from already-filtered results (`F12`), when approved for the MVP. Integrate all W6–W8 functions, resolve blocking defects, and complete an end-to-end Alpha build. Deferred Could features (`F13`–`F16`) are excluded unless a formally approved scope change activates them. | **Feature-complete Alpha release containing every function in the approved BUILD scope**, updated repository evidence, function-completion checklist, and Alpha Demo Day presentation. | TBD |
| W9 | Oct 14, 2026 | **TEST** | Testing and UAT, Testing Pyramid, and online IT Audit guest session | Execute unit and integration tests following the Testing Pyramid; test API boundaries, mandatory-filter correctness, non-repetition, and protected-API authorization; conduct first-round UAT and record defects without weakening tests. | Test results, UAT feedback, defect list, and initial verification record. | TBD |
| W10 | Oct 21, 2026 | **TEST** | AI Governance and IT/AI Law lecture; onsite guest session | Apply governance and legal-review findings to PDPA notices, session-only location, sensitive food exclusions, audit/traffic-log separation, retention, and deletion decisions; run privacy/log and authorization checks; update compliance evidence where required. | Updated compliance assessment, privacy/security verification evidence, and resolved or tracked legal findings. | TBD |
| W11 | Oct 28, 2026 | **TEST** | Beta Review Day and impact metrics | Complete regression, performance, keyboard-accessibility, and usability testing; measure the two-second p95 and 60-second workflow targets; resolve critical defects; prepare and demonstrate the Beta release with evidence-backed impact metrics. | Beta release, verification summary, UAT and impact metrics, review findings, and **Beta Review Day presentation**. | TBD |

Activities after Week 11—including final documentation, delivery, pull-request approval, and any production deployment—must be planned separately. Production deployment still requires explicit human approval.

## 8. Ethical Considerations

### 8.1 Privacy and Data Minimization

General recommendations will work without account creation. Session conditions will not be retained by default. Raw GPS will be requested only after a purpose notice and affirmative action, will not be stored in the database by default, and will expire at session end or within 30 minutes, whichever occurs first. The manual-area path will remain available when location access is declined.

### 8.2 Sensitive Food Information

Food exclusions can reveal health, religion, or other sensitive characteristics. Kinraidee will use temporary exclusions only for the disclosed recommendation purpose. Persistent storage or personalization will require a documented lawful basis, sensitive-data assessment, access rule, retention period, deletion behavior, and any legally applicable consent.

### 8.3 Transparency and User Control

Each result will display available decision information and a recommendation rationale. Missing information will be identified rather than invented. Users can reject results, edit conditions, reset the session, and use the core service without unnecessary personalization consent.

### 8.4 Security and Accountability

All API inputs will be validated at the boundary, and protected APIs will verify permissions. Logs must contain no passwords, authentication tokens, email addresses, raw GPS coordinates, or unnecessary food-restriction details. Administrative mutations will create minimized audit evidence. Required traffic logs, if legally applicable, will be separated from application audit logs.

### 8.5 Retention and Data-Subject Rights

No persistent personal-data field will be implemented until its purpose, lawful basis, access role, retention period, and deletion behavior are approved. When personal data is stored, the system must provide appropriate access, correction, and deletion handling. Data no longer required and without another lawful reason must be deleted, destroyed, or anonymized.

### 8.6 Accessibility and Inclusion

The complete core workflow will be keyboard-operable without a blocking step. Usability testing will measure whether target users can complete the workflow quickly without assistance. The team will avoid presenting medical or dietary recommendations beyond the system's evidence and scope.

## 9. Expected Deliverables

1. An approved project intent, Software Requirements Specification, product backlog, traceability, and legal/compliance requirements.
2. UX/UI design artifacts and an approved implementation plan.
3. A functional TypeScript web application implementing the approved Kinraidee core workflow.
4. An approved restaurant/menu dataset process using synthetic or otherwise authorized data.
5. Automated unit, integration, input-boundary, authorization, performance, and recommendation-behavior tests.
6. Recorded build, test, lint, accessibility, privacy/log, and usability verification results.
7. Technical documentation, user guidance, review report, and decision log.
8. A final presentation and live demonstration.
9. A deployment package only after separate production approval.

## 10. Conclusion

Kinraidee responds to a well-supported user problem: many meal seekers repeatedly struggle to choose food, particularly at dinner and when tired, while large and repetitive catalogs increase rather than reduce decision effort. The proposed system narrows the task to a short, explainable shortlist that respects budget, food preference, and area constraints, then supports rapid rejection and replacement without forcing registration.

The project is intentionally focused. It does not attempt to become a food-delivery platform or make medical decisions. Its success will be measured through response time, constraint correctness, non-repetition, keyboard accessibility, and observed user completion time. With explicit approval gates, requirement traceability, and conditional handling of privacy and legal obligations, Kinraidee offers both practical user value and a disciplined software engineering learning outcome.

## 11. References

1. Kinraidee Project Team. (2026). *Intent: Kinraidee Food Decision Assistant*. `.docs/01-requirements/intent.md`.
2. Kinraidee Project Team. (2026). *Specification: Kinraidee Food Decision Assistant*. `.docs/01-requirements/01-spec/20260828-01-kinraidee-food-recommendation.md`.
3. Kinraidee Project Team. (2026). *Kinraidee Product Backlog*. `.docs/01-requirements/backlog.md`.
4. Kinraidee Project Team. (2026). *Kinraidee User Survey Summary* (31 responses; aggregate data only). `evidence/survey-summary.md`.
5. Kinraidee Project Team. (2026). *Legal & Compliance Rules*. `.docs/rule.md`.
6. Kinraidee Project Team. (2026). *Implementation Plan*. `.docs/plan.md`.
7. Course-provided example. (2026). *Project Proposal Template for Software Engineering Seminar*.
