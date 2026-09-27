# Project Charter — binding constraints

## Status

Extract, recorded 2026-09-06. **Not the authoritative document.**

Authoritative source: *Project charter: Kinraidee — Food Decision Assistant*, dated 02/09/2026, status "Draft — pending team, requirements, and implementation-plan approval".

This file exists so that a citation like "charter §5.2" resolves inside the repository. It records only the clauses the requirements and design layers trace to. If the charter is revised, update this file in the same change and re-run `/audit-design`.

---

## §3 — Specific objectives

1. Enter a valid set of short meal conditions without creating an account (F1, F6).
2. Return at most three choices that satisfy every mandatory condition (F2, NFR3, NFR8).
3. Show estimated price, food type, area or distance, and a recommendation rationale when available (F3).
4. Reject a result and receive a non-duplicate replacement during the same session (F4, F5, NFR9).
5. Edit conditions or start a new session (F7).
6. Warm p95 recommendation response time ≤ 2 seconds against up to 500 non-deleted restaurant records; free-tier hosting cold-start latency is measured separately (NFR1).
7. ≥ 80% of a usability-test group of ≥ 5 target users complete the core workflow within 60 seconds unaided (NFR2).
8. Protect users through data minimization, purpose limitation, authorization, retention controls, and privacy-aware logging (LR1–LR17).

> "The numeric quality thresholds remain proposals until the human approver accepts the requirements."

## §4.1 — In scope

**Meal Seeker:** F1 budget/food type/taste/manual zone · F2 up to three choices · F3 price, food type, zone, rationale · F4 reject · F5 no rejected-choice repetition in session · F6 no registration or personalization consent · F7 edit conditions and new session · F9 current location after notice, *Won't have in the first release* · F10 temporary food exclusions, *Should* · F12 random choice from already-filtered results, *Should*.

**Authorized Restaurant-Data Administrator:** F8 create, update, and soft-delete restaurant/menu records with boundary validation, role authorization, and minimized audit records. Soft deletion sets `deletedAt`; records remain available only while `deletedAt = null`. The charter states this role "require[s] human confirmation because they are operational assumptions rather than survey findings" (tracked as `OA1`).

**Core system capabilities:** session-based recommendation and non-duplicate replacement · fast filtering over an approved dataset · input validation at every API boundary · authorization for every protected API · keyboard-operable core workflow · privacy, consent, retention, audit, and traffic-log controls when their activating conditions apply.

## §4.2 — Out of scope for the first release

Ordering, payment, or delivery fulfillment · public user reviews · health diagnosis or medical dietary advice · automatic persistent storage of precise GPS, food exclusions, rejected items, displayed shortlists, or full recommendation-session conditions · operating as a certification authority · group voting unless separately approved · production deployment without separate human approval.

The human approver activated optional registered accounts, menu-item favorites, selected-menu history, and saved default recommendation settings for the full-app build on 2026-09-26. Anonymous access to the core workflow remains mandatory.

## §5.2 — Proposed system architecture

The charter names **six** components. D3 must contain all six.

| # | Component | Charter wording |
|---|---|---|
| 1 | **User Interface** | "Allows users to enter conditions such as budget, food type, taste, and area, and displays up to three recommended menus." |
| 2 | **Backend API** | "Handles requests from the web application, retrieves relevant data, and connects the user interface with the recommendation logic and database." |
| 3 | **Recommendation Logic** | "Uses rule-based filtering and ranking to select menus that match the user's conditions. The results will also consider **restaurant diversity to avoid recommending all options from the same restaurant**." |
| 4 | **Session Management** | "Uses browser session storage to keep track of previously shown or rejected menu IDs, preventing duplicate recommendations within the same session without requiring users to log in." |
| 5 | **Database** | "Stores restaurant and menu information … including menu names, prices, food types, tastes, areas, and their associated restaurants." |
| 6 | **Admin Interface** | "Allows authorized administrators to create, view, update, and delete restaurant and menu data. Authentication and authorization are required before accessing administrative functions." |

## §5.3 — Technology stack

- **Frontend:** React, with TypeScript.
- **Backend:** Express.js REST APIs, with TypeScript.
- **Database:** PostgreSQL.

## §7 — Schedule

| Week | Date | Phase | Deliverable |
|---|---|---|---|
| W4 | 2026-09-02 | DISCOVER | Feature list, user journey, prototype, architecture draft, four diagrams |
| W5 | 2026-09-09 | DISCOVER | **Phase Gate** — user validation, updated proposal and backlog, design package, compliance review |
| W6 | 2026-09-16 | BUILD | Scope lock, project foundation, F1, F2, F3, F6 |
| W7 | 2026-09-23 | BUILD | Architecture baseline, F4, F5, F7, F8 if approved |
| W8 | 2026-10-07 | BUILD | **Alpha Demo Day** — feature-complete against approved BUILD scope; F10, F11, F12 when approved; F9 is outside the first release |
| W9 | 2026-10-14 | TEST | Unit and integration tests, first-round UAT |
| W10 | 2026-10-21 | TEST | Governance and legal review applied |
| W11 | 2026-10-28 | TEST | **Beta Review Day** — regression, performance, accessibility, usability; measure the warm 2 s p95, report free-tier cold start separately, and measure the 60 s target |

F13 and F16 remain deferred. F14 and F15 were activated by the human approver for the full-app build on 2026-09-26, and F17 covers saved default recommendation settings.

## Resolved charter traceability

- Charter §5.2 restaurant diversity is implemented by F19 and backlog item B24.
