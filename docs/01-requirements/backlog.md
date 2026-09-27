# Kinraidee Product Backlog

## Status

Approved — synchronized with specification `20260828-01-kinraidee-food-recommendation.md` and approved as the implementation-planning baseline on 2026-09-27.

## MoSCoW prioritization

The priorities below use the MoSCoW method:

- **Must have**: required for the approved first-release core workflow, or required whenever its stated legal condition applies.
- **Should have**: important, but the first release can still operate without it.
- **Could have**: valuable enhancement that is deferred unless separately approved.
- **Won't have (this release)**: intentionally outside the first-release scope.

### Must have — core release

| ID | Backlog item | Priority | Traces to | Acceptance reference | Status |
|---|---|---|---|---|---|
| B1 | Capture short meal conditions | Must | F1; P1, P2, P5, P6, P7 | F1, NFR4 | Ready for review |
| B2 | Return a shortlist of up to three qualifying choices | Must | F2; P1, P3, P8 | F2, NFR1, NFR3, NFR8 | Ready for review |
| B3 | Display useful decision details and rationale | Must | F3; P4, P5, P6, P7 | F3 | Ready for review |
| B4 | Reject a choice and receive a replacement | Must | F4; P4 | F4, NFR9 | Ready for review |
| B5 | Prevent rejected-choice repetition within a session | Must | F5; P3, P4 | F5, NFR9 | Ready for review |
| B6 | Provide the core workflow without account or personalization consent | Must | F6; P1; LR2 | F6, LR2 | Ready for review |
| B7 | Edit conditions and start a new session | Must | F7; P1, P2 | F7 | Ready for review |
| B8 | Authorize catalog administration | Must | F8; OA1; LR8 | F8, NFR4, NFR5 | Scope approved by human approver; covers zones, food types, tastes, restaurants, and menu items |
| B9 | Apply purpose notice, minimization, and purpose limitation | Must | LR1, LR3, LR7, LR9 | LR1, LR3, LR7, LR9; NFR6 | Ready for review |
| B10 | Define and verify quality thresholds | Must | NFR1, NFR2, NFR3, NFR4, NFR5, NFR6, NFR7, NFR8, NFR9, NFR10, NFR11, NFR12 | NFR1, NFR2, NFR3, NFR4, NFR5, NFR6, NFR7, NFR8, NFR9, NFR10, NFR11, NFR12 | NFR1 warm p95 and NFR2 usability thresholds approved |
| B24 | Diversify each shortlist across restaurants | Must | F19; Charter §5.2; P3, P8 | F19 | Scope approved by human approver |

### Must have — when activated

These are Must items only when the stated design or legal condition applies. Their activation must be approved by the accountable human; they are not optional once activated.

| ID | Backlog item | Priority | Traces to | Acceptance reference | Status |
|---|---|---|---|---|---|
| B15 | Record separate consent and electronic-agreement evidence | Must when activated | LR14, LR15, LR16 | LR14, LR15, LR16, NFR11 | Activation depends on design |
| B16 | Provide personal-data access, correction, and deletion handling | Must when activated | LR6, LR9 | LR6, LR9 | Activated by registered-account data; account deletion is hard delete and cascades account-owned rows; access/correction request handling still needs issue-level workflow detail |
| B17 | Retain and protect required traffic data | Conditional Must | LR10, LR11, LR12, LR13 | LR10, LR11, LR12, LR13 | Legal applicability pending |

### Should have

| ID | Backlog item | Priority | Traces to | Acceptance reference | Status |
|---|---|---|---|---|---|
| B12 | Provide temporary food exclusions | Should | F10; P6; LR3, LR4 | F10, LR3, LR4 | Sensitive-data assessment needed |
| B13 | Surface non-repetitive alternatives | Should | F11; P3 | F11 | Ready for review |
| B14 | Randomly choose from already-filtered results | Should | F12; P8 | F12, NFR8 | Ready for review |
| B19 | Save favorite menu items | Should | F14; P6; LR1, LR6 | F14 | Scope approved for registered users |
| B20 | View selected-menu history | Should | F15; P3; LR1, LR3, LR6 | F15 | Scope approved for registered users |
| B22 | Save default recommendation settings | Should | F17; P1, P5, P6; LR1, LR3, LR6 | F17 | Scope approved for registered users |
| B23 | Register, log in, and log out | Should | F18; LR1, LR2, LR6, LR8 | F18, NFR4, NFR5, NFR6 | Scope approved; email verification, password reset, and password change are deferred |

### Could have

| ID | Backlog item | Priority | Traces to | Acceptance reference | Status |
|---|---|---|---|---|---|
| B18 | Create a shared voting room | Could | F13; P9 | F13 | Deferred |
| B21 | Show reliable promotions, fees, and ratings | Could | F16; P5, P7 | F16 | External data source needed; wait-time data is out of product scope |

### Won't have — first release

- Ordering, payment, or delivery fulfillment.
- Public review publishing.
- Health diagnosis or medical dietary advice.
- Automatic persistent GPS, food-exclusion, rejected-item, or full recommendation-session collection.
- Session-only GPS location in the first release; manual `Zone` selection is used instead.
- Certification-authority or certificate-issuance functions.

## Traceability audit summary

- Every Must product requirement F1–F8 and F19 has at least one backlog row.
- Every numbered legal requirement LR1–LR17 has at least one backlog row, either directly or as a grouped legal implementation item.
- Every backlog row identifies a product requirement, legal requirement, NFR, research pain, or documented operational assumption.
- Items depending on unresolved legal applicability, sensitive-data assessment, or operational ownership are explicitly marked rather than assumed.
